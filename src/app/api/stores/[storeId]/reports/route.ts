import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStoreMember } from "@/lib/permissions";
import { handleError } from "@/lib/api-helpers";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreMember(user.id, params.storeId);

    const { searchParams } = new URL(req.url);
    const boshlanishParam = searchParams.get("boshlanish");
    const tugashParam = searchParams.get("tugash");

    const boshlanish = boshlanishParam ? startOfDay(new Date(boshlanishParam)) : startOfDay(new Date(new Date().setDate(new Date().getDate() - 29)));
    const tugash = tugashParam ? endOfDay(new Date(tugashParam)) : endOfDay(new Date());

    const [sales, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: { storeId: params.storeId, createdAt: { gte: boshlanish, lte: tugash } },
        include: { items: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.expense.findMany({
        where: { storeId: params.storeId, sana: { gte: boshlanish, lte: tugash } },
      }),
    ]);

    const umumiyTushum = sales.reduce((s, sale) => s + Number(sale.jamiSumma), 0);
    const umumiyTannarx = sales.reduce((s, sale) => s + Number(sale.tannarx), 0);
    const yalpiFoyda = umumiyTushum - umumiyTannarx;
    const umumiyXarajat = expenses.reduce((s, e) => s + Number(e.summa), 0);
    const sofFoyda = yalpiFoyda - umumiyXarajat;

    // Kunlik kesimda savdo
    const kunlikMap = new Map<string, { savdo: number; foyda: number }>();
    for (const sale of sales) {
      const kun = sale.createdAt.toISOString().slice(0, 10);
      const mavjud = kunlikMap.get(kun) || { savdo: 0, foyda: 0 };
      mavjud.savdo += Number(sale.jamiSumma);
      mavjud.foyda += Number(sale.foyda);
      kunlikMap.set(kun, mavjud);
    }
    const kunlikSavdo = Array.from(kunlikMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([sana, qiymat]) => ({ sana, ...qiymat }));

    // Eng ko'p sotilgan / foyda keltirgan mahsulotlar
    const productAgg = new Map<string, { nomi: string; miqdor: number; tushum: number; foyda: number }>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const mavjud = productAgg.get(item.productId) || { nomi: item.nomi, miqdor: 0, tushum: 0, foyda: 0 };
        mavjud.miqdor += item.miqdori;
        mavjud.tushum += Number(item.narxi) * item.miqdori;
        mavjud.foyda += (Number(item.narxi) - Number(item.tannarx)) * item.miqdori;
        productAgg.set(item.productId, mavjud);
      }
    }
    const barchaMahsulotlar = Array.from(productAgg.values());
    const engKopSotilgan = [...barchaMahsulotlar].sort((a, b) => b.miqdor - a.miqdor).slice(0, 10);
    const engKopFoydaKeltirgan = [...barchaMahsulotlar].sort((a, b) => b.foyda - a.foyda).slice(0, 10);

    return NextResponse.json({
      davr: { boshlanish, tugash },
      umumiyTushum,
      umumiyTannarx,
      yalpiFoyda,
      umumiyXarajat,
      sofFoyda,
      sotuvlarSoni: sales.length,
      kunlikSavdo,
      engKopSotilgan,
      engKopFoydaKeltirgan,
    });
  } catch (err) {
    return handleError(err);
  }
}
