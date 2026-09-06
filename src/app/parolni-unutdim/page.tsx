"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function ParolniUnutdimPage() {
  const [identifikator, setIdentifikator] = useState("");
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setXato(null);
    setXabar(null);
    setYuklanmoqda(true);
    try {
      const res = await apiFetch<{ xabar: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifikator }),
      });
      setXabar(res.xabar);
    } catch (err) {
      setXato(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    } finally {
      setYuklanmoqda(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Parolni unutdingizmi?</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ro'yxatdan o'tishda kiritgan email manzilingizni kiriting — sizga parolni tiklash
          havolasini yuboramiz.
        </p>

        {xabar && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{xabar}</div>
        )}
        {xato && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>}

        {!xabar && (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email yoki telefon raqami</label>
              <input
                className="input"
                value={identifikator}
                onChange={(e) => setIdentifikator(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={yuklanmoqda}>
              {yuklanmoqda ? "Yuborilmoqda..." : "Havola yuborish"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/kirish" className="font-medium text-brand-600">
            ← Kirish sahifasiga qaytish
          </Link>
        </p>
      </div>
    </main>
  );
}
