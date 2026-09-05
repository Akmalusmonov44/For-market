import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { employeeInviteSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreRole(user.id, params.storeId, "MENEJER");

    const members = await prisma.storeMember.findMany({
      where: { storeId: params.storeId },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ xodimlar: members });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Faqat egasi xodim qo'sha oladi
    await requireStoreRole(user.id, params.storeId, "EGASI");

    const body = await req.json();
    const data = employeeInviteSchema.parse(body);
    const identifikator = data.identifikator.toLowerCase().trim();

    const targetUser = await prisma.user.findFirst({
      where: { OR: [{ email: identifikator }, { telefon: data.identifikator.trim() }] },
    });

    if (!targetUser) {
      throw new HttpError(
        404,
        "Bu email/telefon raqami bilan ro'yxatdan o'tgan foydalanuvchi topilmadi. Avval ular tizimda ro'yxatdan o'tishi kerak.",
      );
    }

    const existing = await prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: targetUser.id, storeId: params.storeId } },
    });
    if (existing) {
      throw new HttpError(409, "Bu foydalanuvchi allaqachon ushbu do'kon xodimi.");
    }

    const member = await prisma.storeMember.create({
      data: { userId: targetUser.id, storeId: params.storeId, role: data.role },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
    });

    return NextResponse.json({ xodim: member }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
