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
      <div className="flex items-center gap-3 pr-20 md:pr-24">
        {foydalanuvchi?.isSuperAdmin && (
          <Link href="/admin" className="btn-secondary !px-3 !py-2 text-sm">
            {t("topbar.platformaAdmin")}
          </Link>
        )}
        <StoreSelector />
        <button onClick={chiqish} className="btn-secondary !px-3 !py-2 text-sm">
          {t("topbar.chiqish")}
        </button>
      </div>
    </header>
  );
}
