import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { handleError } from "@/lib/api-helpers";
import { employeeUpdateSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

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

    const store = await prisma.store.findUnique({ where: { id: existing.storeId } });
    if (store && store.ownerId === existing.userId) {
      // Asosiy do'kon egasining (birinchi yaratilgan hisob) rolini yoki
      // parolini shu "Xodimlar" bo'limi orqali o'zgartirib bo'lmaydi.
      // Bu — muhim xavfsizlik/barqarorlik chorasi: aks holda kimdir
      // (hatto tasodifan) egasining rolini pasaytirib qo'ysa, u o'z
      // do'konidan boshqaruv huquqisiz qolib ketardi.
      throw new HttpError(
        400,
        "Asosiy do'kon egasini shu bo'lim orqali tahrirlab bo'lmaydi.",
      );
    }

    const body = await req.json();
    const data = employeeUpdateSchema.parse(body);

    if (data.role) {
      await prisma.storeMember.update({ where: { id: params.memberId }, data: { role: data.role } });
    }

    // Do'kon egasi xodimning parolini qayta o'rnatishi mumkin — masalan,
    // xodim parolni unutgan va emailga ega bo'lmagan hollarda foydali.
    if (data.yangiParol) {
      const passwordHash = await hashPassword(data.yangiParol);
      await prisma.user.update({ where: { id: existing.userId }, data: { passwordHash } });
    }

    const updated = await prisma.storeMember.findUnique({
      where: { id: params.memberId },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
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

