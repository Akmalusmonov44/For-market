import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

    const sales = await prisma.sale.findMany({
      where: { storeId: params.storeId },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ sotuvlar: sales });
  } catch (err) {
    return handleError(err);
  }
}
