"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface FoydalanuvchiRow {
  id: string;
  ism: string;
  familiya: string;
  email: string | null;
  telefon: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
  egaligidagiDokonlarSoni: number;
  memberships: { role: string; store: { id: string; nomi: string } }[];
}

const BO_SH_FORM = { ism: "", familiya: "", email: "", telefon: "", yangiParol: "" };

export default function AdminFoydalanuvchilarPage() {
  const { ko_rsat } = useToast();
  const [foydalanuvchilar, setFoydalanuvchilar] = useState<FoydalanuvchiRow[]>([]);
  const [qidiruv, setQidiruv] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  const [modalOchiq, setModalOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<FoydalanuvchiRow | null>(null);
  const [form, setForm] = useState(BO_SH_FORM);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  async function yuklash() {
    setYuklanmoqda(true);
    const d = await apiFetch<{ foydalanuvchilar: FoydalanuvchiRow[] }>("/api/admin/users");
    setFoydalanuvchilar(d.foydalanuvchilar);
    setYuklanmoqda(false);
  }

  useEffect(() => {
    yuklash();
  }, []);

  function tahrirlashniOchish(u: FoydalanuvchiRow) {
    setTahrirlanayotgan(u);
    setForm({ ism: u.ism, familiya: u.familiya, email: u.email || "", telefon: u.telefon || "", yangiParol: "" });
    setModalOchiq(true);
  }

  async function saqlash(e: React.FormEvent) {
    e.preventDefault();
    if (!tahrirlanayotgan) return;
    setSaqlanmoqda(true);
    try {
      const body: Record<string, string> = {
        ism: form.ism,
        familiya: form.familiya,
        email: form.email,
        telefon: form.telefon,
      };
      if (form.yangiParol) body.yangiParol = form.yangiParol;

      await apiFetch(`/api/admin/users/${tahrirlanayotgan.id}`, { method: "PUT", body: JSON.stringify(body) });
      ko_rsat("Foydalanuvchi ma'lumotlari yangilandi.", "success");
      setModalOchiq(false);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setSaqlanmoqda(false);
    }
  }

  async function ochirish() {
    if (!ochirishId) return;
    setOchirilmoqda(true);
    try {
      await apiFetch(`/api/admin/users/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Foydalanuvchi o'chirildi.", "success");
      setOchirishId(null);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  const filtrlangan = foydalanuvchilar.filter((u) => {
    const q = qidiruv.trim().toLowerCase();
    if (!q) return true;
    return (
      u.ism.toLowerCase().includes(q) ||
      u.familiya.toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.telefon || "").includes(q)
    );
  });

  const ochirilayotganFoydalanuvchi = foydalanuvchilar.find((u) => u.id === ochirishId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <p className="text-sm text-slate-500">Platformadagi barcha do'kon egalari va xodimlar.</p>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Ism, familiya, email yoki telefon bo'yicha qidirish..."
        value={qidiruv}
        onChange={(e) => setQidiruv(e.target.value)}
      />

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : filtrlangan.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Foydalanuvchi topilmadi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Ism familiya</th>
                <th className="px-4 py-3">Aloqa</th>
                <th className="px-4 py-3">Do'konlar</th>
                <th className="px-4 py-3">Ro'yxatdan o'tgan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtrlangan.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-medium">
                    {u.ism} {u.familiya}
                    {u.isSuperAdmin && (
                      <span className="badge ml-2 bg-brand-100 text-brand-700">Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email || u.telefon || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {u.egaligidagiDokonlarSoni} ta egasi · {u.memberships.length} ta a'zo
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => tahrirlashniOchish(u)}>
                      Tahrirlash
                    </button>
                    <button
                      className="btn-ghost !px-2 !py-1 text-xs text-red-600"
                      onClick={() => setOchirishId(u.id)}
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal ochiq={modalOchiq} onYopish={() => setModalOchiq(false)} sarlavha="Foydalanuvchini tahrirlash">
        <form onSubmit={saqlash} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Ism</label>
              <input className="input" value={form.ism} onChange={(e) => setForm((f) => ({ ...f, ism: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Familiya</label>
              <input className="input" value={form.familiya} onChange={(e) => setForm((f) => ({ ...f, familiya: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input className="input" value={form.telefon} onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))} />
          </div>
          <div>
            <label className="label">Yangi parol (ixtiyoriy)</label>
            <input
              type="password"
              className="input"
              value={form.yangiParol}
              onChange={(e) => setForm((f) => ({ ...f, yangiParol: e.target.value }))}
              placeholder="O'zgartirish uchun kiriting, aks holda bo'sh qoldiring"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saqlanmoqda}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        ochiq={!!ochirishId}
        onYopish={() => setOchirishId(null)}
        onTasdiqlash={ochirish}
        sarlavha="Foydalanuvchini o'chirish"
        matn={`"${ochirilayotganFoydalanuvchi?.ism} ${ochirilayotganFoydalanuvchi?.familiya}" o'chirilsa, ularga tegishli barcha do'konlar, mahsulotlar, sotuvlar va boshqa ma'lumotlar HAM butunlay o'chib ketadi. Bu amalni qaytarib bo'lmaydi. Davom etasizmi?`}
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
