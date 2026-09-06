import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { HttpError } from "@/lib/session";
import { tokenHashla } from "@/lib/reset-token";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);
    const tokenHash = tokenHashla(data.token);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new HttpError(
        400,
        "Havola yaroqsiz yoki muddati o'tgan. Iltimos, parolni tiklashni qaytadan so'rang.",
      );
    }

    const passwordHash = await hashPassword(data.yangiParol);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      // Xavfsizlik uchun shu foydalanuvchining boshqa barcha eskirmagan
      // reset tokenlarini ham bekor qilamiz.
      prisma.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, used: false, id: { not: resetToken.id } },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ xabar: "Parolingiz muvaffaqiyatli yangilandi. Endi tizimga kirishingiz mumkin." });
  } catch (err) {
    return handleError(err);
  }
}
