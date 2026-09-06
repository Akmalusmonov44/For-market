import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { debtPaymentSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

async function getDebtOr404(debtId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new HttpError(404, "Qarz yozuvi topilmadi.");
  return debt;
}

export async function PUT(req: NextRequest, { params }: { params: { debtId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getDebtOr404(params.debtId);
    await requireStoreRole(user.id, existing.storeId, "SOTUVCHI");

    const body = await req.json();
    const data = debtPaymentSchema.parse(body);

    const qoldiq = existing.summa.minus(existing.toLanganSumma);
    if (new Prisma.Decimal(data.toLovSumma).greaterThan(qoldiq)) {
      throw new HttpError(
        400,
        `To'lov summasi qoldiq qarzdan (${qoldiq.toString()} so'm) katta bo'lishi mumkin emas.`,
      );
    }

    const updated = await prisma.debt.update({
      where: { id: params.debtId },
      data: { toLanganSumma: { increment: data.toLovSumma } },
    });

    return NextResponse.json({ qarz: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { debtId: string } }) {
  try {
    const user = await requireUser();
    const existing = await getDebtOr404(params.debtId);
    await requireStoreRole(user.id, existing.storeId, "MENEJER");

    await prisma.debt.delete({ where: { id: params.debtId } });
    return NextResponse.json({ xabar: "Qarz yozuvi o'chirildi." });
  } catch (err) {
    return handleError(err);
  }
}
