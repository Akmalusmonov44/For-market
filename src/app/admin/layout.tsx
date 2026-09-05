"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

interface FoydalanuvchiInfo {
  id: string;
  ism: string;
  familiya: string;
  isSuperAdmin: boolean;
}

const MENYU = [
  { href: "/admin/foydalanuvchilar", label: "Foydalanuvchilar", icon: "👤" },
  { href: "/admin/dokonlar", label: "Do'konlar", icon: "🏬" },
  { href: "/admin/mahsulotlar", label: "Mahsulotlar", icon: "📦" },
];

function AdminInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [foydalanuvchi, setFoydalanuvchi] = useState<FoydalanuvchiInfo | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const data = await apiFetch<{ foydalanuvchi: FoydalanuvchiInfo | null }>("/api/auth/me");
      setFoydalanuvchi(data.foydalanuvchi);
      if (!data.foydalanuvchi) {
        router.replace("/kirish");
      } else if (!data.foydalanuvchi.isSuperAdmin) {
        router.replace("/dashboard");
      }
    })();
  }, [router]);

  if (foydalanuvchi === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Yuklanmoqda...</div>;
  }
  if (!foydalanuvchi || !foydalanuvchi.isSuperAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Yo'naltirilmoqda...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center px-6 text-lg font-bold text-brand-700">
          Platforma Admin
        </div>
        <nav className="space-y-1 px-3">
          {MENYU.map((item) => {
            const faol = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  faol
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>←</span> Do'kon paneliga qaytish
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 p-6 dark:bg-slate-950">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminInner>{children}</AdminInner>;
}
