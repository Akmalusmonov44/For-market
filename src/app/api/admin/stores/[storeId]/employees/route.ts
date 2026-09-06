import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: { storeId: string } }) {
  try {
    await requireSuperAdmin();

    const xodimlar = await prisma.storeMember.findMany({
      where: { storeId: params.storeId },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ xodimlar });
  } catch (err) {
    return handleError(err);
  }
}
