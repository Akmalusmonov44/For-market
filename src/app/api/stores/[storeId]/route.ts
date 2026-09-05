import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreMember, requireStoreRole } from "@/lib/permissions";
import { createStoreSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    const membership = await requireStoreMember(user.id, params.storeId);
    return NextResponse.json({ dokon: { ...membership.store, role: membership.role } });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Faqat EGASI do'kon sozlamalarini o'zgartira oladi
    await requireStoreRole(user.id, params.storeId, "EGASI");

    const body = await req.json();
    const data = createStoreSchema.partial().parse(body);

    const updated = await prisma.store.update({
      where: { id: params.storeId },
      data: {
        ...(data.nomi ? { nomi: data.nomi } : {}),
        ...(data.turi ? { turi: data.turi } : {}),
        telefon: data.telefon ?? undefined,
        manzil: data.manzil ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
      },
    });

    return NextResponse.json({ dokon: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    const membership = await requireStoreRole(user.id, params.storeId, "EGASI");

    if (membership.store.ownerId !== user.id) {
      throw new HttpError(403, "Faqat do'kon egasi do'konni o'chira oladi.");
    }

    await prisma.store.delete({ where: { id: params.storeId } });
    return NextResponse.json({ xabar: "Do'kon o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
