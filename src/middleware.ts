import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Middleware faqat "tez" tekshiruv qiladi (cookie mavjudligi) — UX uchun redirect.
// HAQIQIY xavfsizlik tekshiruvi har doim server-side (API route / server component)
// ichida requireUser() va requireStoreMember() orqali amalga oshiriladi.
// Bu middleware'ni chetlab o'tish orqali hech qanday himoyalangan ma'lumotga
// kirib bo'lmaydi, chunki API'lar mustaqil ravishda tokenni tekshiradi.
//
// MUHIM: bu yerda faqat COOKIE MAVJUDLIGI tekshiriladi, uning ICHIDAGI
// tokenning haqiqiy yaroqliligi emas (buni Edge middleware'da tekshirish
// qimmatga tushadi). Shu sababli "agar token bor bo'lsa /kirish'dan
// /dashboard'ga yubor" kabi teskari yo'naltirish QASDDAN qo'shilmagan —
// aks holda, agar cookie eskirgan/yaroqsiz bo'lib qolsa (masalan AUTH_SECRET
// almashtirilganda yoki hisob o'chirilganda), /kirish va /dashboard
// o'rtasida CHEKSIZ REDIRECT LOOP paydo bo'ladi: /dashboard tokenni
// yaroqsiz deb /kirish'ga yuboradi, /kirish esa cookie "bor" deb yana
// /dashboard'ga yuboradi. Shuning uchun bu yo'nalish faqat client-side
// (StoreContext orqali, haqiqiy /api/auth/me natijasiga asoslanib) amalga
// oshiriladi — u yerda token haqiqatan tekshiriladi.

const PROTECTED_PREFIXES = ["/dashboard", "/dokon-yaratish", "/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/kirish";
    url.searchParams.set("keyin", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dokon-yaratish/:path*", "/admin/:path*"],
};

