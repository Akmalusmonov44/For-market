"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";

const TURLAR = [
  "Oziq-ovqat",
  "Kiyim-kechak",
  "Elektronika",
  "Maishiy texnika",
  "Dorixona",
  "Qurilish mollari",
  "Kantselyariya",
  "Boshqa",
];

export default function DokonYaratishPage() {
  const router = useRouter();
  const [nomi, setNomi] = useState("");
  const [turi, setTuri] = useState(TURLAR[0]);
  const [customTuri, setCustomTuri] = useState("");
  const [telefon, setTelefon] = useState("");
  const [manzil, setManzil] = useState("");
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setXato(null);
    setYuklanmoqda(true);
    try {
      const yakuniyTuri = turi === "Boshqa" ? customTuri || "Boshqa" : turi;
      await apiFetch("/api/stores", {
        method: "POST",
        body: JSON.stringify({ nomi, turi: yakuniyTuri, telefon, manzil }),
      });
      router.push("/dashboard");
    } catch (err) {
      setXato(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    } finally {
      setYuklanmoqda(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold">Do'koningizni yarating</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bir necha soniyada birinchi do'koningizni sozlaymiz.
        </p>

        {xato && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Do'kon nomi</label>
            <input className="input" value={nomi} onChange={(e) => setNomi(e.target.value)} required />
          </div>
          <div>
            <label className="label">Do'kon turi</label>
            <select className="input" value={turi} onChange={(e) => setTuri(e.target.value)}>
              {TURLAR.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {turi === "Boshqa" && (
            <div>
              <label className="label">Do'kon turini kiriting</label>
              <input className="input" value={customTuri} onChange={(e) => setCustomTuri(e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">Telefon raqami</label>
            <input className="input" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </div>
          <div>
            <label className="label">Manzil</label>
            <input className="input" value={manzil} onChange={(e) => setManzil(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={yuklanmoqda}>
            {yuklanmoqda ? "Yaratilmoqda..." : "Do'konni yaratish"}
          </button>
        </form>
      </div>
    </main>
  );
}
