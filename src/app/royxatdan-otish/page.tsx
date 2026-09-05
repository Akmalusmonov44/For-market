"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function RoyxatdanOtishPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ism: "",
    familiya: "",
    email: "",
    telefon: "",
    parol: "",
    parolTasdiq: "",
  });
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setXato(null);
    setYuklanmoqda(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
      router.push("/dokon-yaratish");
    } catch (err) {
      setXato(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    } finally {
      setYuklanmoqda(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Ro'yxatdan o'tish</h1>
        <p className="mt-1 text-sm text-slate-500">Yangi hisob yarating va do'koningizni boshqarishni boshlang.</p>

        {xato && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ism</label>
              <input className="input" value={form.ism} onChange={(e) => set("ism", e.target.value)} required />
            </div>
            <div>
              <label className="label">Familiya</label>
              <input className="input" value={form.familiya} onChange={(e) => set("familiya", e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="email@misol.uz"
            />
          </div>
          <div>
            <label className="label">Telefon raqami</label>
            <input
              className="input"
              value={form.telefon}
              onChange={(e) => set("telefon", e.target.value)}
              placeholder="+998901234567"
            />
          </div>
          <div>
            <label className="label">Parol</label>
            <input
              type="password"
              className="input"
              value={form.parol}
              onChange={(e) => set("parol", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Parolni tasdiqlang</label>
            <input
              type="password"
              className="input"
              value={form.parolTasdiq}
              onChange={(e) => set("parolTasdiq", e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={yuklanmoqda}>
            {yuklanmoqda ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Hisobingiz bormi?{" "}
          <Link href="/kirish" className="font-medium text-brand-600">
            Kirish
          </Link>
        </p>
      </div>
    </main>
  );
}
