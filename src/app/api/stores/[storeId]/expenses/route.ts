import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember, requireStoreRole } from "@/lib/permissions";
import { expenseSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const { searchParams } = new URL(req.url);
    const boshlanish = searchParams.get("boshlanish");
    const tugash = searchParams.get("tugash");

    const expenses = await prisma.expense.findMany({
      where: {
        storeId: params.storeId,
        ...(boshlanish || tugash
          ? {
              sana: {
                ...(boshlanish ? { gte: new Date(boshlanish) } : {}),
                ...(tugash ? { lte: new Date(tugash) } : {}),
              },
            }
          : {}),
      },
      orderBy: { sana: "desc" },
    });

    return NextResponse.json({ xarajatlar: expenses });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Sotuvchi xarajat qo'sha olmaydi
    await requireStoreRole(user.id, params.storeId, "MENEJER");

    const body = await req.json();
    const data = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        storeId: params.storeId,
        nomi: data.nomi,
        summa: data.summa,
        kategoriya: data.kategoriya,
        sana: new Date(data.sana),
        izoh: data.izoh || null,
      },
    });

    return NextResponse.json({ xarajat: expense }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
