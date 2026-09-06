import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, HttpError } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await requireSuperAdmin();

    const store = await prisma.store.findUnique({
      where: { id: params.storeId },
      include: { _count: { select: { products: true, sales: true, members: true, expenses: true } } },
    });
    if (!store) throw new HttpError(404, "Do'kon topilmadi.");

    const owner = await prisma.user.findUnique({
      where: { id: store.ownerId },
      select: { id: true, ism: true, familiya: true, email: true, telefon: true },
    });

    return NextResponse.json({ dokon: { ...store, egasi: owner } });
  } catch (err) {
    return handleError(err);
  }
}
