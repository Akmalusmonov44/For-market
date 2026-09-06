import crypto from "crypto";

/**
 * Xavfsizlik: foydalanuvchiga yuboriladigan xom (raw) token va database'da
 * saqlanadigan hash bir xil emas. Agar baza sizib chiqsa ham, hech kim
 * hech qanday tokenni "qayta ishlatib" parolni tiklay olmasligi kerak —
 * shuning uchun faqat SHA-256 hash saqlanadi, xom token faqat email orqali
 * bir martalik ravishda foydalanuvchiga yuboriladi.
 */
export function yangiResetToken(): { xomToken: string; tokenHash: string } {
  const xomToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(xomToken).digest("hex");
  return { xomToken, tokenHash };
}

export function tokenHashla(xomToken: string): string {
  return crypto.createHash("sha256").update(xomToken).digest("hex");
}

export const RESET_TOKEN_AMAL_MUDDATI_DAQIQA = 60; // 1 soat
