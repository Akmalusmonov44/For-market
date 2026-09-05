import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember, requireStoreRole } from "@/lib/permissions";
import { categorySchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);
    const categories = await prisma.category.findMany({
      where: { storeId: params.storeId },
      orderBy: { nomi: "asc" },
    });
    return NextResponse.json({ kategoriyalar: categories });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreRole(user.id, params.storeId, "MENEJER");
    const body = await req.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: { storeId: params.storeId, nomi: data.nomi },
    });

    return NextResponse.json({ kategoriya: category }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
