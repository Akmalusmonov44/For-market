import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { expenseSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

async function getExpenseOr404(expenseId: string) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw new HttpError(404, "Xarajat topilmadi.");
  return expense;
}

export async function PUT(req: NextRequest, { params }: { params: { expenseId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getExpenseOr404(params.expenseId);
    await requireStoreRole(user.id, existing.storeId, "MENEJER");

    const body = await req.json();
    const data = expenseSchema.partial().parse(body);

    const updated = await prisma.expense.update({
      where: { id: params.expenseId },
      data: {
        ...(data.nomi !== undefined ? { nomi: data.nomi } : {}),
        ...(data.summa !== undefined ? { summa: data.summa } : {}),
        ...(data.kategoriya !== undefined ? { kategoriya: data.kategoriya } : {}),
        ...(data.sana !== undefined ? { sana: new Date(data.sana) } : {}),
        ...(data.izoh !== undefined ? { izoh: data.izoh || null } : {}),
      },
    });

    return NextResponse.json({ xarajat: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { expenseId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getExpenseOr404(params.expenseId);
    await requireStoreRole(user.id, existing.storeId, "MENEJER");

    await prisma.expense.delete({ where: { id: params.expenseId } });
    return NextResponse.json({ xabar: "Xarajat o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
