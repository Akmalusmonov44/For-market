import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember } from "@/lib/permissions";
import { handleError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const products = await prisma.product.findMany({
      where: { storeId: params.storeId },
      include: { category: true },
      orderBy: { miqdori: "asc" },
    });

    const jamiMahsulot = products.length;
    const tugagan = products.filter((p) => p.miqdori === 0);
    const kamQolgan = products.filter((p) => p.miqdori > 0 && p.miqdori <= p.minimalQoldiq);
    const jamiQoldiqQiymati = products.reduce(
      (sum, p) => sum + Number(p.xaridNarxi) * p.miqdori,
      0,
    );

    return NextResponse.json({
      jamiMahsulot,
      tugaganSoni: tugagan.length,
      kamQolganSoni: kamQolgan.length,
      jamiQoldiqQiymati,
      tugaganMahsulotlar: tugagan,
      kamQolganMahsulotlar: kamQolgan,
      barchaMahsulotlar: products,
    });
  } catch (err) {
    return handleError(err);
  }
}
