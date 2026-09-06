"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Debt {
  id: string;
  mijozIsmi: string;
  mijozTelefon: string | null;
  summa: string;
  toLanganSumma: string;
  izoh: string | null;
  sana: string;
  saleId: string | null;
}

const BO_SH_FORM = { mijozIsmi: "", mijozTelefon: "", summa: "", izoh: "" };

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function QarzdorlarPage() {
  const { tanlanganDokon } = useStore();
  const { ko_rsat } = useToast();
  const [qarzlar, setQarzlar] = useState<Debt[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [faqatOchiq, setFaqatOchiq] = useState(true);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const [tolovModalQarz, setTolovModalQarz] = useState<Debt | null>(null);
  const [tolovSumma, setTolovSumma] = useState("");
  const [tolovSaqlanmoqda, setTolovSaqlanmoqda] = useState(false);

  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  async function yuklash() {
    if (!tanlanganDokon) return;
    setYuklanmoqda(true);
    const d = await apiFetch<{ qarzlar: Debt[] }>(`/api/stores/${tanlanganDokon.id}/debts`);
    setQarzlar(d.qarzlar);
    setYuklanmoqda(false);
  }

  useEffect(() => {
    yuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanlanganDokon]);

  async function saqlash(e: React.FormEvent) {
    e.preventDefault();
    if (!tanlanganDokon) return;
    setSaqlanmoqda(true);
    try {
      await apiFetch(`/api/stores/${tanlanganDokon.id}/debts`, { method: "POST", body: JSON.stringify(form) });
      ko_rsat("Qarz yozildi.", "success");
      setModalOchiq(false);
      setForm(BO_SH_FORM);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setSaqlanmoqda(false);
    }
  }

  async function tolovQilish(e: React.FormEvent) {
    e.preventDefault();
    if (!tolovModalQarz) return;
    setTolovSaqlanmoqda(true);
    try {
      await apiFetch(`/api/debts/${tolovModalQarz.id}`, {
        method: "PUT",
        body: JSON.stringify({ toLovSumma: tolovSumma }),
      });
      ko_rsat("To'lov qayd etildi.", "success");
      setTolovModalQarz(null);
      setTolovSumma("");
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setTolovSaqlanmoqda(false);
    }
  }

  async function ochirish() {
    if (!ochirishId) return;
    setOchirilmoqda(true);
    try {
      await apiFetch(`/api/debts/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Qarz yozuvi o'chirildi.", "success");
      setOchirishId(null);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  const korsatilgan = qarzlar.filter((q) => !faqatOchiq || Number(q.summa) - Number(q.toLanganSumma) > 0);
  const jamiQoldiq = qarzlar.reduce((s, q) => s + (Number(q.summa) - Number(q.toLanganSumma)), 0);

  if (!tanlanganDokon) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Qarzdorlar</h1>
        <button className="btn-primary" onClick={() => setModalOchiq(true)}>
          + Qarz qo'shish
        </button>
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="icon-badge bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <i className="ti ti-report-money" aria-hidden="true" />
          </div>
          <div className="text-sm text-slate-500">Jami qoldiq qarzdorlik</div>
        </div>
        <div className="text-2xl font-semibold text-amber-600">{pul(jamiQoldiq)}</div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={faqatOchiq} onChange={(e) => setFaqatOchiq(e.target.checked)} />
        Faqat to'lanmagan qarzlarni ko'rsatish
      </label>

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : korsatilgan.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Qarz yozuvlari yo'q.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Qarz summasi</th>
                <th className="px-4 py-3">To'langan</th>
                <th className="px-4 py-3">Qoldiq</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {korsatilgan.map((q) => {
                const qoldiq = Number(q.summa) - Number(q.toLanganSumma);
                return (
                  <tr key={q.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-4 py-3 text-slate-500">{new Date(q.sana).toLocaleDateString("uz-UZ")}</td>
                    <td className="px-4 py-3 font-medium">
                      {q.mijozIsmi}
                      {q.mijozTelefon && <div className="text-xs text-slate-400">{q.mijozTelefon}</div>}
                    </td>
                    <td className="px-4 py-3">{pul(Number(q.summa))}</td>
                    <td className="px-4 py-3 text-emerald-600">{pul(Number(q.toLanganSumma))}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${qoldiq > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {qoldiq > 0 ? pul(qoldiq) : "To'langan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {qoldiq > 0 && (
                        <button
                          className="btn-ghost !px-2 !py-1 text-xs"
                          onClick={() => {
                            setTolovModalQarz(q);
                            setTolovSumma("");
                          }}
                        >
                          To'lov qilish
                        </button>
                      )}
                      <button
                        className="btn-ghost !px-2 !py-1 text-xs text-red-600"
                        onClick={() => setOchirishId(q.id)}
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal ochiq={modalOchiq} onYopish={() => setModalOchiq(false)} sarlavha="Yangi qarz qo'shish">
        <form onSubmit={saqlash} className="space-y-4">
          <div>
            <label className="label">Mijoz ismi</label>
            <input
              className="input"
              value={form.mijozIsmi}
              onChange={(e) => setForm((f) => ({ ...f, mijozIsmi: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Telefon raqami (ixtiyoriy)</label>
            <input
              className="input"
              value={form.mijozTelefon}
              onChange={(e) => setForm((f) => ({ ...f, mijozTelefon: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Qarz summasi</label>
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
            <label className="label">Izoh (ixtiyoriy)</label>
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

      <Modal
        ochiq={!!tolovModalQarz}
        onYopish={() => setTolovModalQarz(null)}
        sarlavha={`To'lov qilish — ${tolovModalQarz?.mijozIsmi ?? ""}`}
      >
        {tolovModalQarz && (
          <form onSubmit={tolovQilish} className="space-y-4">
            <p className="text-sm text-slate-500">
              Qoldiq qarz:{" "}
              <span className="font-semibold text-amber-600">
                {pul(Number(tolovModalQarz.summa) - Number(tolovModalQarz.toLanganSumma))}
              </span>
            </p>
            <div>
              <label className="label">To'lov summasi</label>
              <input
                type="number"
                min="0"
                className="input"
                value={tolovSumma}
                onChange={(e) => setTolovSumma(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={tolovSaqlanmoqda}>
              {tolovSaqlanmoqda ? "Saqlanmoqda..." : "To'lovni qayd etish"}
            </button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        ochiq={!!ochirishId}
        onYopish={() => setOchirishId(null)}
        onTasdiqlash={ochirish}
        matn="Ushbu qarz yozuvini o'chirishni tasdiqlaysizmi?"
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
