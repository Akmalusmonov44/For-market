"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

function hisoblash(a: number, b: number, amal: string): number {
  switch (amal) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? 0 : a / b;
    default:
      return b;
  }
}

export default function Calculator({ ochiq, onYopish }: { ochiq: boolean; onYopish: () => void }) {
  const [ekran, setEkran] = useState("0");
  const [saqlangan, setSaqlangan] = useState<number | null>(null);
  const [amal, setAmal] = useState<string | null>(null);
  const [yangiSon, setYangiSon] = useState(true);

  function raqamBosildi(raqam: string) {
    if (yangiSon) {
      setEkran(raqam === "." ? "0." : raqam);
      setYangiSon(false);
    } else {
      if (raqam === "." && ekran.includes(".")) return;
      if (ekran.length >= 12) return;
      setEkran(ekran === "0" && raqam !== "." ? raqam : ekran + raqam);
    }
  }

  function amalBosildi(yangiAmal: string) {
    const joriy = parseFloat(ekran);
    if (saqlangan !== null && amal && !yangiSon) {
      const natija = hisoblash(saqlangan, joriy, amal);
      setSaqlangan(natija);
      setEkran(formatla(natija));
    } else {
      setSaqlangan(joriy);
    }
    setAmal(yangiAmal);
    setYangiSon(true);
  }

  function tengBosildi() {
    if (saqlangan === null || amal === null) return;
    const joriy = parseFloat(ekran);
    const natija = hisoblash(saqlangan, joriy, amal);
    setEkran(formatla(natija));
    setSaqlangan(null);
    setAmal(null);
    setYangiSon(true);
  }

  function tozalash() {
    setEkran("0");
    setSaqlangan(null);
    setAmal(null);
    setYangiSon(true);
  }

  function foizBosildi() {
    const joriy = parseFloat(ekran);
    setEkran(formatla(joriy / 100));
    setYangiSon(true);
  }

  function ishoraOzgartirish() {
    const joriy = parseFloat(ekran);
    setEkran(formatla(joriy * -1));
  }

  function formatla(n: number): string {
    if (!isFinite(n)) return "0";
    return String(Math.round(n * 1000000) / 1000000);
  }

  const TUGMALAR: { label: string; turi: "raqam" | "amal" | "boshqa" | "teng"; onBosish: () => void }[] = [
    { label: "C", turi: "boshqa", onBosish: tozalash },
    { label: "±", turi: "boshqa", onBosish: ishoraOzgartirish },
    { label: "%", turi: "boshqa", onBosish: foizBosildi },
    { label: "÷", turi: "amal", onBosish: () => amalBosildi("÷") },
    { label: "7", turi: "raqam", onBosish: () => raqamBosildi("7") },
    { label: "8", turi: "raqam", onBosish: () => raqamBosildi("8") },
    { label: "9", turi: "raqam", onBosish: () => raqamBosildi("9") },
    { label: "×", turi: "amal", onBosish: () => amalBosildi("×") },
    { label: "4", turi: "raqam", onBosish: () => raqamBosildi("4") },
    { label: "5", turi: "raqam", onBosish: () => raqamBosildi("5") },
    { label: "6", turi: "raqam", onBosish: () => raqamBosildi("6") },
    { label: "-", turi: "amal", onBosish: () => amalBosildi("-") },
    { label: "1", turi: "raqam", onBosish: () => raqamBosildi("1") },
    { label: "2", turi: "raqam", onBosish: () => raqamBosildi("2") },
    { label: "3", turi: "raqam", onBosish: () => raqamBosildi("3") },
    { label: "+", turi: "amal", onBosish: () => amalBosildi("+") },
    { label: "0", turi: "raqam", onBosish: () => raqamBosildi("0") },
    { label: ".", turi: "raqam", onBosish: () => raqamBosildi(".") },
    { label: "=", turi: "teng", onBosish: tengBosildi },
  ];

  return (
    <Modal ochiq={ochiq} onYopish={onYopish} sarlavha="Kalkulyator" kenglik="max-w-xs">
      <div className="rounded-2xl bg-slate-900 p-4 text-right dark:bg-black">
        {amal && (
          <div className="mb-1 text-xs text-slate-400">
            {formatla(saqlangan ?? 0)} {amal}
          </div>
        )}
        <div className="truncate text-4xl font-semibold text-white">{ekran}</div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {TUGMALAR.map((t) => {
          const zeroKeng = t.label === "0";
          return (
            <button
              key={t.label}
              onClick={t.onBosish}
              className={`
                ${zeroKeng ? "col-span-2" : ""}
                flex h-12 items-center justify-center rounded-xl text-lg font-medium transition active:scale-95
                ${
                  t.turi === "amal"
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : t.turi === "teng"
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : t.turi === "boshqa"
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                }
              `}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
