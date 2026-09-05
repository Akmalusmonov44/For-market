"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

export interface DokonSummary {
  id: string;
  nomi: string;
  turi: string;
  logoUrl: string | null;
  role: "EGASI" | "MENEJER" | "SOTUVCHI";
}

export interface FoydalanuvchiInfo {
  id: string;
  ism: string;
  familiya: string;
  email: string | null;
  telefon: string | null;
  isSuperAdmin?: boolean;
}

interface StoreContextValue {
  foydalanuvchi: FoydalanuvchiInfo | null;
  dokonlar: DokonSummary[];
  tanlanganDokon: DokonSummary | null;
  dokonTanlash: (id: string) => void;
  yuklanmoqda: boolean;
  qayta_yuklash: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = "pos_saas_tanlangan_dokon";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [foydalanuvchi, setFoydalanuvchi] = useState<FoydalanuvchiInfo | null>(null);
  const [dokonlar, setDokonlar] = useState<DokonSummary[]>([]);
  const [tanlanganId, setTanlanganId] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const yuklash = useCallback(async () => {
    setYuklanmoqda(true);
    try {
      const data = await apiFetch<{ foydalanuvchi: FoydalanuvchiInfo | null; dokonlar: DokonSummary[] }>(
        "/api/auth/me",
      );
      setFoydalanuvchi(data.foydalanuvchi);
      setDokonlar(data.dokonlar || []);

      const saqlangan = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const mavjudmi = data.dokonlar?.some((d) => d.id === saqlangan);
      if (saqlangan && mavjudmi) {
        setTanlanganId(saqlangan);
      } else if (data.dokonlar && data.dokonlar.length > 0) {
        setTanlanganId(data.dokonlar[0].id);
      }
    } finally {
      setYuklanmoqda(false);
    }
  }, []);

  useEffect(() => {
    yuklash();
  }, [yuklash]);

  const dokonTanlash = useCallback((id: string) => {
    setTanlanganId(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const tanlanganDokon = dokonlar.find((d) => d.id === tanlanganId) || null;

  return (
    <StoreContext.Provider
      value={{
        foydalanuvchi,
        dokonlar,
        tanlanganDokon,
        dokonTanlash,
        yuklanmoqda,
        qayta_yuklash: yuklash,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore StoreProvider ichida ishlatilishi kerak.");
  return ctx;
}
