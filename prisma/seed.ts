import { PrismaClient, PaymentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Demo ma'lumotlar yaratilmoqda...");

  const passwordHash = await bcrypt.hash("parol123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@doconboshqar.uz" },
    update: {},
    create: {
      ism: "Aziz",
      familiya: "Karimov",
      email: "demo@doconboshqar.uz",
      telefon: "+998901234567",
      passwordHash,
    },
  });

  let store = await prisma.store.findFirst({ where: { ownerId: user.id, nomi: "Baraka Market" } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        nomi: "Baraka Market",
        turi: "Oziq-ovqat",
        telefon: "+998901112233",
        manzil: "Toshkent sh., Chilonzor tumani",
        ownerId: user.id,
      },
    });
    await prisma.storeMember.create({
      data: { userId: user.id, storeId: store.id, role: "EGASI" },
    });
  }

  const kategoriyaNomlari = ["Ichimliklar", "Non mahsulotlari", "Sut mahsulotlari", "Konditer"];
  const kategoriyalar: Record<string, string> = {};
  for (const nomi of kategoriyaNomlari) {
    const kat = await prisma.category.upsert({
      where: { storeId_nomi: { storeId: store.id, nomi } },
      update: {},
      create: { storeId: store.id, nomi },
    });
    kategoriyalar[nomi] = kat.id;
  }

  const mahsulotlarRoyxati = [
    { nomi: "Coca-Cola 1L", kategoriya: "Ichimliklar", xarid: 6000, sotuv: 9000, miqdor: 80, minimal: 15 },
    { nomi: "Non (oddiy)", kategoriya: "Non mahsulotlari", xarid: 2000, sotuv: 3000, miqdor: 40, minimal: 10 },
    { nomi: "Sut 1L", kategoriya: "Sut mahsulotlari", xarid: 8000, sotuv: 11000, miqdor: 5, minimal: 10 },
    { nomi: "Shokolad 100g", kategoriya: "Konditer", xarid: 12000, sotuv: 18000, miqdor: 0, minimal: 5 },
    { nomi: "Mineral suv 0.5L", kategoriya: "Ichimliklar", xarid: 2500, sotuv: 4000, miqdor: 120, minimal: 20 },
  ];

  const productIds: { id: string; sotuv: number; xarid: number; nomi: string }[] = [];
  for (const p of mahsulotlarRoyxati) {
    const existing = await prisma.product.findFirst({ where: { storeId: store.id, nomi: p.nomi } });
    const created =
      existing ||
      (await prisma.product.create({
        data: {
          storeId: store.id,
          categoryId: kategoriyalar[p.kategoriya],
          nomi: p.nomi,
          xaridNarxi: p.xarid,
          sotuvNarxi: p.sotuv,
          miqdori: p.miqdor,
          minimalQoldiq: p.minimal,
        },
      }));
    productIds.push({ id: created.id, sotuv: p.sotuv, xarid: p.xarid, nomi: p.nomi });
  }

  const mavjudSotuvlar = await prisma.sale.count({ where: { storeId: store.id } });
  if (mavjudSotuvlar === 0) {
    const to_lovTurlari: PaymentType[] = ["NAQD", "KARTA", "NAQD", "BOSHQA"];
    for (let kun = 6; kun >= 0; kun--) {
      const sana = new Date();
      sana.setDate(sana.getDate() - kun);
      const sotuvSoni = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < sotuvSoni; s++) {
        const tanlangan = productIds[Math.floor(Math.random() * productIds.length)];
        const miqdor = 1 + Math.floor(Math.random() * 3);
        const jamiSumma = tanlangan.sotuv * miqdor;
        const tannarx = tanlangan.xarid * miqdor;
        await prisma.sale.create({
          data: {
            storeId: store.id,
            userId: user.id,
            jamiSumma,
            tannarx,
            foyda: jamiSumma - tannarx,
            createdAt: sana,
            items: {
              create: [
                {
                  productId: tanlangan.id,
                  nomi: tanlangan.nomi,
                  narxi: tanlangan.sotuv,
                  tannarx: tanlangan.xarid,
                  miqdori: miqdor,
                },
              ],
            },
            payments: {
              create: { turi: to_lovTurlari[s % to_lovTurlari.length], summa: jamiSumma },
            },
          },
        });
      }
    }
  }

  const mavjudXarajat = await prisma.expense.count({ where: { storeId: store.id } });
  if (mavjudXarajat === 0) {
    await prisma.expense.createMany({
      data: [
        { storeId: store.id, nomi: "Do'kon ijarasi", summa: 1500000, kategoriya: "Ijara", sana: new Date() },
        { storeId: store.id, nomi: "Elektr energiyasi", summa: 250000, kategoriya: "Kommunal", sana: new Date() },
        { storeId: store.id, nomi: "Yetkazib berish xizmati", summa: 100000, kategoriya: "Transport", sana: new Date() },
      ],
    });
  }

  // Platforma administratori (super-admin) — do'kon egasi emas, butun
  // platformani boshqaradi: /admin panel orqali foydalanuvchilarni va
  // barcha do'konlardagi mahsulotlarni tahrirlash/o'chirish huquqiga ega.
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@doconboshqar.uz" },
    update: { isSuperAdmin: true },
    create: {
      ism: "Platforma",
      familiya: "Administratori",
      email: "admin@doconboshqar.uz",
      passwordHash: adminPasswordHash,
      isSuperAdmin: true,
    },
  });

  console.log("Demo ma'lumotlar tayyor.");
  console.log("Do'kon egasi sifatida kirish: email = demo@doconboshqar.uz, parol = parol123");
  console.log("Platforma admin sifatida kirish: email = admin@doconboshqar.uz, parol = admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
