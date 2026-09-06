import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { requireStoreRole } from "@/lib/permissions";
import { employeeCreateSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    await requireStoreRole(user.id, params.storeId, "MENEJER");

    const store = await prisma.store.findUnique({ where: { id: params.storeId }, select: { ownerId: true } });

    const members = await prisma.storeMember.findMany({
      where: { storeId: params.storeId },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Har bir xodim uchun "bu asosiy do'kon egasimi" belgisini qo'shamiz —
    // frontend shu belgi orqali egasining qatorida tahrirlash/o'chirish
    // tugmalarini butunlay yashiradi.
    return NextResponse.json({
      xodimlar: members.map((m) => ({ ...m, egaMi: store?.ownerId === m.userId })),
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const user = await requireUser();
    // Faqat egasi xodim qo'sha oladi
    await requireStoreRole(user.id, params.storeId, "EGASI");

    const body = await req.json();
    const data = employeeCreateSchema.parse(body);
    const identifikatorRaw = data.identifikator.trim();
    const email = identifikatorRaw.includes("@") ? identifikatorRaw.toLowerCase() : null;
    const telefon = !email ? identifikatorRaw : null;

    let targetUser = await prisma.user.findFirst({
      where: { OR: [{ email: identifikatorRaw.toLowerCase() }, { telefon: identifikatorRaw }] },
    });

    if (targetUser) {
      // Bu email/telefon bilan hisob allaqachon mavjud — shunchaki shu
      // do'konga a'zo sifatida biriktiramiz, ism/parol maydonlari
      // e'tiborsiz qoldiriladi (mavjud hisob o'zgartirilmaydi).
      const existingMembership = await prisma.storeMember.findUnique({
        where: { userId_storeId: { userId: targetUser.id, storeId: params.storeId } },
      });
      if (existingMembership) {
        throw new HttpError(409, "Bu foydalanuvchi allaqachon ushbu do'kon xodimi.");
      }
    } else {
      // Yangi hisob — do'kon egasi xodim uchun to'g'ridan-to'g'ri ism,
      // familiya va parol kiritadi. Xodim keyin shu login/parol bilan
      // kirishi mumkin.
      if (!data.ism || !data.familiya || !data.parol) {
        throw new HttpError(
          400,
          "Bu email/telefon bilan hisob topilmadi. Yangi xodim uchun ism, familiya va parolni to'ldiring.",
        );
      }
      const passwordHash = await hashPassword(data.parol);
      targetUser = await prisma.user.create({
        data: { ism: data.ism, familiya: data.familiya, email, telefon, passwordHash },
      });
    }

    const member = await prisma.storeMember.create({
      data: { userId: targetUser.id, storeId: params.storeId, role: data.role },
      include: { user: { select: { id: true, ism: true, familiya: true, email: true, telefon: true } } },
    });

    return NextResponse.json({ xodim: member }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

