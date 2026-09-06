"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Expense {
  id: string;
  nomi: string;
  summa: string;
  kategoriya: string;
  sana: string;
  izoh: string | null;
}

const BO_SH_FORM = { nomi: "", summa: "", kategoriya: "", sana: new Date().toISOString().slice(0, 10), izoh: "" };

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function XarajatlarPage() {
  const { tanlanganDokon } = useStore();
  const { ko_rsat } = useToast();
  const [xarajatlar, setXarajatlar] = useState<Expense[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Expense | null>(null);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  async function yuklash() {
    if (!tanlanganDokon) return;
    setYuklanmoqda(true);
    const d = await apiFetch<{ xarajatlar: Expense[] }>(`/api/stores/${tanlanganDokon.id}/expenses`);
    setXarajatlar(d.xarajatlar);
    setYuklanmoqda(false);
  }

  useEffect(() => {
    yuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanlanganDokon]);

  function ochishYangi() {
    setTahrirlanayotgan(null);
    setForm(BO_SH_FORM);
    setModalOchiq(true);
  }

  function ochishTahrirlash(x: Expense) {
    setTahrirlanayotgan(x);
    setForm({
      nomi: x.nomi,
      summa: x.summa,
      kategoriya: x.kategoriya,
      sana: x.sana.slice(0, 10),
      izoh: x.izoh || "",
    });
    setModalOchiq(true);
  }

  async function saqlash(e: React.FormEvent) {
    e.preventDefault();
    if (!tanlanganDokon) return;
    setSaqlanmoqda(true);
    try {
      if (tahrirlanayotgan) {
        await apiFetch(`/api/expenses/${tahrirlanayotgan.id}`, { method: "PUT", body: JSON.stringify(form) });
        ko_rsat("Xarajat yangilandi.", "success");
      } else {
        await apiFetch(`/api/stores/${tanlanganDokon.id}/expenses`, { method: "POST", body: JSON.stringify(form) });
        ko_rsat("Xarajat qo'shildi.", "success");
      }
      setModalOchiq(false);
      yuklash();
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
      await apiFetch(`/api/expenses/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Xarajat o'chirildi.", "success");
      setOchirishId(null);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  const jamiXarajat = xarajatlar.reduce((s, x) => s + Number(x.summa), 0);

  if (!tanlanganDokon) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Xarajatlar</h1>
        <button className="btn-primary" onClick={ochishYangi}>
          + Xarajat qo'shish
        </button>
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="icon-badge bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i className="ti ti-receipt-2" aria-hidden="true" />
          </div>
          <div className="text-sm text-slate-500">Jami xarajatlar</div>
        </div>
        <div className="text-2xl font-semibold text-red-600">{pul(jamiXarajat)}</div>
      </div>

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : xarajatlar.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Xarajatlar yo'q.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Kategoriya</th>
                <th className="px-4 py-3">Summa</th>
                <th className="px-4 py-3">Izoh</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {xarajatlar.map((x) => (
                <tr key={x.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3">{new Date(x.sana).toLocaleDateString("uz-UZ")}</td>
                  <td className="px-4 py-3 font-medium">{x.nomi}</td>
                  <td className="px-4 py-3 text-slate-500">{x.kategoriya}</td>
                  <td className="px-4 py-3 text-red-600">{pul(Number(x.summa))}</td>
                  <td className="px-4 py-3 text-slate-400">{x.izoh || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => ochishTahrirlash(x)}>
                      Tahrirlash
                    </button>
                    <button
                      className="btn-ghost !px-2 !py-1 text-xs text-red-600"
                      onClick={() => setOchirishId(x.id)}
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
        sarlavha={tahrirlanayotgan ? "Xarajatni tahrirlash" : "Yangi xarajat qo'shish"}
      >
        <form onSubmit={saqlash} className="space-y-4">
          <div>
            <label className="label">Xarajat nomi</label>
            <input
              className="input"
              value={form.nomi}
              onChange={(e) => setForm((f) => ({ ...f, nomi: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Summa</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.summa}
                onChange={(e) => setForm((f) => ({ ...f, summa: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Kategoriya</label>
              <input
                className="input"
                value={form.kategoriya}
                onChange={(e) => setForm((f) => ({ ...f, kategoriya: e.target.value }))}
                placeholder="Ijara, kommunal, maosh..."
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Sana</label>
            <input
              type="date"
              className="input"
              value={form.sana}
              onChange={(e) => setForm((f) => ({ ...f, sana: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Izoh</label>
            <textarea
              className="input"
              rows={2}
              value={form.izoh}
              onChange={(e) => setForm((f) => ({ ...f, izoh: e.target.value }))}
            />
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
        matn="Ushbu xarajatni o'chirishni tasdiqlaysizmi?"
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
