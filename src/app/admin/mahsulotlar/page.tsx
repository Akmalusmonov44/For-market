"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ProductRow {
  id: string;
  nomi: string;
  shtrixKod: string | null;
  xaridNarxi: string;
  sotuvNarxi: string;
  miqdori: number;
  minimalQoldiq: number;
  category: { nomi: string } | null;
  store: { id: string; nomi: string };
}

interface StoreOption {
  id: string;
  nomi: string;
}

const BO_SH_FORM = { nomi: "", shtrixKod: "", xaridNarxi: "", sotuvNarxi: "", miqdori: "", minimalQoldiq: "" };
const BO_SH_YANGI_FORM = { storeId: "", ...BO_SH_FORM };

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function AdminMahsulotlarPage() {
  const { ko_rsat } = useToast();
  const [mahsulotlar, setMahsulotlar] = useState<ProductRow[]>([]);
  const [dokonlar, setDokonlar] = useState<StoreOption[]>([]);
  const [qidiruv, setQidiruv] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<ProductRow | null>(null);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const [yangiModalOchiq, setYangiModalOchiq] = useState(false);
  const [yangiForm, setYangiForm] = useState(BO_SH_YANGI_FORM);
  const [yangiSaqlanmoqda, setYangiSaqlanmoqda] = useState(false);

  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  async function yuklash(q?: string) {
    setYuklanmoqda(true);
    const url = q ? `/api/admin/products?qidiruv=${encodeURIComponent(q)}` : "/api/admin/products";
    const d = await apiFetch<{ mahsulotlar: ProductRow[] }>(url);
    setMahsulotlar(d.mahsulotlar);
    setYuklanmoqda(false);
  }

  async function dokonlarniYuklash() {
    const d = await apiFetch<{ dokonlar: StoreOption[] }>("/api/admin/stores");
    setDokonlar(d.dokonlar);
  }

  useEffect(() => {
    yuklash();
    dokonlarniYuklash();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => yuklash(qidiruv), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qidiruv]);

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
    if (!tahrirlanayotgan) return;
    setSaqlanmoqda(true);
    try {
      await apiFetch(`/api/admin/products/${tahrirlanayotgan.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      ko_rsat("Mahsulot yangilandi.", "success");
      setModalOchiq(false);
      yuklash(qidiruv);
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
      yuklash(qidiruv);
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  function yangiOchish() {
    setYangiForm(BO_SH_YANGI_FORM);
    setYangiModalOchiq(true);
  }

  async function yangiSaqlash(e: React.FormEvent) {
    e.preventDefault();
    setYangiSaqlanmoqda(true);
    try {
      await apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify(yangiForm) });
      ko_rsat("Mahsulot qo'shildi.", "success");
      setYangiModalOchiq(false);
      yuklash(qidiruv);
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setYangiSaqlanmoqda(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <p className="text-sm text-slate-500">Platformadagi barcha do'konlar bo'yicha mahsulotlar.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-sm"
          placeholder="Mahsulot nomi bo'yicha qidirish..."
          value={qidiruv}
          onChange={(e) => setQidiruv(e.target.value)}
        />
        <button className="btn-primary" onClick={yangiOchish}>
          + Yangi mahsulot qo'shish
        </button>
      </div>

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : mahsulotlar.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Mahsulot topilmadi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Do'kon</th>
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
                  <td className="px-4 py-3 text-slate-500">{p.store.nomi}</td>
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

      <Modal
        ochiq={modalOchiq}
        onYopish={() => setModalOchiq(false)}
        sarlavha={`Mahsulotni tahrirlash${tahrirlanayotgan ? ` — ${tahrirlanayotgan.store.nomi}` : ""}`}
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

      <Modal ochiq={yangiModalOchiq} onYopish={() => setYangiModalOchiq(false)} sarlavha="Yangi mahsulot qo'shish">
        <form onSubmit={yangiSaqlash} className="space-y-4">
          <div>
            <label className="label">Do'kon</label>
            <select
              className="input"
              value={yangiForm.storeId}
              onChange={(e) => setYangiForm((f) => ({ ...f, storeId: e.target.value }))}
              required
            >
              <option value="">Tanlang...</option>
              {dokonlar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nomi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mahsulot nomi</label>
            <input
              className="input"
              value={yangiForm.nomi}
              onChange={(e) => setYangiForm((f) => ({ ...f, nomi: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Shtrix-kod</label>
            <input
              className="input"
              value={yangiForm.shtrixKod}
              onChange={(e) => setYangiForm((f) => ({ ...f, shtrixKod: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Xarid narxi</label>
              <input
                type="number"
                min="0"
                className="input"
                value={yangiForm.xaridNarxi}
                onChange={(e) => setYangiForm((f) => ({ ...f, xaridNarxi: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Sotuv narxi</label>
              <input
                type="number"
                min="0"
                className="input"
                value={yangiForm.sotuvNarxi}
                onChange={(e) => setYangiForm((f) => ({ ...f, sotuvNarxi: e.target.value }))}
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
                value={yangiForm.miqdori}
                onChange={(e) => setYangiForm((f) => ({ ...f, miqdori: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Minimal qoldiq</label>
              <input
                type="number"
                min="0"
                className="input"
                value={yangiForm.minimalQoldiq}
                onChange={(e) => setYangiForm((f) => ({ ...f, minimalQoldiq: e.target.value }))}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Eslatma: mahsulot kategoriyasiz qo'shiladi — do'kon egasi keyinchalik
            kategoriya biriktirishi mumkin.
          </p>
          <button type="submit" className="btn-primary w-full" disabled={yangiSaqlanmoqda}>
            {yangiSaqlanmoqda ? "Saqlanmoqda..." : "Qo'shish"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
