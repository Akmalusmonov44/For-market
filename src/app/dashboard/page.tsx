"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch } from "@/lib/api-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ReportData {
  umumiyTushum: number;
  yalpiFoyda: number;
  umumiyXarajat: number;
  sofFoyda: number;
  sotuvlarSoni: number;
  kunlikSavdo: { sana: string; savdo: number; foyda: number }[];
}

interface InventoryData {
  jamiMahsulot: number;
  kamQolganSoni: number;
  tugaganSoni: number;
}

interface SaleRow {
  id: string;
  jamiSumma: string;
  foyda: string;
  createdAt: string;
  items: { nomi: string; miqdori: number }[];
}

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

function StatCard({ sarlavha, qiymat, rang }: { sarlavha: string; qiymat: string; rang?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500">{sarlavha}</div>
      <div className={`mt-2 text-2xl font-bold ${rang || "text-slate-900 dark:text-slate-100"}`}>{qiymat}</div>
    </div>
  );
}

export default function DashboardHomePage() {
  const { tanlanganDokon } = useStore();
  const [hisobot, setHisobot] = useState<ReportData | null>(null);
  const [ombor, setOmbor] = useState<InventoryData | null>(null);
  const [songgiSotuvlar, setSonggiSotuvlar] = useState<SaleRow[]>([]);
  const [bugungi, setBugungi] = useState({ savdo: 0, foyda: 0, xarajat: 0, soni: 0 });
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    if (!tanlanganDokon) return;
    let bekor = false;

    async function yuklash() {
      setYuklanmoqda(true);
      try {
        if (!tanlanganDokon) return;
        const bugun = new Date().toISOString().slice(0, 10);
        const [h, o, bugungiHisobot, sotuvlar] = await Promise.all([
          apiFetch<ReportData>(`/api/stores/${tanlanganDokon.id}/reports`),
          apiFetch<InventoryData>(`/api/stores/${tanlanganDokon.id}/inventory`),
          apiFetch<ReportData>(`/api/stores/${tanlanganDokon.id}/reports?boshlanish=${bugun}&tugash=${bugun}`),
          apiFetch<{ sotuvlar: SaleRow[] }>(`/api/stores/${tanlanganDokon.id}/sales?limit=5`),
        ]);
        if (bekor) return;
        setHisobot(h);
        setOmbor(o);
        setSonggiSotuvlar(sotuvlar.sotuvlar);
        setBugungi({
          savdo: bugungiHisobot.umumiyTushum,
          foyda: bugungiHisobot.yalpiFoyda,
          xarajat: bugungiHisobot.umumiyXarajat,
          soni: bugungiHisobot.sotuvlarSoni,
        });
      } finally {
        if (!bekor) setYuklanmoqda(false);
      }
    }
    yuklash();
    return () => {
      bekor = true;
    };
  }, [tanlanganDokon]);

  if (!tanlanganDokon) return null;
  if (yuklanmoqda) return <div className="text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
        <p className="text-sm text-slate-500">{tanlanganDokon.nomi}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard sarlavha="Bugungi savdo" qiymat={pul(bugungi.savdo)} />
        <StatCard sarlavha="Bugungi foyda" qiymat={pul(bugungi.foyda)} rang="text-emerald-600" />
        <StatCard sarlavha="Bugungi xarajat" qiymat={pul(bugungi.xarajat)} rang="text-red-600" />
        <StatCard sarlavha="Bugungi sotuvlar soni" qiymat={String(bugungi.soni)} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard sarlavha="Ombordagi mahsulotlar" qiymat={String(ombor?.jamiMahsulot ?? 0)} />
        <StatCard sarlavha="Kam qolgan mahsulotlar" qiymat={String(ombor?.kamQolganSoni ?? 0)} rang="text-amber-600" />
        <StatCard sarlavha="Tugagan mahsulotlar" qiymat={String(ombor?.tugaganSoni ?? 0)} rang="text-red-600" />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">So'nggi 30 kunlik savdo va foyda</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hisobot?.kunlikSavdo || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="sana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => pul(v)} />
              <Line type="monotone" dataKey="savdo" stroke="#2563eb" name="Savdo" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="foyda" stroke="#16a34a" name="Foyda" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">So'nggi sotuvlar</h2>
        {songgiSotuvlar.length === 0 ? (
          <p className="text-sm text-slate-400">Hali sotuvlar yo'q.</p>
        ) : (
          <div className="space-y-2">
            {songgiSotuvlar.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                <div>
                  <div className="font-medium">{s.items.map((i) => i.nomi).join(", ")}</div>
                  <div className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString("uz-UZ")}</div>
                </div>
                <div className="font-semibold text-brand-700">{pul(Number(s.jamiSumma))}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
