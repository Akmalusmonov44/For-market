"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/dashboard/StoreContext";
import { useLanguage } from "@/components/i18n/LanguageContext";
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
  kamQolganMahsulotlar: { id: string; nomi: string; miqdori: number; minimalQoldiq: number }[];
  tugaganMahsulotlar: { id: string; nomi: string }[];
}

interface SaleRow {
  id: string;
  jamiSumma: string;
  foyda: string;
  createdAt: string;
  items: { nomi: string; miqdori: number }[];
  payments: { turi: "NAQD" | "KARTA" | "BOSHQA" }[];
}

const TOLOV_BELGISI: Record<string, string> = { NAQD: "💵 Naqd", KARTA: "💳 Karta", BOSHQA: "🔁 Boshqa" };

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

function StatCard({
  sarlavha,
  qiymat,
  rang,
  ikon,
  ikonRang,
}: {
  sarlavha: string;
  qiymat: string;
  rang?: string;
  ikon: string;
  ikonRang: string;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <div className={`icon-badge ${ikonRang}`}>
          <i className={`ti ti-${ikon}`} aria-hidden="true" />
        </div>
        <div className="text-sm text-slate-500">{sarlavha}</div>
      </div>
      <div className={`text-2xl font-semibold ${rang || "text-slate-900 dark:text-slate-100"}`}>{qiymat}</div>
    </div>
  );
}

export default function DashboardHomePage() {
  const { tanlanganDokon } = useStore();
  const { t } = useLanguage();
  const [hisobot, setHisobot] = useState<ReportData | null>(null);
  const [ombor, setOmbor] = useState<InventoryData | null>(null);
  const [songgiSotuvlar, setSonggiSotuvlar] = useState<SaleRow[]>([]);
  const [bugungi, setBugungi] = useState({ savdo: 0, foyda: 0, xarajat: 0, soni: 0 });
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    if (!tanlanganDokon) return;
    let bekor = false;

    async function yuklash() {
          if (!tanlanganDokon) return;
      setYuklanmoqda(true);
      try {
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
        <StatCard
          sarlavha={t("dash.bugungiSavdo")}
          qiymat={pul(bugungi.savdo)}
          ikon="cash"
          ikonRang="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          sarlavha={t("dash.bugungiFoyda")}
          qiymat={pul(bugungi.foyda)}
          rang="text-emerald-600"
          ikon="trending-up"
          ikonRang="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
        <StatCard
          sarlavha={t("dash.bugungiXarajat")}
          qiymat={pul(bugungi.xarajat)}
          rang="text-red-600"
          ikon="receipt-2"
          ikonRang="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
        />
        <StatCard
          sarlavha={t("dash.bugungiSotuvlarSoni")}
          qiymat={String(bugungi.soni)}
          ikon="shopping-cart"
          ikonRang="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href="/dashboard/ombor" className="card p-5 transition hover:border-brand-400">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <i className="ti ti-package" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">{t("dash.ombordagiMahsulotlar")}</div>
          </div>
          <div className="text-2xl font-semibold">{ombor?.jamiMahsulot ?? 0}</div>
        </Link>
        <Link href="/dashboard/ombor" className="card p-5 transition hover:border-brand-400">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">{t("dash.kamQolganMahsulotlar")}</div>
          </div>
          <div className="text-2xl font-semibold text-amber-600">{ombor?.kamQolganSoni ?? 0}</div>
          {ombor && ombor.kamQolganMahsulotlar.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
              {ombor.kamQolganMahsulotlar.slice(0, 3).map((p) => (
                <li key={p.id} className="truncate">
                  {p.nomi} — {p.miqdori} dona qoldi
                </li>
              ))}
              {ombor.kamQolganMahsulotlar.length > 3 && (
                <li className="text-brand-600">
                  +{ombor.kamQolganMahsulotlar.length - 3} ta yana...
                </li>
              )}
            </ul>
          )}
        </Link>
        <Link href="/dashboard/ombor" className="card p-5 transition hover:border-brand-400">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">{t("dash.tugaganMahsulotlar")}</div>
          </div>
          <div className="text-2xl font-semibold text-red-600">{ombor?.tugaganSoni ?? 0}</div>
          {ombor && ombor.tugaganMahsulotlar.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
              {ombor.tugaganMahsulotlar.slice(0, 3).map((p) => (
                <li key={p.id} className="truncate">
                  {p.nomi}
                </li>
              ))}
              {ombor.tugaganMahsulotlar.length > 3 && (
                <li className="text-brand-600">+{ombor.tugaganMahsulotlar.length - 3} ta yana...</li>
              )}
            </ul>
          )}
        </Link>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">{t("dash.songgiSavdo")}</h2>
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
        <h2 className="mb-4 font-semibold">{t("dash.songgiSotuvlar")}</h2>
        {songgiSotuvlar.length === 0 ? (
          <p className="text-sm text-slate-400">Hali sotuvlar yo'q.</p>
        ) : (
          <div className="space-y-2">
            {songgiSotuvlar.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                <div>
                  <div className="font-medium">{s.items.map((i) => i.nomi).join(", ")}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>{new Date(s.createdAt).toLocaleString("uz-UZ")}</span>
                    {s.payments[0] && (
                      <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800">
                        {TOLOV_BELGISI[s.payments[0].turi]}
                      </span>
                    )}
                  </div>
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
