"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch } from "@/lib/api-client";

interface Product {
  id: string;
  nomi: string;
  miqdori: number;
  minimalQoldiq: number;
  xaridNarxi: string;
  category: { nomi: string } | null;
}

interface InventoryData {
  jamiMahsulot: number;
  tugaganSoni: number;
  kamQolganSoni: number;
  jamiQoldiqQiymati: number;
  tugaganMahsulotlar: Product[];
  kamQolganMahsulotlar: Product[];
  barchaMahsulotlar: Product[];
}

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function OmborPage() {
  const { tanlanganDokon } = useStore();
  const [data, setData] = useState<InventoryData | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    if (!tanlanganDokon) return;
    let bekor = false;
    (async () => {
      setYuklanmoqda(true);
      const d = await apiFetch<InventoryData>(`/api/stores/${tanlanganDokon.id}/inventory`);
      if (!bekor) setData(d);
      setYuklanmoqda(false);
    })();
    return () => {
      bekor = true;
    };
  }, [tanlanganDokon]);

  if (!tanlanganDokon) return null;
  if (yuklanmoqda || !data) return <div className="text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ombor</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <i className="ti ti-package" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">Jami mahsulotlar</div>
          </div>
          <div className="text-2xl font-semibold">{data.jamiMahsulot}</div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">Kam qolgan</div>
          </div>
          <div className="text-2xl font-semibold text-amber-600">{data.kamQolganSoni}</div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">Tugagan</div>
          </div>
          <div className="text-2xl font-semibold text-red-600">{data.tugaganSoni}</div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="icon-badge bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <i className="ti ti-coin" aria-hidden="true" />
            </div>
            <div className="text-sm text-slate-500">Ombor qiymati (tannarxda)</div>
          </div>
          <div className="text-2xl font-semibold">{pul(data.jamiQoldiqQiymati)}</div>
        </div>
      </div>

      {data.kamQolganSoni > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <i className="ti ti-alert-triangle text-base" aria-hidden="true" />
          Diqqat! Ba'zi mahsulotlarning qoldig'i kamayib ketgan.
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-red-700">Tugagan mahsulotlar</h2>
        {data.tugaganMahsulotlar.length === 0 ? (
          <p className="text-sm text-slate-400">Tugagan mahsulotlar yo'q.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.tugaganMahsulotlar.map((p) => (
              <li key={p.id} className="flex justify-between py-2 text-sm">
                <span>{p.nomi}</span>
                <span className="text-slate-400">{p.category?.nomi || "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-amber-700">Kam qolgan mahsulotlar</h2>
        {data.kamQolganMahsulotlar.length === 0 ? (
          <p className="text-sm text-slate-400">Kam qolgan mahsulotlar yo'q.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.kamQolganMahsulotlar.map((p) => (
              <li key={p.id} className="flex justify-between py-2 text-sm">
                <span>{p.nomi}</span>
                <span className="text-amber-600">
                  Qoldiq: {p.miqdori} (min: {p.minimalQoldiq})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card overflow-x-auto p-5">
        <h2 className="mb-4 font-semibold">Barcha mahsulotlar</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
            <tr>
              <th className="py-2">Nomi</th>
              <th className="py-2">Kategoriya</th>
              <th className="py-2">Qoldiq</th>
              <th className="py-2">Minimal</th>
            </tr>
          </thead>
          <tbody>
            {data.barchaMahsulotlar.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60">
                <td className="py-2 font-medium">{p.nomi}</td>
                <td className="py-2 text-slate-500">{p.category?.nomi || "—"}</td>
                <td className="py-2">{p.miqdori}</td>
                <td className="py-2 text-slate-500">{p.minimalQoldiq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
