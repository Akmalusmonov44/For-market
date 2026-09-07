"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStore } from "./StoreContext";

export default function StoreSelector() {
  const { dokonlar, tanlanganDokon, dokonTanlash } = useStore();
  const [ochiq, setOchiq] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOchiq(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!tanlanganDokon) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOchiq((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
      >
        <span className="max-w-[90px] truncate sm:max-w-[140px]">{tanlanganDokon.nomi}</span>
        <span className="text-slate-400">▼</span>
      </button>
      {ochiq && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {dokonlar.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                dokonTanlash(d.id);
                setOchiq(false);
                window.location.reload();
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                d.id === tanlanganDokon.id ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40" : ""
              }`}
            >
              <span className="truncate">{d.nomi}</span>
              <span className="text-xs text-slate-400">{d.role}</span>
            </button>
          ))}
          <Link
            href="/dokon-yaratish"
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            + Yangi do'kon qo'shish
          </Link>
        </div>
      )}
    </div>
  );
}
