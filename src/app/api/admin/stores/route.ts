export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";


export async function GET() {
  try {
    await requireSuperAdmin();

    const stores = await prisma.store.findMany({
      select: {
        id: true,
        nomi: true,
        turi: true,
        telefon: true,
        manzil: true,
        ownerId: true,
        createdAt: true,
        _count: { select: { products: true, sales: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const ownerIds = [...new Set(stores.map((s) => s.ownerId))];
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, ism: true, familiya: true, email: true, telefon: true },
    });
    const ownerMap = new Map(owners.map((o) => [o.id, o]));

    return NextResponse.json({
      dokonlar: stores.map((s) => ({ ...s, egasi: ownerMap.get(s.ownerId) || null })),
    });
  } catch (err) {
    return handleError(err);
  }
}
