import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { HttpError } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const email = data.email ? data.email.toLowerCase().trim() : null;
    const telefon = data.telefon ? data.telefon.trim() : null;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          telefon ? { telefon } : undefined,
        ].filter(Boolean) as never,
      },
    });

    if (existing) {
      throw new HttpError(409, "Bu email yoki telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan.");
    }

    const passwordHash = await hashPassword(data.parol);

    const user = await prisma.user.create({
      data: {
        ism: data.ism,
        familiya: data.familiya,
        email,
        telefon,
        passwordHash,
      },
      select: { id: true, ism: true, familiya: true, email: true, telefon: true },
    });

    const token = signToken({ userId: user.id });

    const res = NextResponse.json({ foydalanuvchi: user }, { status: 201 });
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
