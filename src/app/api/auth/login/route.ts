import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { HttpError } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    const identifikator = data.identifikator.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifikator }, { telefon: data.identifikator.trim() }],
      },
    });

    if (!user) {
      throw new HttpError(401, "Email/telefon yoki parol noto'g'ri.");
    }

    const valid = await verifyPassword(data.parol, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Email/telefon yoki parol noto'g'ri.");
    }

    const token = signToken({ userId: user.id });

    const res = NextResponse.json({
      foydalanuvchi: {
        id: user.id,
        ism: user.ism,
        familiya: user.familiya,
        email: user.email,
        telefon: user.telefon,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
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
