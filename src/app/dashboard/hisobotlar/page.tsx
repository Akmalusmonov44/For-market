"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ReportData {
  umumiyTushum: number;
  umumiyTannarx: number;
  yalpiFoyda: number;
  umumiyXarajat: number;
  sofFoyda: number;
  sotuvlarSoni: number;
  tolovTurlariBoyicha: { NAQD: number; KARTA: number; BOSHQA: number };
  kunlikSavdo: { sana: string; savdo: number; foyda: number }[];
  engKopSotilgan: { nomi: string; miqdor: number; tushum: number; foyda: number }[];
  engKopFoydaKeltirgan: { nomi: string; miqdor: number; tushum: number; foyda: number }[];
}

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

function bugun() {
  return new Date().toISOString().slice(0, 10);
}
function o_ttizKunOldin() {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
}

export default function HisobotlarPage() {
  const { tanlanganDokon } = useStore();
  const [boshlanish, setBoshlanish] = useState(o_ttizKunOldin());
  const [tugash, setTugash] = useState(bugun());
  const [data, setData] = useState<ReportData | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const yuklash = useCallback(async () => {
    if (!tanlanganDokon) return;
    setYuklanmoqda(true);
    const d = await apiFetch<ReportData>(
      `/api/stores/${tanlanganDokon.id}/reports?boshlanish=${boshlanish}&tugash=${tugash}`,
    );
    setData(d);
    setYuklanmoqda(false);
  }, [tanlanganDokon, boshlanish, tugash]);

  useEffect(() => {
    yuklash();
  }, [yuklash]);

  if (!tanlanganDokon) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hisobotlar</h1>

      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="label">Boshlanish sanasi</label>
          <input type="date" className="input" value={boshlanish} onChange={(e) => setBoshlanish(e.target.value)} />
        </div>
        <div>
          <label className="label">Tugash sanasi</label>
          <input type="date" className="input" value={tugash} onChange={(e) => setTugash(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={yuklash}>
          Ko'rsatish
        </button>
      </div>

      {yuklanmoqda || !data ? (
        <div className="text-slate-400">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="icon-badge bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <i className="ti ti-cash" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-500">Umumiy tushum</div>
              </div>
              <div className="text-xl font-semibold">{pul(data.umumiyTushum)}</div>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="icon-badge bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <i className="ti ti-trending-up" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-500">Yalpi foyda</div>
              </div>
              <div className="text-xl font-semibold text-emerald-600">{pul(data.yalpiFoyda)}</div>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="icon-badge bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <i className="ti ti-receipt-2" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-500">Xarajatlar</div>
              </div>
              <div className="text-xl font-semibold text-red-600">{pul(data.umumiyXarajat)}</div>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="icon-badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                  <i className="ti ti-wallet" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-500">Sof foyda</div>
              </div>
              <div className="text-xl font-semibold text-brand-700">{pul(data.sofFoyda)}</div>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="icon-badge bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <i className="ti ti-shopping-cart" aria-hidden="true" />
                </div>
                <div className="text-sm text-slate-500">Sotuvlar soni</div>
              </div>
              <div className="text-xl font-semibold">{data.sotuvlarSoni}</div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold">To'lov turlari bo'yicha</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <div className="text-sm text-slate-500">💵 Naqd pul</div>
                <div className="mt-1 font-bold">{pul(data.tolovTurlariBoyicha.NAQD)}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <div className="text-sm text-slate-500">💳 Bank karta</div>
                <div className="mt-1 font-bold">{pul(data.tolovTurlariBoyicha.KARTA)}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <div className="text-sm text-slate-500">🔁 Boshqa</div>
                <div className="mt-1 font-bold">{pul(data.tolovTurlariBoyicha.BOSHQA)}</div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold">Kunlik savdo</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.kunlikSavdo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="sana" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => pul(v)} />
                  <Bar dataKey="savdo" fill="#2563eb" name="Savdo" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-4 font-semibold">Eng ko'p sotilgan mahsulotlar</h2>
              {data.engKopSotilgan.length === 0 ? (
                <p className="text-sm text-slate-400">Ma'lumot yo'q.</p>
              ) : (
                <ul className="space-y-2">
                  {data.engKopSotilgan.map((p) => (
                    <li key={p.nomi} className="flex justify-between text-sm">
                      <span>{p.nomi}</span>
                      <span className="text-slate-500">{p.miqdor} ta</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-5">
              <h2 className="mb-4 font-semibold">Eng ko'p foyda keltirgan mahsulotlar</h2>
              {data.engKopFoydaKeltirgan.length === 0 ? (
                <p className="text-sm text-slate-400">Ma'lumot yo'q.</p>
              ) : (
                <ul className="space-y-2">
                  {data.engKopFoydaKeltirgan.map((p) => (
                    <li key={p.nomi} className="flex justify-between text-sm">
                      <span>{p.nomi}</span>
                      <span className="text-emerald-600">{pul(p.foyda)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
