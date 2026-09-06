import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: { storeId: string } }) {
  try {
    await requireSuperAdmin();

    const xarajatlar = await prisma.expense.findMany({
      where: { storeId: params.storeId },
      orderBy: { sana: "desc" },
    });

    return NextResponse.json({ xarajatlar });
  } catch (err) {
    return handleError(err);
  }
}
