"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface StoreDetail {
  id: string;
  nomi: string;
  turi: string;
  telefon: string | null;
  manzil: string | null;
  egasi: { ism: string; familiya: string; email: string | null; telefon: string | null } | null;
  _count: { products: number; sales: number; members: number; expenses: number };
}

interface ProductRow {
  id: string;
  nomi: string;
  shtrixKod: string | null;
  xaridNarxi: string;
  sotuvNarxi: string;
  miqdori: number;
  minimalQoldiq: number;
  category: { nomi: string } | null;
}

interface SaleRow {
  id: string;
  jamiSumma: string;
  foyda: string;
  createdAt: string;
  items: { nomi: string; miqdori: number }[];
  payments: { turi: "NAQD" | "KARTA" | "BOSHQA" }[];
}

interface ExpenseRow {
  id: string;
  nomi: string;
  summa: string;
  kategoriya: string;
  sana: string;
}

interface MemberRow {
  id: string;
  role: "EGASI" | "MENEJER" | "SOTUVCHI";
  user: { ism: string; familiya: string; email: string | null; telefon: string | null };
}

const TABS = [
  { key: "mahsulotlar", label: "Mahsulotlar" },
  { key: "sotuvlar", label: "Sotuvlar" },
  { key: "xarajatlar", label: "Xarajatlar" },
  { key: "xodimlar", label: "Xodimlar" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const TOLOV_BELGISI: Record<string, string> = { NAQD: "💵 Naqd", KARTA: "💳 Karta", QARZ: "📝 Nasiya", BOSHQA: "🔁 Boshqa" };
const ROL_NOMI: Record<string, string> = { EGASI: "Egasi", MENEJER: "Menejer", SOTUVCHI: "Sotuvchi" };
const BO_SH_FORM = { nomi: "", shtrixKod: "", xaridNarxi: "", sotuvNarxi: "", miqdori: "", minimalQoldiq: "" };

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function AdminDokonDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { ko_rsat } = useToast();

  const [dokon, setDokon] = useState<StoreDetail | null>(null);
  const [tab, setTab] = useState<TabKey>("mahsulotlar");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const [mahsulotlar, setMahsulotlar] = useState<ProductRow[]>([]);
  const [sotuvlar, setSotuvlar] = useState<SaleRow[]>([]);
  const [xarajatlar, setXarajatlar] = useState<ExpenseRow[]>([]);
  const [xodimlar, setXodimlar] = useState<MemberRow[]>([]);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<ProductRow | null>(null);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  async function asosiyniYuklash() {
    setYuklanmoqda(true);
    const d = await apiFetch<{ dokon: StoreDetail }>(`/api/admin/stores/${storeId}`);
    setDokon(d.dokon);
    setYuklanmoqda(false);
  }

  async function mahsulotlarniYuklash() {
    const d = await apiFetch<{ mahsulotlar: ProductRow[] }>(`/api/admin/products?storeId=${storeId}`);
    setMahsulotlar(d.mahsulotlar);
  }

  useEffect(() => {
    asosiyniYuklash();
    mahsulotlarniYuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => {
    (async () => {
      if (tab === "sotuvlar" && sotuvlar.length === 0) {
        const d = await apiFetch<{ sotuvlar: SaleRow[] }>(`/api/admin/stores/${storeId}/sales`);
        setSotuvlar(d.sotuvlar);
      }
      if (tab === "xarajatlar" && xarajatlar.length === 0) {
        const d = await apiFetch<{ xarajatlar: ExpenseRow[] }>(`/api/admin/stores/${storeId}/expenses`);
        setXarajatlar(d.xarajatlar);
      }
      if (tab === "xodimlar" && xodimlar.length === 0) {
        const d = await apiFetch<{ xodimlar: MemberRow[] }>(`/api/admin/stores/${storeId}/employees`);
        setXodimlar(d.xodimlar);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, storeId]);

  function yangiOchish() {
    setTahrirlanayotgan(null);
    setForm(BO_SH_FORM);
    setModalOchiq(true);
  }

  function tahrirlashniOchish(p: ProductRow) {
    setTahrirlanayotgan(p);
    setForm({
      nomi: p.nomi,
      shtrixKod: p.shtrixKod || "",
      xaridNarxi: p.xaridNarxi,
      sotuvNarxi: p.sotuvNarxi,
      miqdori: String(p.miqdori),
      minimalQoldiq: String(p.minimalQoldiq),
    });
    setModalOchiq(true);
  }

  async function saqlash(e: React.FormEvent) {
    e.preventDefault();
    setSaqlanmoqda(true);
    try {
      if (tahrirlanayotgan) {
        await apiFetch(`/api/admin/products/${tahrirlanayotgan.id}`, { method: "PUT", body: JSON.stringify(form) });
        ko_rsat("Mahsulot yangilandi.", "success");
      } else {
        await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify({ ...form, storeId }) });
        ko_rsat("Mahsulot qo'shildi.", "success");
      }
      setModalOchiq(false);
      mahsulotlarniYuklash();
      asosiyniYuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setSaqlanmoqda(false);
    }
  }

  async function ochirish() {
    if (!ochirishId) return;
    setOchirilmoqda(true);
    try {
      await apiFetch(`/api/admin/products/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Mahsulot o'chirildi.", "success");
      setOchirishId(null);
      mahsulotlarniYuklash();
      asosiyniYuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  if (yuklanmoqda || !dokon) return <div className="text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{dokon.nomi}</h1>
        <p className="text-sm text-slate-500">
          {dokon.turi} · Egasi: {dokon.egasi ? `${dokon.egasi.ism} ${dokon.egasi.familiya}` : "—"}
          {dokon.egasi?.email ? ` (${dokon.egasi.email})` : ""}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mahsulotlar" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={yangiOchish}>
              + Mahsulot qo'shish
            </button>
          </div>
          <div className="card overflow-x-auto">
            {mahsulotlar.length === 0 ? (
              <div className="p-10 text-center text-slate-400">Mahsulot yo'q.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nomi</th>
                    <th className="px-4 py-3">Xarid narxi</th>
                    <th className="px-4 py-3">Sotuv narxi</th>
                    <th className="px-4 py-3">Qoldiq</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mahsulotlar.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60">
                      <td className="px-4 py-3 font-medium">{p.nomi}</td>
                      <td className="px-4 py-3">{pul(Number(p.xaridNarxi))}</td>
                      <td className="px-4 py-3">{pul(Number(p.sotuvNarxi))}</td>
                      <td className="px-4 py-3">{p.miqdori} ta</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => tahrirlashniOchish(p)}>
                          Tahrirlash
                        </button>
                        <button
                          className="btn-ghost !px-2 !py-1 text-xs text-red-600"
                          onClick={() => setOchirishId(p.id)}
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "sotuvlar" && (
        <div className="card overflow-x-auto">
          <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800">
            Faqat ko'rish uchun — sotuvlarni tahrirlash yoki o'chirish mumkin emas.
          </p>
          {sotuvlar.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Sotuv yo'q.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Mahsulotlar</th>
                  <th className="px-4 py-3">To'lov</th>
                  <th className="px-4 py-3">Summa</th>
                  <th className="px-4 py-3">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {sotuvlar.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-4 py-3 text-slate-500">{new Date(s.createdAt).toLocaleString("uz-UZ")}</td>
                    <td className="px-4 py-3">{s.items.map((i) => i.nomi).join(", ")}</td>
                    <td className="px-4 py-3">{s.payments[0] ? TOLOV_BELGISI[s.payments[0].turi] : "—"}</td>
                    <td className="px-4 py-3 font-medium">{pul(Number(s.jamiSumma))}</td>
                    <td className="px-4 py-3 text-emerald-600">{pul(Number(s.foyda))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "xarajatlar" && (
        <div className="card overflow-x-auto">
          <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800">
            Faqat ko'rish uchun — xarajatlarni tahrirlash yoki o'chirish mumkin emas.
          </p>
          {xarajatlar.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Xarajat yo'q.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Nomi</th>
                  <th className="px-4 py-3">Kategoriya</th>
                  <th className="px-4 py-3">Summa</th>
                </tr>
              </thead>
              <tbody>
                {xarajatlar.map((x) => (
                  <tr key={x.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-4 py-3 text-slate-500">{new Date(x.sana).toLocaleDateString("uz-UZ")}</td>
                    <td className="px-4 py-3 font-medium">{x.nomi}</td>
                    <td className="px-4 py-3 text-slate-500">{x.kategoriya}</td>
                    <td className="px-4 py-3 text-red-600">{pul(Number(x.summa))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "xodimlar" && (
        <div className="card overflow-x-auto">
          <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800">
            Faqat ko'rish uchun. Xodimlarni boshqarish uchun do'kon egasiga murojaat qiling.
          </p>
          {xodimlar.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Xodim yo'q.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Ism familiya</th>
                  <th className="px-4 py-3">Aloqa</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {xodimlar.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-4 py-3 font-medium">
                      {m.user.ism} {m.user.familiya}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.user.email || m.user.telefon}</td>
                    <td className="px-4 py-3">{ROL_NOMI[m.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        ochiq={modalOchiq}
        onYopish={() => setModalOchiq(false)}
        sarlavha={tahrirlanayotgan ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
      >
        <form onSubmit={saqlash} className="space-y-4">
          <div>
            <label className="label">Mahsulot nomi</label>
            <input className="input" value={form.nomi} onChange={(e) => setForm((f) => ({ ...f, nomi: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Shtrix-kod</label>
            <input className="input" value={form.shtrixKod} onChange={(e) => setForm((f) => ({ ...f, shtrixKod: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Xarid narxi</label>
              <input type="number" min="0" className="input" value={form.xaridNarxi} onChange={(e) => setForm((f) => ({ ...f, xaridNarxi: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Sotuv narxi</label>
              <input type="number" min="0" className="input" value={form.sotuvNarxi} onChange={(e) => setForm((f) => ({ ...f, sotuvNarxi: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Miqdori</label>
              <input type="number" min="0" className="input" value={form.miqdori} onChange={(e) => setForm((f) => ({ ...f, miqdori: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Minimal qoldiq</label>
              <input type="number" min="0" className="input" value={form.minimalQoldiq} onChange={(e) => setForm((f) => ({ ...f, minimalQoldiq: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saqlanmoqda}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        ochiq={!!ochirishId}
        onYopish={() => setOchirishId(null)}
        onTasdiqlash={ochirish}
        matn="Ushbu mahsulotni o'chirishni tasdiqlaysizmi?"
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
