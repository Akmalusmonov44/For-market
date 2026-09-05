import Link from "next/link";

const IMKONIYATLAR = [
  { sarlavha: "Kassa / POS", tavsif: "Shtrix-kod orqali tezkor sotuv, savat va bir necha to'lov turi." },
  { sarlavha: "Ombor nazorati", tavsif: "Real vaqtda qoldiq, kam qolgan va tugagan mahsulotlar bo'yicha bildirishnoma." },
  { sarlavha: "Ko'p do'kon", tavsif: "Bir hisobdan istalgancha do'konni boshqaring, ma'lumotlar to'liq ajratilgan." },
  { sarlavha: "Xodimlar va rollar", tavsif: "Egasi, menejer, sotuvchi — har biriga mos huquqlar." },
  { sarlavha: "Hisobotlar", tavsif: "Kunlik, haftalik, oylik savdo, foyda va eng ko'p sotilgan mahsulotlar." },
  { sarlavha: "Xarajatlar", tavsif: "Xarajatlarni yozib boring, sof foyda avtomatik hisoblansin." },
];

const NARXLAR = [
  { nomi: "Boshlang'ich", narx: "Bepul", tavsif: "1 ta do'kon, asosiy funksiyalar", tanlangan: false },
  { nomi: "Biznes", narx: "299 000 so'm/oy", tavsif: "Cheksiz do'kon, xodimlar, hisobotlar", tanlangan: true },
  { nomi: "Korporativ", narx: "Kelishilgan holda", tavsif: "Maxsus talablar va integratsiyalar", tanlangan: false },
];

const SAVOLLAR = [
  { s: "Ma'lumotlarim xavfsizmi?", j: "Ha. Har bir do'kon ma'lumotlari bir-biridan qat'iy ajratilgan va faqat tegishli xodimlar ko'ra oladi." },
  { s: "Bir nechta do'kon ochsam bo'ladimi?", j: "Ha, bitta hisobingiz bilan istalgancha do'kon yaratishingiz mumkin." },
  { s: "Internet bo'lmasa ishlaydimi?", j: "Tizim internet orqali ishlaydi, chunki barcha ma'lumotlar markaziy serverda saqlanadi." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold text-brand-700">DoConBoshqar</div>
        <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#platforma">Platforma haqida</a>
          <a href="#imkoniyatlar">Imkoniyatlar</a>
          <a href="#narxlar">Narxlar</a>
          <a href="#savol-javob">Savol-javob</a>
        </nav>
        <div className="flex gap-3">
          <Link href="/kirish" className="btn-secondary">Kirish</Link>
          <Link href="/royxatdan-otish" className="btn-primary">Do'kon ochish</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Do'koningizni <span className="text-brand-600">oson boshqaring</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Mahsulotlar, sotuvlar, ombor, xarajatlar va foydani bitta tizimda boshqaring.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/royxatdan-otish" className="btn-primary !px-6 !py-3 text-base">Do'kon ochish</Link>
          <Link href="/kirish" className="btn-secondary !px-6 !py-3 text-base">Kirish</Link>
        </div>
      </section>

      <section id="platforma" className="mx-auto max-w-6xl px-6 py-16">
        <div className="card grid gap-8 p-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Platforma haqida</h2>
            <p className="mt-3 text-slate-600">
              DoConBoshqar — kichik va o'rta biznes uchun yaratilgan to'liq savdo va ombor
              boshqaruv tizimi. Kassa, ombor va moliyaviy hisobotlaringiz bitta joyda, real
              vaqtda yangilanib turadi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-brand-50 p-5 text-center">
              <div className="text-2xl font-bold text-brand-700">Ko'p do'kon</div>
              <div className="text-sm text-slate-600">bitta hisobdan</div>
            </div>
            <div className="rounded-xl bg-brand-50 p-5 text-center">
              <div className="text-2xl font-bold text-brand-700">Real vaqt</div>
              <div className="text-sm text-slate-600">ombor va savdo</div>
            </div>
          </div>
        </div>
      </section>

      <section id="imkoniyatlar" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">Imkoniyatlar</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IMKONIYATLAR.map((f) => (
            <div key={f.sarlavha} className="card p-6">
              <h3 className="font-semibold text-slate-900">{f.sarlavha}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.tavsif}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="narxlar" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">Narxlar</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {NARXLAR.map((p) => (
            <div
              key={p.nomi}
              className={`card p-8 ${p.tanlangan ? "ring-2 ring-brand-600" : ""}`}
            >
              <h3 className="text-lg font-semibold">{p.nomi}</h3>
              <div className="mt-3 text-2xl font-bold text-brand-700">{p.narx}</div>
              <p className="mt-3 text-sm text-slate-600">{p.tavsif}</p>
              <Link href="/royxatdan-otish" className="btn-primary mt-6 w-full">
                Boshlash
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="savol-javob" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">Savol-javob</h2>
        <div className="space-y-4">
          {SAVOLLAR.map((qa) => (
            <div key={qa.s} className="card p-5">
              <div className="font-semibold">{qa.s}</div>
              <div className="mt-2 text-sm text-slate-600">{qa.j}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} DoConBoshqar. Barcha huquqlar himoyalangan.
      </footer>
    </main>
  );
}
