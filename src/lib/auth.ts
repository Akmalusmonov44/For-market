import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET;

// XAVFSIZLIK: production muhitida AUTH_SECRET albatta o'rnatilishi shart.
// Agar o'rnatilmagan bo'lsa, ilova sukut bo'yicha "dev-secret" bilan ishlab
// ketishi mumkin emas — bu holda har qanday kishi token soxtalashtirib,
// istalgan foydalanuvchi nomidan tizimga kira olishi mumkin bo'lardi.
// Shu sababli production'da AUTH_SECRET yo'q bo'lsa, ilova ataylab ishga
// tushmaydi (fail-fast).
if (!AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "XATOLIK: AUTH_SECRET environment o'zgaruvchisi o'rnatilmagan. " +
      "Production muhitida bu majburiy. Iltimos, kuchli, tasodifiy qiymat o'rnating " +
      "(masalan: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\").",
  );
}

const SECRET = AUTH_SECRET || "dev-secret-do-not-use-in-production";

export interface TokenPayload {
  userId: string;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "pos_saas_session";
