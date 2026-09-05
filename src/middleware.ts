import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Middleware faqat "tez" tekshiruv qiladi (cookie mavjudligi) — UX uchun redirect.
// HAQIQIY xavfsizlik tekshiruvi har doim server-side (API route / server component)
// ichida requireUser() va requireStoreMember() orqali amalga oshiriladi.
// Bu middleware'ni chetlab o'tish orqali hech qanday himoyalangan ma'lumotga
// kirib bo'lmaydi, chunki API'lar mustaqil ravishda tokenni tekshiradi.

const PROTECTED_PREFIXES = ["/dashboard", "/dokon-yaratish", "/admin"];
const AUTH_PAGES = ["/kirish", "/royxatdan-otish"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/kirish";
    url.searchParams.set("keyin", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dokon-yaratish/:path*", "/admin/:path*", "/kirish", "/royxatdan-otish"],
};
