"use client";

import { useLanguage } from "./LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="fixed right-3 top-3 z-[200] flex gap-1 rounded-full border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <button
        onClick={() => setLocale("uz")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          locale === "uz" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        🇺🇿 UZ
      </button>
      <button
        onClick={() => setLocale("ru")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          locale === "ru" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        🇷🇺 RU
      </button>
    </div>
  );
}
