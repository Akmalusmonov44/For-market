"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StoreProvider, useStore } from "@/components/dashboard/StoreContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { foydalanuvchi, dokonlar, yuklanmoqda } = useStore();
  const [menyuOchiq, setMenyuOchiq] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (yuklanmoqda) return;
    if (!foydalanuvchi) {
      router.replace("/kirish");
      return;
    }
    if (dokonlar.length === 0) {
      // Super-admin hisobi hech qanday do'konga a'zo bo'lmasligi mumkin —
      // bunday holda uni "do'kon yaratish" sahifasiga emas, to'g'ridan-to'g'ri
      // platforma admin paneliga yo'naltiramiz.
      if (foydalanuvchi.isSuperAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/dokon-yaratish");
      }
    }
  }, [yuklanmoqda, foydalanuvchi, dokonlar, router]);

  if (yuklanmoqda) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Yuklanmoqda...
      </div>
    );
  }

  if (!foydalanuvchi || dokonlar.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Yo'naltirilmoqda...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar ochiq={menyuOchiq} onYopish={() => setMenyuOchiq(false)} />
      <div className="flex min-h-screen flex-1 flex-col md:pl-0">
        <Topbar onMenyu={() => setMenyuOchiq(true)} />
        <main className="flex-1 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <DashboardInner>{children}</DashboardInner>
    </StoreProvider>
  );
}
