"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useLanguage } from "@/components/i18n/LanguageContext";

function KirishForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifikator, setIdentifikator] = useState("");
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ foydalanuvchi: { isSuperAdmin?: boolean } | null }>("/api/auth/me");
        if (data.foydalanuvchi) {
          router.replace(data.foydalanuvchi.isSuperAdmin ? "/admin" : "/dashboard");
        }
      } catch {
        // e'tiborsiz qoldiramiz — foydalanuvchi shunchaki login formasini ko'radi
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <h1 className="text-2xl font-bold">{t("auth.kirishSarlavha")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("auth.kirishTavsif")}</p>

        {xato && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{xato}</div>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">{t("auth.identifikator")}</label>
            <input
              className="input"
              value={identifikator}
              onChange={(e) => setIdentifikator(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label !mb-0">{t("auth.parol")}</label>
              <Link href="/parolni-unutdim" className="text-xs font-medium text-brand-600">
                {t("auth.parolniUnutdingizmi")}
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
            {yuklanmoqda ? t("auth.tekshirilmoqda") : t("landing.kirish")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.hisobingizYoqmi")}{" "}
          <Link href="/royxatdan-otish" className="font-medium text-brand-600">
            {t("auth.royxatdanOtish")}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function KirishPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
          <div className="card w-full max-w-md p-8 text-center text-slate-500">
            Yuklanmoqda...
          </div>
        </main>
      }
    >
      <KirishForm />
    </Suspense>
  );
}