import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createStoreSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await prisma.storeMember.findMany({
      where: { userId: user.id },
      include: { store: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      dokonlar: memberships.map((m) => ({ ...m.store, role: m.role })),
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createStoreSchema.parse(body);

    const store = await prisma.$transaction(async (tx) => {
      const created = await tx.store.create({
        data: {
          nomi: data.nomi,
          turi: data.turi,
          telefon: data.telefon || null,
          manzil: data.manzil || null,
          logoUrl: data.logoUrl || null,
          ownerId: user.id,
        },
      });

      await tx.storeMember.create({
        data: {
          userId: user.id,
          storeId: created.id,
          role: "EGASI",
        },
      });

      // Boshlang'ich "Umumiy" kategoriyasini yaratamiz, bo'sh interfeys bo'lmasligi uchun
      await tx.category.create({
        data: { storeId: created.id, nomi: "Umumiy" },
      });

      return created;
    });

    return NextResponse.json({ dokon: store }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
