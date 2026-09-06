"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "./StoreContext";
import StoreSelector from "./StoreSelector";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/components/i18n/LanguageContext";

export default function Topbar({ onMenyu }: { onMenyu: () => void }) {
  const { foydalanuvchi } = useStore();
  const router = useRouter();
  const { t } = useLanguage();

  async function chiqish() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/kirish");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <button className="btn-ghost !p-2 md:hidden" onClick={onMenyu} aria-label="Menyu">
        ☰
      </button>
      <div className="hidden text-sm text-slate-500 md:block">
        {foydalanuvchi ? `${t("topbar.xushKelibsiz")}, ${foydalanuvchi.ism}` : ""}
      </div>
      <div className="flex items-center gap-2 pr-16 sm:gap-3 sm:pr-20 md:pr-24">
        {foydalanuvchi?.isSuperAdmin && (
          <Link
            href="/admin"
            className="btn-secondary flex !items-center !gap-1.5 !px-2.5 !py-2 text-sm sm:!px-3"
            aria-label={t("topbar.platformaAdmin")}
          >
            <i className="ti ti-shield-lock text-base" aria-hidden="true" />
            <span className="hidden sm:inline">{t("topbar.platformaAdmin")}</span>
          </Link>
        )}
        <StoreSelector />
        <button
          onClick={chiqish}
          className="btn-secondary flex !items-center !gap-1.5 !px-2.5 !py-2 text-sm sm:!px-3"
          aria-label={t("topbar.chiqish")}
        >
          <i className="ti ti-logout text-base" aria-hidden="true" />
          <span className="hidden sm:inline">{t("topbar.chiqish")}</span>
        </button>
      </div>
    </header>
  );
}
