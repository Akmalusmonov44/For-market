"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface StoreRow {
  id: string;
  nomi: string;
  turi: string;
  telefon: string | null;
  manzil: string | null;
  createdAt: string;
  egasi: { ism: string; familiya: string; email: string | null; telefon: string | null } | null;
  _count: { products: number; sales: number; members: number };
}

export default function AdminDokonlarPage() {
  const [dokonlar, setDokonlar] = useState<StoreRow[]>([]);
  const [qidiruv, setQidiruv] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await apiFetch<{ dokonlar: StoreRow[] }>("/api/admin/stores");
      setDokonlar(d.dokonlar);
      setYuklanmoqda(false);
    })();
  }, []);

  const filtrlangan = dokonlar.filter((d) => {
    const q = qidiruv.trim().toLowerCase();
    if (!q) return true;
    return (
      d.nomi.toLowerCase().includes(q) ||
      (d.egasi ? `${d.egasi.ism} ${d.egasi.familiya}`.toLowerCase().includes(q) : false)
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Do'konlar</h1>
        <p className="text-sm text-slate-500">Platformadagi barcha do'konlar.</p>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Do'kon nomi yoki egasi bo'yicha qidirish..."
        value={qidiruv}
        onChange={(e) => setQidiruv(e.target.value)}
      />

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : filtrlangan.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Do'kon topilmadi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Do'kon nomi</th>
                <th className="px-4 py-3">Turi</th>
                <th className="px-4 py-3">Egasi</th>
                <th className="px-4 py-3">Mahsulotlar</th>
                <th className="px-4 py-3">Sotuvlar</th>
                <th className="px-4 py-3">Xodimlar</th>
              </tr>
            </thead>
            <tbody>
              {filtrlangan.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-medium">{d.nomi}</td>
                  <td className="px-4 py-3 text-slate-500">{d.turi}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {d.egasi ? `${d.egasi.ism} ${d.egasi.familiya}` : "—"}
                  </td>
                  <td className="px-4 py-3">{d._count.products}</td>
                  <td className="px-4 py-3">{d._count.sales}</td>
                  <td className="px-4 py-3">{d._count.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
