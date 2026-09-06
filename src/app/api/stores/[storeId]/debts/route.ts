import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember, requireStoreRole } from "@/lib/permissions";
import { debtSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const debts = await prisma.debt.findMany({
      where: { storeId: params.storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ qarzlar: debts });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Sotuvchi ham qo'lda qarz yozuvi qo'sha oladi (masalan mijoz mahsulot
    // olib, keyin to'lashga va'da bergan holatlar uchun)
    await requireStoreRole(user.id, params.storeId, "SOTUVCHI");

    const body = await req.json();
    const data = debtSchema.parse(body);

    const debt = await prisma.debt.create({
      data: {
        storeId: params.storeId,
        mijozIsmi: data.mijozIsmi,
        mijozTelefon: data.mijozTelefon || null,
        summa: data.summa,
        izoh: data.izoh || null,
        sana: data.sana ? new Date(data.sana) : new Date(),
      },
    });

    return NextResponse.json({ qarz: debt }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
