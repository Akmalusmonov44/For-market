import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";
import { handleError } from "@/lib/api-helpers";
import { yangiResetToken, RESET_TOKEN_AMAL_MUDDATI_DAQIQA } from "@/lib/reset-token";
import { sendMail } from "@/lib/mailer";

const UMUMIY_XABAR =
  "Agar bu email/telefon raqami bilan hisob mavjud bo'lsa, parolni tiklash havolasi yuborildi.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);
    const identifikator = data.identifikator.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifikator }, { telefon: data.identifikator.trim() }] },
    });

    // XAVFSIZLIK: foydalanuvchi mavjud yoki yo'qligidan qat'i nazar bir xil
    // javob qaytariladi (user enumeration hujumining oldini olish uchun).
    if (!user || !user.email) {
      return NextResponse.json({ xabar: UMUMIY_XABAR });
    }

    const { xomToken, tokenHash } = yangiResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_AMAL_MUDDATI_DAQIQA * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const havola = `${baseUrl}/parolni-tiklash?token=${xomToken}`;

    await sendMail(
      user.email,
      "Parolni tiklash — DoConBoshqar",
      `
        <p>Salom, ${user.ism}!</p>
        <p>Parolingizni tiklash uchun quyidagi havolaga bosing (${RESET_TOKEN_AMAL_MUDDATI_DAQIQA} daqiqa amal qiladi):</p>
        <p><a href="${havola}">${havola}</a></p>
        <p>Agar siz bu so'rovni yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
      `,
    );

    return NextResponse.json({ xabar: UMUMIY_XABAR });
  } catch (err) {
    return handleError(err);
  }
}
