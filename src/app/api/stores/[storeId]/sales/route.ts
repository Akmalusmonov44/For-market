import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreMember } from "@/lib/permissions";
import { saleSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

    const sales = await prisma.sale.findMany({
      where: { storeId: params.storeId },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ sotuvlar: sales });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Har qanday store a'zosi (sotuvchi ham) sotuv qila oladi
    await requireStoreMember(user.id, params.storeId);

    const body = await req.json();
    const data = saleSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1) Barcha mahsulotlarni shu store ichidan olamiz va qulflab tekshiramiz
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, storeId: params.storeId },
      });

      if (products.length !== productIds.length) {
        throw new HttpError(400, "Ba'zi mahsulotlar ushbu do'konga tegishli emas yoki topilmadi.");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      let jamiSumma = new Prisma.Decimal(0);
      let jamiTannarx = new Prisma.Decimal(0);
      const saleItemsData: {
        productId: string;
        nomi: string;
        narxi: Prisma.Decimal;
        tannarx: Prisma.Decimal;
        miqdori: number;
      }[] = [];

      // 2) Har bir mahsulot uchun qoldiqni tekshiramiz
      for (const item of data.items) {
        const product = productMap.get(item.productId)!;
        if (product.miqdori < item.miqdori) {
          throw new HttpError(
            400,
            `"${product.nomi}" uchun mahsulot qoldig'i yetarli emas. Omborda: ${product.miqdori} ta.`,
          );
        }

        const narxi = product.sotuvNarxi;
        const tannarx = product.xaridNarxi;
        jamiSumma = jamiSumma.plus(narxi.mul(item.miqdori));
        jamiTannarx = jamiTannarx.plus(tannarx.mul(item.miqdori));

        saleItemsData.push({
          productId: product.id,
          nomi: product.nomi,
          narxi,
          tannarx,
          miqdori: item.miqdori,
        });
      }

      const foyda = jamiSumma.minus(jamiTannarx);

      // 3) Sotuvni yaratamiz
      const sale = await tx.sale.create({
        data: {
          storeId: params.storeId,
          userId: user.id,
          jamiSumma,
          tannarx: jamiTannarx,
          foyda,
          items: { create: saleItemsData },
          payments: {
            create: { turi: data.paymentType, summa: jamiSumma },
          },
        },
        include: { items: true, payments: true },
      });

      // 3b) Agar to'lov turi "Nasiya (qarz)" bo'lsa, shu sotuvga bog'liq
      // Qarz yozuvini yaratamiz — mijoz keyinroq to'lashi kutiladi.
      if (data.paymentType === "QARZ") {
        await tx.debt.create({
          data: {
            storeId: params.storeId,
            saleId: sale.id,
            mijozIsmi: data.mijozIsmi || "Noma'lum mijoz",
            mijozTelefon: data.mijozTelefon || null,
            summa: jamiSumma,
            izoh: "Kassadagi sotuvdan avtomatik yaratildi",
          },
        });
      }

      // 4) Ombor qoldig'ini kamaytiramiz va InventoryTransaction yozamiz.
      //
      // MUHIM (race condition himoyasi): oddiy `update` o'rniga `updateMany`
      // ishlatamiz va WHERE shartiga `miqdori >= item.miqdori` qo'shamiz.
      // Bu — bitta atomik SQL buyrug'i sifatida bajariladi, shuning uchun
      // ikkita sotuv bir vaqtda (parallel) kelsa ham, ombor hech qachon
      // manfiy songa tushib ketmaydi. Agar boshqa bir tranzaksiya orada
      // qoldiqni allaqachon kamaytirib ulgurgan bo'lsa, bu yerdagi shart
      // bajarilmaydi (count === 0) va butun sotuv rollback qilinadi.
      for (const item of data.items) {
        const natija = await tx.product.updateMany({
          where: { id: item.productId, storeId: params.storeId, miqdori: { gte: item.miqdori } },
          data: { miqdori: { decrement: item.miqdori } },
        });

        if (natija.count === 0) {
          const joriy = productMap.get(item.productId)!;
          throw new HttpError(
            400,
            `"${joriy.nomi}" uchun mahsulot qoldig'i yetarli emas (boshqa sotuv bilan bir vaqtda amalga oshdi). Iltimos, savatni qaytadan tekshiring.`,
          );
        }

        await tx.inventoryTransaction.create({
          data: {
            storeId: params.storeId,
            productId: item.productId,
            turi: "SOTUV",
            miqdor: -item.miqdori,
            izoh: `Sotuv #${sale.id}`,
          },
        });
      }

      return sale;
    });

    return NextResponse.json({ sotuv: result }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
