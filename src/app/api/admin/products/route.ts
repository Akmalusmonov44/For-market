import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, HttpError } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";
import { productSchema } from "@/lib/validation";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const qidiruv = searchParams.get("qidiruv") || undefined;
    const storeId = searchParams.get("storeId") || undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(qidiruv ? { nomi: { contains: qidiruv, mode: "insensitive" } } : {}),
        ...(storeId ? { storeId } : {}),
      },
      include: {
        category: true,
        store: { select: { id: true, nomi: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ mahsulotlar: products });
  } catch (err) {
    return handleError(err);
  }
}

const adminCreateProductSchema = productSchema.extend({
  storeId: z.string().min(1, "Do'konni tanlang."),
});

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const data = adminCreateProductSchema.parse(body);

    const store = await prisma.store.findUnique({ where: { id: data.storeId } });
    if (!store) throw new HttpError(404, "Do'kon topilmadi.");

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          storeId: data.storeId,
          categoryId: data.categoryId || null,
          nomi: data.nomi,
          shtrixKod: data.shtrixKod || null,
          xaridNarxi: data.xaridNarxi,
          sotuvNarxi: data.sotuvNarxi,
          miqdori: data.miqdori,
          minimalQoldiq: data.minimalQoldiq,
        },
      });

      if (data.miqdori > 0) {
        await tx.inventoryTransaction.create({
          data: {
            storeId: data.storeId,
            productId: created.id,
            turi: "KIRIM",
            miqdor: data.miqdori,
            izoh: "Platforma administratori tomonidan qo'shildi",
          },
        });
      }

      return created;
    });

    return NextResponse.json({ mahsulot: product }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

