"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function KirishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifikator, setIdentifikator] = useState("");
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setXato(null);
    setYuklanmoqda(true);
    try {
      const res = await apiFetch<{ foydalanuvchi: { isSuperAdmin?: boolean } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifikator, parol }),
      });
      const keyin = searchParams.get("keyin");
      if (keyin) {
        router.push(keyin);
      } else if (res.foydalanuvchi.isSuperAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setXato(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    } finally {
      setYuklanmoqda(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Tizimga kirish</h1>
        <p className="mt-1 text-sm text-slate-500">Hisobingizga kirib do'konlaringizni boshqaring.</p>

        {xato && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>}

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
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label !mb-0">Parol</label>
              <Link href="/parolni-unutdim" className="text-xs font-medium text-brand-600">
                Parolni unutdingizmi?
              </Link>
            </div>
            <input
              type="password"
              className="input"
              value={parol}
              onChange={(e) => setParol(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={yuklanmoqda}>
            {yuklanmoqda ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Hisobingiz yo'qmi?{" "}
          <Link href="/royxatdan-otish" className="font-medium text-brand-600">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </main>
  );
}
