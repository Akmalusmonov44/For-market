import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/session";
import { StoreRole } from "@prisma/client";

/**
 * MUHIM XAVFSIZLIK QATLAMI
 * ------------------------
 * Har bir store-ga tegishli API endpoint ushbu funksiyani chaqirishi SHART.
 * Bu funksiya foydalanuvchining berilgan storeId'ga a'zoligini database orqali
 * tekshiradi (StoreMember jadvali orqali). Agar foydalanuvchi a'zo bo'lmasa,
 * 403/404 xato qaytariladi va so'rov bloklanadi.
 *
 * Bu orqali IDOR (Insecure Direct Object Reference) va privilege escalation
 * hujumlarining oldi olinadi: URL yoki so'rov tanasidagi storeId'ni
 * o'zgartirib boshqa do'kon ma'lumotlariga kirishning iloji bo'lmaydi.
 */
export async function requireStoreMember(userId: string, storeId: string) {
  const membership = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId, storeId } },
    include: { store: true },
  });

  if (!membership) {
    // Qasddan 404 qaytaramiz (403 emas) — bu boshqa foydalanuvchiga
    // do'konning "mavjudligi"ni ham oshkor qilmaslik uchun yaxshi amaliyot.
    throw new HttpError(404, "Do'kon topilmadi yoki sizga tegishli emas.");
  }

  return membership;
}

const ROLE_HIERARCHY: Record<StoreRole, number> = {
  SOTUVCHI: 1,
  MENEJER: 2,
  EGASI: 3,
};

/**
 * Berilgan rol minimal talab qilingan rolga yetadimi tekshiradi.
 * EGASI > MENEJER > SOTUVCHI
 */
export function hasMinimumRole(role: StoreRole, minimum: StoreRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}

/**
 * Foydalanuvchining storega a'zoligini va minimal rol talabini birga tekshiradi.
 * Masalan, faqat EGASI xodim qo'sha olishi kerak bo'lsa:
 *   await requireStoreRole(userId, storeId, "EGASI")
 */
export async function requireStoreRole(userId: string, storeId: string, minimum: StoreRole) {
  const membership = await requireStoreMember(userId, storeId);
  if (!hasMinimumRole(membership.role, minimum)) {
    throw new HttpError(403, "Bu amal uchun sizda yetarli huquq yo'q.");
  }
  return membership;
}
