export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, HttpError } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  ism: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak.").optional(),
  familiya: z.string().min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak.").optional(),
  email: z.string().email("Email noto'g'ri.").or(z.literal("")).optional(),
  telefon: z.string().or(z.literal("")).optional(),
  yangiParol: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.").optional().or(z.literal("")),
  isSuperAdmin: z.boolean().optional(),
});

async function getUserOr404(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, "Foydalanuvchi topilmadi.");
  return user;
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await requireSuperAdmin();
    await getUserOr404(params.userId);

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.ism !== undefined) updateData.ism = data.ism;
    if (data.familiya !== undefined) updateData.familiya = data.familiya;
    if (data.email !== undefined) updateData.email = data.email ? data.email.toLowerCase().trim() : null;
    if (data.telefon !== undefined) updateData.telefon = data.telefon ? data.telefon.trim() : null;
    if (data.isSuperAdmin !== undefined) updateData.isSuperAdmin = data.isSuperAdmin;
    if (data.yangiParol) updateData.passwordHash = await hashPassword(data.yangiParol);

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: {
        id: true,
        ism: true,
        familiya: true,
        email: true,
        telefon: true,
        isSuperAdmin: true,
      },
    });

    return NextResponse.json({ foydalanuvchi: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const admin = await requireSuperAdmin();
    const target = await getUserOr404(params.userId);

    if (admin.id === target.id) {
      throw new HttpError(400, "O'zingizni o'chira olmaysiz.");
    }

    await prisma.$transaction(async (tx) => {
      // Foydalanuvchi egalik qiladigan barcha do'konlarni o'chiramiz.
      // Store'ga bog'liq Product/Sale/Expense/InventoryTransaction/StoreMember
      // yozuvlari schema'dagi onDelete: Cascade orqali avtomatik o'chadi.
      await tx.store.deleteMany({ where: { ownerId: target.id } });

      // Foydalanuvchining o'zini o'chiramiz. Boshqa do'konlarga oddiy xodim
      // sifatidagi StoreMember yozuvlari ham onDelete: Cascade orqali o'chadi.
      await tx.user.delete({ where: { id: target.id } });
    });

    return NextResponse.json({ xabar: "Foydalanuvchi va unga tegishli do'konlar o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
