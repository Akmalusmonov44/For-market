"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

interface Product {
  id: string;
  nomi: string;
  shtrixKod: string | null;
  sotuvNarxi: string;
  xaridNarxi: string;
  miqdori: number;
  category: { id: string; nomi: string } | null;
}

interface SavatItem {
  product: Product;
  miqdori: number;
}

function pul(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
}

export default function KassaPage() {
  const { tanlanganDokon } = useStore();
  const { ko_rsat } = useToast();
  const [mahsulotlar, setMahsulotlar] = useState<Product[]>([]);
  const [qidiruv, setQidiruv] = useState("");
  const [savat, setSavat] = useState<SavatItem[]>([]);
  const [tolovTuri, setTolovTuri] = useState<"NAQD" | "KARTA" | "BOSHQA">("NAQD");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [yakunlanmoqda, setYakunlanmoqda] = useState(false);

  useEffect(() => {
    if (!tanlanganDokon) return;
    let bekor = false;
    async function yuklash() {
      if (!tanlanganDokon) return;
      setYuklanmoqda(true);
      const data = await apiFetch<{ mahsulotlar: Product[] }>(`/api/stores/${tanlanganDokon.id}/products`);
      if (!bekor) setMahsulotlar(data.mahsulotlar);
      setYuklanmoqda(false);
    }
    yuklash();
    return () => {
      bekor = true;
    };
  }, [tanlanganDokon]);

  const filtrlangan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    if (!q) return mahsulotlar;
    return mahsulotlar.filter(
      (p) => p.nomi.toLowerCase().includes(q) || (p.shtrixKod && p.shtrixKod.includes(q)),
    );
  }, [mahsulotlar, qidiruv]);

  function savatgaQoshish(product: Product) {
    if (product.miqdori <= 0) {
      ko_rsat("Bu mahsulot omborda qolmagan.", "error");
      return;
    }
    setSavat((s) => {
      const mavjud = s.find((i) => i.product.id === product.id);
      if (mavjud) {
        if (mavjud.miqdori + 1 > product.miqdori) {
          ko_rsat("Omborda yetarli mahsulot yo'q.", "error");
          return s;
        }
        return s.map((i) => (i.product.id === product.id ? { ...i, miqdori: i.miqdori + 1 } : i));
      }
      return [...s, { product, miqdori: 1 }];
    });
  }

  function miqdorniOzgartirish(productId: string, yangiMiqdor: number) {
    setSavat((s) =>
      s
        .map((i) => (i.product.id === productId ? { ...i, miqdori: yangiMiqdor } : i))
        .filter((i) => i.miqdori > 0),
    );
  }

  function olibTashlash(productId: string) {
    setSavat((s) => s.filter((i) => i.product.id !== productId));
  }

  const jamiSumma = savat.reduce((sum, i) => sum + Number(i.product.sotuvNarxi) * i.miqdori, 0);

  async function sotuvniYakunlash() {
    if (!tanlanganDokon || savat.length === 0) return;
    setYakunlanmoqda(true);
    try {
      await apiFetch(`/api/stores/${tanlanganDokon.id}/sales`, {
        method: "POST",
        body: JSON.stringify({
          items: savat.map((i) => ({ productId: i.product.id, miqdori: i.miqdori })),
          paymentType: tolovTuri,
        }),
      });
      ko_rsat("Sotuv muvaffaqiyatli yakunlandi!", "success");
      setSavat([]);
      const data = await apiFetch<{ mahsulotlar: Product[] }>(`/api/stores/${tanlanganDokon.id}/products`);
      setMahsulotlar(data.mahsulotlar);
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setYakunlanmoqda(false);
    }
  }

  if (!tanlanganDokon) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4">
          <input
            className="input"
            placeholder="Mahsulot nomi yoki shtrix-kod bo'yicha qidirish..."
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            autoFocus
          />
        </div>
        {yuklanmoqda ? (
          <div className="text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtrlangan.map((p) => (
              <button
                key={p.id}
                onClick={() => savatgaQoshish(p)}
                disabled={p.miqdori <= 0}
                className="card flex flex-col items-start gap-1 p-4 text-left transition hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="line-clamp-2 text-sm font-medium">{p.nomi}</div>
                <div className="text-xs text-slate-400">{p.category?.nomi || "Kategoriyasiz"}</div>
                <div className="mt-1 font-semibold text-brand-700">{pul(Number(p.sotuvNarxi))}</div>
                <div className="text-xs text-slate-400">Qoldiq: {p.miqdori} ta</div>
              </button>
            ))}
            {filtrlangan.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-400">Mahsulot topilmadi.</div>
            )}
          </div>
        )}
      </div>

      <div className="card flex h-fit flex-col p-5">
        <h2 className="mb-4 font-semibold">Savat</h2>
        {savat.length === 0 ? (
          <p className="text-sm text-slate-400">Savat bo'sh. Mahsulot tanlang.</p>
        ) : (
          <div className="space-y-3">
            {savat.map((i) => (
              <div key={i.product.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{i.product.nomi}</div>
                  <div className="text-xs text-slate-400">{pul(Number(i.product.sotuvNarxi))}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="btn-ghost !p-1.5 !text-xs"
                    onClick={() => miqdorniOzgartirish(i.product.id, i.miqdori - 1)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{i.miqdori}</span>
                  <button
                    className="btn-ghost !p-1.5 !text-xs"
                    onClick={() => miqdorniOzgartirish(i.product.id, i.miqdori + 1)}
                  >
                    +
                  </button>
                </div>
                <button className="text-red-500" onClick={() => olibTashlash(i.product.id)} aria-label="O'chirish">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="my-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <label className="label">To'lov turi</label>
          <div className="grid grid-cols-3 gap-2">
            {(["NAQD", "KARTA", "BOSHQA"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTolovTuri(t)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  tolovTuri === t
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 dark:border-slate-700"
                }`}
              >
                {t === "NAQD" ? "Naqd pul" : t === "KARTA" ? "Bank karta" : "Boshqa"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-lg font-bold">
          <span>Jami:</span>
          <span className="text-brand-700">{pul(jamiSumma)}</span>
        </div>

        <button
          className="btn-primary w-full !py-3 text-base"
          disabled={savat.length === 0 || yakunlanmoqda}
          onClick={sotuvniYakunlash}
        >
          {yakunlanmoqda ? "Yakunlanmoqda..." : "Sotuvni yakunlash"}
        </button>
      </div>
    </div>
  );
}
