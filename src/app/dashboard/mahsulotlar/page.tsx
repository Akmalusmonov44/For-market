"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Category {
  id: string;
  nomi: string;
}
interface Product {
  id: string;
  nomi: string;
  shtrixKod: string | null;
  xaridNarxi: string;
  sotuvNarxi: string;
  miqdori: number;
  minimalQoldiq: number;
  categoryId: string | null;
  category: Category | null;
}

const BO_SH_FORM = {
  nomi: "",
  categoryId: "",
  shtrixKod: "",
  xaridNarxi: "",
  sotuvNarxi: "",
  miqdori: "",
  minimalQoldiq: "",
};

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function MahsulotlarPage() {
  const { tanlanganDokon } = useStore();
  const { ko_rsat } = useToast();
  const [mahsulotlar, setMahsulotlar] = useState<Product[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Category[]>([]);
  const [qidiruv, setQidiruv] = useState("");
  const [tanlanganKategoriya, setTanlanganKategoriya] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Product | null>(null);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  const [yangiKategoriya, setYangiKategoriya] = useState("");

  async function malumotlarniYuklash() {
    if (!tanlanganDokon) return;
    setYuklanmoqda(true);
    const [m, k] = await Promise.all([
      apiFetch<{ mahsulotlar: Product[] }>(`/api/stores/${tanlanganDokon.id}/products`),
      apiFetch<{ kategoriyalar: Category[] }>(`/api/stores/${tanlanganDokon.id}/categories`),
    ]);
    setMahsulotlar(m.mahsulotlar);
    setKategoriyalar(k.kategoriyalar);
    setYuklanmoqda(false);
  }

  useEffect(() => {
    malumotlarniYuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanlanganDokon]);

  function ochishYangi() {
    setTahrirlanayotgan(null);
    setForm(BO_SH_FORM);
    setModalOchiq(true);
  }

  function ochishTahrirlash(p: Product) {
    setTahrirlanayotgan(p);
    setForm({
      nomi: p.nomi,
      categoryId: p.categoryId || "",
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
    if (!tanlanganDokon) return;
    setSaqlanmoqda(true);
    try {
      const body = {
        nomi: form.nomi,
        categoryId: form.categoryId || null,
        shtrixKod: form.shtrixKod,
        xaridNarxi: form.xaridNarxi,
        sotuvNarxi: form.sotuvNarxi,
        miqdori: form.miqdori,
        minimalQoldiq: form.minimalQoldiq || "0",
      };
      if (tahrirlanayotgan) {
        await apiFetch(`/api/products/${tahrirlanayotgan.id}`, { method: "PUT", body: JSON.stringify(body) });
        ko_rsat("Mahsulot yangilandi.", "success");
      } else {
        await apiFetch(`/api/stores/${tanlanganDokon.id}/products`, { method: "POST", body: JSON.stringify(body) });
        ko_rsat("Mahsulot qo'shildi.", "success");
      }
      setModalOchiq(false);
      malumotlarniYuklash();
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
      await apiFetch(`/api/products/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Mahsulot o'chirildi.", "success");
      setOchirishId(null);
      malumotlarniYuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  async function kategoriyaQoshish() {
    if (!tanlanganDokon || !yangiKategoriya.trim()) return;
    try {
      await apiFetch(`/api/stores/${tanlanganDokon.id}/categories`, {
        method: "POST",
        body: JSON.stringify({ nomi: yangiKategoriya }),
      });
      setYangiKategoriya("");
      const k = await apiFetch<{ kategoriyalar: Category[] }>(`/api/stores/${tanlanganDokon.id}/categories`);
      setKategoriyalar(k.kategoriyalar);
      ko_rsat("Kategoriya qo'shildi.", "success");
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    }
  }

  const filtrlangan = mahsulotlar.filter((p) => {
    const q = qidiruv.trim().toLowerCase();
    const mos = !q || p.nomi.toLowerCase().includes(q) || (p.shtrixKod || "").includes(q);
    const katMos = !tanlanganKategoriya || p.categoryId === tanlanganKategoriya;
    return mos && katMos;
  });

  if (!tanlanganDokon) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <button className="btn-primary" onClick={ochishYangi}>
          + Mahsulot qo'shish
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Qidirish (nomi yoki shtrix-kod)..."
          value={qidiruv}
          onChange={(e) => setQidiruv(e.target.value)}
        />
        <select
          className="input max-w-xs"
          value={tanlanganKategoriya}
          onChange={(e) => setTanlanganKategoriya(e.target.value)}
        >
          <option value="">Barcha kategoriyalar</option>
          {kategoriyalar.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nomi}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : filtrlangan.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Mahsulot topilmadi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Kategoriya</th>
                <th className="px-4 py-3">Shtrix-kod</th>
                <th className="px-4 py-3">Xarid narxi</th>
                <th className="px-4 py-3">Sotuv narxi</th>
                <th className="px-4 py-3">Qoldiq</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtrlangan.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-medium">{p.nomi}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category?.nomi || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{p.shtrixKod || "—"}</td>
                  <td className="px-4 py-3">{pul(Number(p.xaridNarxi))}</td>
                  <td className="px-4 py-3">{pul(Number(p.sotuvNarxi))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        p.miqdori === 0
                          ? "bg-red-100 text-red-700"
                          : p.miqdori <= p.minimalQoldiq
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.miqdori} ta
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => ochishTahrirlash(p)}>
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

      <Modal
        ochiq={modalOchiq}
        onYopish={() => setModalOchiq(false)}
        sarlavha={tahrirlanayotgan ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
      >
        <form onSubmit={saqlash} className="space-y-4">
          <div>
            <label className="label">Mahsulot nomi</label>
            <input
              className="input"
              value={form.nomi}
              onChange={(e) => setForm((f) => ({ ...f, nomi: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kategoriya</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Tanlanmagan</option>
                {kategoriyalar.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nomi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Shtrix-kod</label>
              <input
                className="input"
                value={form.shtrixKod}
                onChange={(e) => setForm((f) => ({ ...f, shtrixKod: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Xarid narxi</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.xaridNarxi}
                onChange={(e) => setForm((f) => ({ ...f, xaridNarxi: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Sotuv narxi</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.sotuvNarxi}
                onChange={(e) => setForm((f) => ({ ...f, sotuvNarxi: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Miqdori</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.miqdori}
                onChange={(e) => setForm((f) => ({ ...f, miqdori: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Minimal qoldiq</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.minimalQoldiq}
                onChange={(e) => setForm((f) => ({ ...f, minimalQoldiq: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <label className="label mb-1">Yangi kategoriya qo'shish</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={yangiKategoriya}
                onChange={(e) => setYangiKategoriya(e.target.value)}
                placeholder="Kategoriya nomi"
              />
              <button type="button" className="btn-secondary shrink-0" onClick={kategoriyaQoshish}>
                Qo'shish
              </button>
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
        matn="Ushbu mahsulotni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi."
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
