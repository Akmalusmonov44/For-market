"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const MENYU = [
  { href: "/dashboard", label: "Boshqaruv paneli", icon: "📊" },
  { href: "/dashboard/kassa", label: "Sotuv / Kassa", icon: "🧾" },
  { href: "/dashboard/mahsulotlar", label: "Mahsulotlar", icon: "📦" },
  { href: "/dashboard/ombor", label: "Ombor", icon: "🏬" },
  { href: "/dashboard/xarajatlar", label: "Xarajatlar", icon: "💸" },
  { href: "/dashboard/hisobotlar", label: "Hisobotlar", icon: "📈" },
  { href: "/dashboard/xodimlar", label: "Xodimlar", icon: "👥" },
  { href: "/dashboard/sozlamalar", label: "Sozlamalar", icon: "⚙️" },
];

export default function Sidebar({ ochiq, onYopish }: { ochiq: boolean; onYopish: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {ochiq && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onYopish} />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0",
          ochiq ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center px-6 text-lg font-bold text-brand-700">
          DoConBoshqar
        </div>
        <nav className="space-y-1 px-3">
          {MENYU.map((item) => {
            const faol = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onYopish}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  faol
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
