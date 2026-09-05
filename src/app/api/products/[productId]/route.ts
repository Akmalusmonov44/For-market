import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { productSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

async function getProductOr404(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Mahsulot topilmadi.");
  return product;
}

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getProductOr404(params.productId);
    // Mahsulotning haqiqiy storeId'si orqali huquqni tekshiramiz — URL orqali
    // boshqa do'kon mahsulotini tahrirlashning iloji yo'q.
    await requireStoreRole(user.id, existing.storeId, "MENEJER");

    const body = await req.json();
    const data = productSchema.partial().parse(body);

    const oldMiqdor = existing.miqdori;
    const newMiqdor = data.miqdori !== undefined ? data.miqdori : oldMiqdor;
    const farq = newMiqdor - oldMiqdor;

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: params.productId },
        data: {
          ...(data.nomi !== undefined ? { nomi: data.nomi } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId || null } : {}),
          ...(data.shtrixKod !== undefined ? { shtrixKod: data.shtrixKod || null } : {}),
          ...(data.xaridNarxi !== undefined ? { xaridNarxi: data.xaridNarxi } : {}),
          ...(data.sotuvNarxi !== undefined ? { sotuvNarxi: data.sotuvNarxi } : {}),
          ...(data.miqdori !== undefined ? { miqdori: data.miqdori } : {}),
          ...(data.minimalQoldiq !== undefined ? { minimalQoldiq: data.minimalQoldiq } : {}),
        },
      });

      if (farq !== 0) {
        await tx.inventoryTransaction.create({
          data: {
            storeId: existing.storeId,
            productId: product.id,
            turi: "TUZATISH",
            miqdor: farq,
            izoh: "Qo'lda tahrirlash orqali qoldiq tuzatildi",
          },
        });
      }

      return product;
    });

    return NextResponse.json({ mahsulot: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getProductOr404(params.productId);
    await requireStoreRole(user.id, existing.storeId, "MENEJER");

    await prisma.product.delete({ where: { id: params.productId } });
    return NextResponse.json({ xabar: "Mahsulot o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
