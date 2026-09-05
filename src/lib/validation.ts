import { z } from "zod";

export const registerSchema = z
  .object({
    ism: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak."),
    familiya: z.string().min(2, "Familiya kamida 2 ta belgidan iborat bo'lishi kerak."),
    email: z.string().email("Email manzili noto'g'ri.").optional().or(z.literal("")),
    telefon: z
      .string()
      .regex(/^\+?[0-9]{9,15}$/, "Telefon raqami noto'g'ri formatda.")
      .optional()
      .or(z.literal("")),
    parol: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak."),
    parolTasdiq: z.string(),
  })
  .refine((data) => data.email || data.telefon, {
    message: "Email yoki telefon raqamidan birini kiriting.",
    path: ["email"],
  })
  .refine((data) => data.parol === data.parolTasdiq, {
    message: "Parollar mos kelmadi.",
    path: ["parolTasdiq"],
  });

export const loginSchema = z.object({
  identifikator: z.string().min(3, "Email yoki telefon raqamini kiriting."),
  parol: z.string().min(1, "Parolni kiriting."),
});

export const storeTurlari = [
  "Oziq-ovqat",
  "Kiyim-kechak",
  "Elektronika",
  "Maishiy texnika",
  "Dorixona",
  "Qurilish mollari",
  "Kantselyariya",
  "Boshqa",
] as const;

export const createStoreSchema = z.object({
  nomi: z.string().min(2, "Do'kon nomi kamida 2 ta belgidan iborat bo'lishi kerak."),
  turi: z.string().min(2, "Do'kon turini tanlang."),
  telefon: z.string().optional().or(z.literal("")),
  manzil: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
});

export const productSchema = z.object({
  nomi: z.string().min(1, "Mahsulot nomini kiriting."),
  categoryId: z.string().nullable().optional(),
  shtrixKod: z.string().optional().or(z.literal("")),
  xaridNarxi: z.coerce.number().min(0, "Xarid narxi manfiy bo'lishi mumkin emas."),
  sotuvNarxi: z.coerce.number().min(0, "Sotuv narxi manfiy bo'lishi mumkin emas."),
  miqdori: z.coerce.number().int().min(0, "Miqdor manfiy bo'lishi mumkin emas."),
  minimalQoldiq: z.coerce.number().int().min(0).default(0),
});

export const categorySchema = z.object({
  nomi: z.string().min(1, "Kategoriya nomini kiriting."),
});

export const saleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        miqdori: z.coerce.number().int().positive("Miqdor musbat son bo'lishi kerak."),
      }),
    )
    .min(1, "Savatda kamida bitta mahsulot bo'lishi kerak."),
  paymentType: z.enum(["NAQD", "KARTA", "BOSHQA"]),
});

export const expenseSchema = z.object({
  nomi: z.string().min(1, "Xarajat nomini kiriting."),
  summa: z.coerce.number().positive("Summa musbat son bo'lishi kerak."),
  kategoriya: z.string().min(1, "Kategoriyani kiriting."),
  sana: z.string().min(1, "Sanani kiriting."),
  izoh: z.string().optional().or(z.literal("")),
});

export const employeeInviteSchema = z.object({
  identifikator: z.string().min(3, "Email yoki telefon raqamini kiriting."),
  role: z.enum(["EGASI", "MENEJER", "SOTUVCHI"]),
});
