"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useLanguage } from "@/components/i18n/LanguageContext";

const MENYU = [
  { href: "/dashboard", key: "nav.dashboard" as const, icon: "layout-dashboard" },
  { href: "/dashboard/kassa", key: "nav.kassa" as const, icon: "receipt-2" },
  { href: "/dashboard/mahsulotlar", key: "nav.mahsulotlar" as const, icon: "box" },
  { href: "/dashboard/ombor", key: "nav.ombor" as const, icon: "building-warehouse" },
  { href: "/dashboard/xarajatlar", key: "nav.xarajatlar" as const, icon: "wallet" },
  { href: "/dashboard/qarzdorlar", key: "nav.qarzdorlar" as const, icon: "report-money" },
  { href: "/dashboard/hisobotlar", key: "nav.hisobotlar" as const, icon: "chart-bar" },
  { href: "/dashboard/xodimlar", key: "nav.xodimlar" as const, icon: "users" },
  { href: "/dashboard/sozlamalar", key: "nav.sozlamalar" as const, icon: "settings" },
];

export default function Sidebar({ ochiq, onYopish }: { ochiq: boolean; onYopish: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

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
                <i className={`ti ti-${item.icon} text-lg`} aria-hidden="true" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
