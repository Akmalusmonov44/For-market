import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const qidiruv = searchParams.get("qidiruv") || undefined;
    const storeId = searchParams.get("storeId") || undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(qidiruv ? { nomi: { contains: qidiruv, mode: "insensitive" } } : {}),
        ...(storeId ? { storeId } : {}),
      },
      include: {
        category: true,
        store: { select: { id: true, nomi: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ mahsulotlar: products });
  } catch (err) {
    return handleError(err);
  }
}
