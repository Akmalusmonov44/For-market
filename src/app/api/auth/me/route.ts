export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";


export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ foydalanuvchi: null }, { status: 200 });
    }

    const memberships = await prisma.storeMember.findMany({
      where: { userId: user.id },
      include: { store: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      foydalanuvchi: user,
      dokonlar: memberships.map((m) => ({
        id: m.store.id,
        nomi: m.store.nomi,
        turi: m.store.turi,
        logoUrl: m.store.logoUrl,
        role: m.role,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
