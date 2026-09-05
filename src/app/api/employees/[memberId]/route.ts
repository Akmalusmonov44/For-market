import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { handleError } from "@/lib/api-helpers";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["EGASI", "MENEJER", "SOTUVCHI"]),
});

async function getMemberOr404(memberId: string) {
  const member = await prisma.storeMember.findUnique({ where: { id: memberId } });
  if (!member) throw new HttpError(404, "Xodim topilmadi.");
  return member;
}

export async function PUT(req: NextRequest, { params }: { params: { memberId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getMemberOr404(params.memberId);
    await requireStoreRole(user.id, existing.storeId, "EGASI");

    const body = await req.json();
    const data = updateRoleSchema.parse(body);

    const updated = await prisma.storeMember.update({
      where: { id: params.memberId },
      data: { role: data.role },
    });

    return NextResponse.json({ xodim: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { memberId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getMemberOr404(params.memberId);
    await requireStoreRole(user.id, existing.storeId, "EGASI");

    const store = await prisma.store.findUnique({ where: { id: existing.storeId } });
    if (store && store.ownerId === existing.userId) {
      throw new HttpError(400, "Do'kon egasini xodimlikdan chiqarib bo'lmaydi.");
    }

    await prisma.storeMember.delete({ where: { id: params.memberId } });
    return NextResponse.json({ xabar: "Xodim o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
