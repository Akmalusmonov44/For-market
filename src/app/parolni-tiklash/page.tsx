"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";

function ParolniTiklashForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [yangiParol, setYangiParol] = useState("");
  const [yangiParolTasdiq, setYangiParolTasdiq] = useState("");
  const [xabar, setXabar] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setXato(null);
    setYuklanmoqda(true);
    try {
      const res = await apiFetch<{ xabar: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, yangiParol, yangiParolTasdiq }),
      });
      setXabar(res.xabar);
      setTimeout(() => router.push("/kirish"), 2000);
    } catch (err) {
      setXato(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
    } finally {
      setYuklanmoqda(false);
    }
  }

  if (!token) {
    return (
      <div className="card w-full max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">Havola yaroqsiz</h1>
        <p className="mt-2 text-sm text-slate-500">
          Token topilmadi. Iltimos, parolni tiklashni qaytadan so'rang.
        </p>
        <Link href="/parolni-unutdim" className="btn-primary mt-6 inline-flex">
          Parolni tiklashni so'rash
        </Link>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="text-2xl font-bold">Yangi parol o'rnatish</h1>

      {xabar && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {xabar} Kirish sahifasiga yo'naltirilmoqda...
        </div>
      )}
      {xato && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>}

      {!xabar && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Yangi parol</label>
            <input
              type="password"
              className="input"
              value={yangiParol}
              onChange={(e) => setYangiParol(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Yangi parolni tasdiqlang</label>
            <input
              type="password"
              className="input"
              value={yangiParolTasdiq}
              onChange={(e) => setYangiParolTasdiq(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={yuklanmoqda}>
            {yuklanmoqda ? "Saqlanmoqda..." : "Parolni yangilash"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ParolniTiklashPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Suspense fallback={<div className="card w-full max-w-md p-8 text-center">Yuklanmoqda...</div>}>
        <ParolniTiklashForm />
      </Suspense>
    </main>
  );
}