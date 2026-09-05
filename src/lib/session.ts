import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Joriy so'rov (request) cookie'laridan haqiqiy foydalanuvchini database'dan olib beradi.
 * Agar token yaroqsiz yoki mavjud bo'lmasa, null qaytaradi.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      ism: true,
      familiya: true,
      email: true,
      telefon: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  return user;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Autentifikatsiyani talab qiladigan API route'lar uchun.
 * Agar foydalanuvchi kirmagan bo'lsa, HttpError(401) tashlaydi.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, "Tizimga kirish talab qilinadi.");
  }
  return user;
}

/**
 * Platforma darajasidagi super-admin endpointlar uchun.
 * Har qanday do'kon a'zoligidan qat'i nazar, faqat User.isSuperAdmin=true
 * bo'lgan foydalanuvchilarga ruxsat beradi. Bu do'kon EGASI roli bilan
 * ARALASHTIRILMASLIGI kerak — EGASI faqat o'z do'koniga egalik qiladi,
 * super-admin esa butun platformani boshqaradi.
 */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.isSuperAdmin) {
    throw new HttpError(403, "Bu bo'lim faqat platforma administratorlari uchun.");
  }
  return user;
}
