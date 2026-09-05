# DoConBoshqar — Ko'p do'konli POS va Ombor SaaS platformasi

To'liq ishlaydigan, production-ready full-stack SaaS ilova: Next.js (frontend + backend API) +
PostgreSQL + Prisma ORM. Real autentifikatsiya, role-based ruxsatlar, ko'p do'konli (multi-tenant)
arxitektura, real POS/kassa tranzaksiyalari, ombor, xarajatlar va hisobotlar.

Butun interfeys o'zbek tilida.

---

## 1. Talab qilinadigan dasturlar

- Node.js 20+ (https://nodejs.org)
- PostgreSQL 14+ (yoki Docker orqali)
- npm (Node bilan birga keladi)
- (ixtiyoriy) Docker va Docker Compose

## 2. O'rnatish

```bash
# Loyiha papkasiga o'ting
cd pos-saas

# Bog'liqliklarni o'rnating
npm install
```

> Eslatma: `npm install` oxirida avtomatik ravishda `prisma generate` ishga tushadi
> (`postinstall` skripti). Buning uchun internetga chiqish (binaries.prisma.sh manzili)
> ochiq bo'lishi kerak. Agar korporativ tarmoq/proksi bu manzilni bloklasa, xatolik
> chiqishi mumkin — bunday holda oddiy uy/ofis internetidan yoki boshqa muhitdan
> o'rnating.

## 3. Environment o'zgaruvchilari

`.env.example` faylidan nusxa oling:

```bash
cp .env.example .env
```

`.env` faylini oching va quyidagilarni to'ldiring:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_saas?schema=public"
AUTH_SECRET="kamida-32-belgili-tasodifiy-maxfiy-kalit"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`AUTH_SECRET` ni tasodifiy qiymatga almashtiring, masalan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Database yaratish

Agar PostgreSQL kompyuteringizda o'rnatilgan bo'lsa:

```bash
createdb pos_saas
```

Yoki Docker orqali faqat database'ni ishga tushirish:

```bash
docker run --name pos-saas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pos_saas -p 5432:5432 -d postgres:16-alpine
```

## 5. Migration

Database jadvallarini yaratish uchun:

```bash
npx prisma migrate dev --name init
```

Bu buyruq `prisma/schema.prisma` asosida barcha jadvallarni (`User`, `Store`,
`StoreMember`, `Product`, `Category`, `Sale`, `SaleItem`, `Payment`, `Expense`,
`InventoryTransaction`) yaratadi.

## 6. Demo ma'lumotlar (Seed)

Interfeys bo'sh bo'lib qolmasligi uchun demo ma'lumotlarni yuklang:

```bash
npm run seed
```

Bu haqiqiy database yozuvlarini yaratadi: 1 ta demo foydalanuvchi, 1 ta do'kon
("Baraka Market"), kategoriyalar, mahsulotlar, so'nggi 7 kunlik sotuvlar va xarajatlar.

**Demo test hisobi:**

```
Email:  demo@doconboshqar.uz
Parol:  parol123
```

## 7. Development server

```bash
npm run dev
```

Brauzerda oching: **http://localhost:3000**

Yuqoridagi demo hisob bilan kiring yoki "Ro'yxatdan o'tish" orqali yangi hisob yarating.

## 8. Production build

```bash
npm run build
npm start
```

## 9. Deployment

Loyiha quyidagi xizmatlarga joylashtirishga tayyor:

- **Vercel** — frontend + API route'lar uchun (Next.js uchun native qo'llab-quvvatlash).
  Database uchun Supabase, Neon yoki Railway PostgreSQL'dan foydalaning.
- **Railway** / **Render** — to'liq ilova + PostgreSQL bitta joyda.
- **Docker** — `docker-compose.yml` orqali o'zingizning serveringizda:

```bash
docker compose up --build
```

Bu buyruq PostgreSQL va web konteynerlarini ishga tushiradi, migratsiyalarni
avtomatik qo'llaydi va demo ma'lumotlarni yuklaydi.

Har qanday holatda deployment paytida quyidagi environment o'zgaruvchilarini
platformangizning "Environment Variables" bo'limida o'rnatishni unutmang:
`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.

## 10. Database haqida

PostgreSQL + Prisma ORM ishlatilgan. Asosiy modellar:

| Model | Tavsif |
|---|---|
| `User` | Tizim foydalanuvchisi (bir nechta do'konga a'zo bo'la oladi) |
| `Store` | Do'kon (multi-tenant asosiy birlik) |
| `StoreMember` | Foydalanuvchi ↔ Do'kon bog'lanishi + rol (EGASI/MENEJER/SOTUVCHI) |
| `Category` | Do'konga tegishli mahsulot kategoriyasi |
| `Product` | Mahsulot (narx, qoldiq, minimal qoldiq) |
| `Sale` / `SaleItem` | Sotuv va uning tarkibidagi mahsulotlar |
| `Payment` | Sotuv uchun to'lov (naqd/karta/boshqa) |
| `Expense` | Do'kon xarajatlari |
| `InventoryTransaction` | Ombor harakatlari tarixi (kirim/chiqim/sotuv/tuzatish) |

**Xavfsizlik:** har bir so'rovda `storeId` foydalanuvchining `StoreMember`
yozuvi orqali tekshiriladi (`src/lib/permissions.ts`). Boshqa do'konga tegishli
`storeId`/`productId` bilan so'rov yuborish 404/403 xatosini qaytaradi — IDOR
hujumlarining oldi shu tarzda olinadi.

Ma'lumotlar bazasini vizual ko'rish uchun:

```bash
npx prisma studio
```

## 11. API haqida

Barcha endpointlar `/api/...` ostida, JSON qaytaradi va cookie-based JWT
autentifikatsiyasidan foydalanadi (`httpOnly` cookie, 7 kunlik amal muddati).

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/stores
POST   /api/stores
GET    /api/stores/:id
PUT    /api/stores/:id
DELETE /api/stores/:id

GET    /api/stores/:id/categories
POST   /api/stores/:id/categories

GET    /api/stores/:id/products
POST   /api/stores/:id/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/stores/:id/sales      (POS tarixi)
POST   /api/stores/:id/sales      (kassa checkout — atomik tranzaksiya)

GET    /api/stores/:id/inventory

GET    /api/stores/:id/expenses
POST   /api/stores/:id/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id

GET    /api/stores/:id/reports    (?boshlanish=YYYY-MM-DD&tugash=YYYY-MM-DD)

GET    /api/stores/:id/employees
POST   /api/stores/:id/employees
PUT    /api/employees/:id
DELETE /api/employees/:id

# Platforma admin (faqat isSuperAdmin=true uchun)
GET    /api/admin/users
PUT    /api/admin/users/:userId
DELETE /api/admin/users/:userId

GET    /api/admin/stores

GET    /api/admin/products
PUT    /api/admin/products/:productId
DELETE /api/admin/products/:productId
```

Har bir endpoint avval `requireUser()` orqali autentifikatsiyani, so'ng
`requireStoreMember()` / `requireStoreRole()` orqali do'konga a'zolik va
rolni tekshiradi.

## 12. Rollar (Role-based access control)

| Rol | Huquqlar |
|---|---|
| **EGASI** | To'liq boshqaruv: do'kon sozlamalari, xodimlar, barcha bo'limlar |
| **MENEJER** | Mahsulotlar, ombor, xarajatlar, hisobotlar (xodimlarni boshqara olmaydi) |
| **SOTUVCHI** | Faqat sotuv (kassa) va mahsulotlarni ko'rish |

## 13. Platforma admin paneli (Super-admin)

Bu — do'kon egasi (EGASI) rolidan farqli, **butun platformani** boshqaruvchi alohida
darajadagi admin. `/admin` manzilida joylashgan va faqat `User.isSuperAdmin = true`
bo'lgan hisoblar kira oladi.

**Imkoniyatlari:**
- Barcha foydalanuvchilarni (do'kon egalarini) ko'rish, ma'lumotlarini tahrirlash,
  parolini tiklash va hisobini butunlay o'chirish (o'chirilganda ularga tegishli
  barcha do'konlar, mahsulotlar, sotuvlar ham o'chadi)
- Platformadagi barcha do'konlarni ko'rish (kim egasi, nechta mahsulot/sotuv/xodim)
- Istalgan do'kondagi istalgan mahsulotni tahrirlash yoki o'chirish — do'kon
  xodimi bo'lish shart emas

**Demo admin hisobi** (agar `npm run seed` ishlatgan bo'lsangiz):
```
Email: admin@doconboshqar.uz
Parol: admin123
```

**Har qanday foydalanuvchini qo'lda super-admin qilish** (masalan, o'zingizni):

```bash
npx prisma studio
```
Ochilgan oynada `User` jadvalidan o'zingizning yozuvingizni toping va
`isSuperAdmin` maydonini `true` ga o'zgartirib saqlang.

> ⚠️ **Muhim:** ushbu funksiya schema.prisma'ga yangi maydon (`isSuperAdmin`)
> qo'shadi. Agar loyihani avvalroq o'rnatib, migration qilgan bo'lsangiz,
> o'zgarishlarni qo'llash uchun qayta migration ishga tushiring:
> ```bash
> npx prisma migrate dev --name add_super_admin
> ```

## Loyiha strukturasi

```
pos-saas/
├── prisma/
│   ├── schema.prisma       # Database sxemasi
│   └── seed.ts             # Demo ma'lumotlar
├── src/
│   ├── app/
│   │   ├── api/            # Backend API route'lar
│   │   ├── dashboard/      # Himoyalangan boshqaruv paneli sahifalari
│   │   ├── kirish/         # Login
│   │   ├── royxatdan-otish/ # Register
│   │   ├── dokon-yaratish/ # Do'kon yaratish
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── ui/              # Modal, Toast, ConfirmDialog
│   │   └── dashboard/        # Sidebar, Topbar, StoreSelector, StoreContext
│   ├── lib/
│   │   ├── db.ts            # Prisma client
│   │   ├── auth.ts          # Parol hash + JWT
│   │   ├── session.ts       # Joriy foydalanuvchini olish
│   │   ├── permissions.ts   # Multi-tenant ruxsat tekshiruvi (IDOR himoyasi)
│   │   ├── validation.ts    # Zod validatsiya sxemalari
│   │   └── api-helpers.ts   # Xatolarni izchil JSON formatga o'tkazish
│   └── middleware.ts        # Himoyalangan sahifalarga redirect
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Muammolarni bartaraf etish (Troubleshooting)

- **`prisma generate` internet xatosi bilan to'xtasa**: internet ulanishingizni
  tekshiring, `binaries.prisma.sh` manzili proksi/firewall orqali bloklanmaganiga
  ishonch hosil qiling, so'ng qaytadan `npx prisma generate` ni ishga tushiring.
- **Database ulanmasa**: `.env` dagi `DATABASE_URL` to'g'riligini va PostgreSQL
  serveringiz ishga tushganini tekshiring (`pg_isready` yoki Docker konteyner holati).
- **Portlar band bo'lsa**: `next dev -p 3001` orqali boshqa portda ishga tushiring.
