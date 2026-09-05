"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

interface StoreDetail {
  id: string;
  nomi: string;
  turi: string;
  telefon: string | null;
  manzil: string | null;
  logoUrl: string | null;
}

export default function SozlamalarPage() {
  const { tanlanganDokon, qayta_yuklash } = useStore();
  const { ko_rsat } = useToast();
  const [dokon, setDokon] = useState<StoreDetail | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  useEffect(() => {
    if (!tanlanganDokon) return;
    (async () => {
      setYuklanmoqda(true);
      const d = await apiFetch<{ dokon: StoreDetail }>(`/api/stores/${tanlanganDokon.id}`);
      setDokon(d.dokon);
      setYuklanmoqda(false);
    })();
  }, [tanlanganDokon]);

  async function saqlash(e: React.FormEvent) {
    e.preventDefault();
    if (!tanlanganDokon || !dokon) return;
    setSaqlanmoqda(true);
    try {
      await apiFetch(`/api/stores/${tanlanganDokon.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nomi: dokon.nomi,
          turi: dokon.turi,
          telefon: dokon.telefon || "",
          manzil: dokon.manzil || "",
        }),
      });
      ko_rsat("Sozlamalar saqlandi.", "success");
      qayta_yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setSaqlanmoqda(false);
    }
  }

  if (!tanlanganDokon) return null;
  if (yuklanmoqda || !dokon) return <div className="text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Sozlamalar</h1>

      <form onSubmit={saqlash} className="card space-y-4 p-6">
        <h2 className="font-semibold">Do'kon ma'lumotlari</h2>
        <div>
          <label className="label">Do'kon nomi</label>
          <input
            className="input"
            value={dokon.nomi}
            onChange={(e) => setDokon({ ...dokon, nomi: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Do'kon turi</label>
          <input
            className="input"
            value={dokon.turi}
            onChange={(e) => setDokon({ ...dokon, turi: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input
            className="input"
            value={dokon.telefon || ""}
            onChange={(e) => setDokon({ ...dokon, telefon: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Manzil</label>
          <input
            className="input"
            value={dokon.manzil || ""}
            onChange={(e) => setDokon({ ...dokon, manzil: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Valyuta</label>
          <input className="input" value="UZS — O'zbek so'mi" disabled />
        </div>
        <button type="submit" className="btn-primary" disabled={saqlanmoqda}>
          {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
