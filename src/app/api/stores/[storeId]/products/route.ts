import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember, requireStoreRole } from "@/lib/permissions";
import { productSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const { searchParams } = new URL(req.url);
    const qidiruv = searchParams.get("qidiruv") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const shtrixKod = searchParams.get("shtrixKod") || undefined;

    const products = await prisma.product.findMany({
      where: {
        storeId: params.storeId, // <-- store bo'yicha qat'iy filtr, IDOR oldini oladi
        ...(qidiruv ? { nomi: { contains: qidiruv, mode: "insensitive" } } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(shtrixKod ? { shtrixKod } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ mahsulotlar: products });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Sotuvchi mahsulot qo'sha olmaydi, faqat menejer va egasi
    await requireStoreRole(user.id, params.storeId, "MENEJER");

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          storeId: params.storeId,
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
            storeId: params.storeId,
            productId: created.id,
            turi: "KIRIM",
            miqdor: data.miqdori,
            izoh: "Boshlang'ich qoldiq (mahsulot yaratilganda)",
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
