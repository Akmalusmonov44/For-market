export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireSuperAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        ism: true,
        familiya: true,
        email: true,
        telefon: true,
        isSuperAdmin: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            store: { select: { id: true, nomi: true } },
          },
        },
        _count: { select: { memberships: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Har bir foydalanuvchi nechta do'konga EGASI ekanini ham qo'shamiz
    const ownedStoreCounts = await prisma.store.groupBy({
      by: ["ownerId"],
      _count: { _all: true },
    });
    const ownedMap = new Map(ownedStoreCounts.map((o) => [o.ownerId, o._count._all]));

    return NextResponse.json({
      foydalanuvchilar: users.map((u) => ({
        ...u,
        egaligidagiDokonlarSoni: ownedMap.get(u.id) || 0,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
