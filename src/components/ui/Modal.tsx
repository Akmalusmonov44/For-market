"use client";

import { useEffect } from "react";

export default function Modal({
  ochiq,
  onYopish,
  sarlavha,
  children,
  kenglik = "max-w-md",
}: {
  ochiq: boolean;
  onYopish: () => void;
  sarlavha: string;
  children: React.ReactNode;
  kenglik?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onYopish();
    }
    if (ochiq) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ochiq, onYopish]);

  if (!ochiq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onYopish} />
      <div className={`card relative w-full ${kenglik} max-h-[90vh] overflow-y-auto p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{sarlavha}</h3>
          <button onClick={onYopish} className="btn-ghost !p-2" aria-label="Yopish">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
