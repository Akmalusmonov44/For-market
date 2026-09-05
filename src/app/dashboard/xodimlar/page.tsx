"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/dashboard/StoreContext";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Role = "EGASI" | "MENEJER" | "SOTUVCHI";

interface Member {
  id: string;
  role: Role;
  user: { id: string; ism: string; familiya: string; email: string | null; telefon: string | null };
}

const ROL_NOMI: Record<Role, string> = {
  EGASI: "Egasi / Administrator",
  MENEJER: "Menejer",
  SOTUVCHI: "Sotuvchi",
};

export default function XodimlarPage() {
  const { tanlanganDokon } = useStore();
  const { ko_rsat } = useToast();
  const [xodimlar, setXodimlar] = useState<Member[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [modalOchiq, setModalOchiq] = useState(false);
  const [identifikator, setIdentifikator] = useState("");
  const [role, setRole] = useState<Role>("SOTUVCHI");
  const [qoshilmoqda, setQoshilmoqda] = useState(false);
  const [ochirishId, setOchirishId] = useState<string | null>(null);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);

  const huquqYo_q = tanlanganDokon && tanlanganDokon.role === "SOTUVCHI";

  async function yuklash() {
    if (!tanlanganDokon) return;
    setYuklanmoqda(true);
    try {
      const d = await apiFetch<{ xodimlar: Member[] }>(`/api/stores/${tanlanganDokon.id}/employees`);
      setXodimlar(d.xodimlar);
    } catch {
      setXodimlar([]);
    } finally {
      setYuklanmoqda(false);
    }
  }

  useEffect(() => {
    yuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanlanganDokon]);

  async function xodimQoshish(e: React.FormEvent) {
    e.preventDefault();
    if (!tanlanganDokon) return;
    setQoshilmoqda(true);
    try {
      await apiFetch(`/api/stores/${tanlanganDokon.id}/employees`, {
        method: "POST",
        body: JSON.stringify({ identifikator, role }),
      });
      ko_rsat("Xodim qo'shildi.", "success");
      setModalOchiq(false);
      setIdentifikator("");
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setQoshilmoqda(false);
    }
  }

  async function rolniOzgartirish(memberId: string, yangiRole: Role) {
    try {
      await apiFetch(`/api/employees/${memberId}`, { method: "PUT", body: JSON.stringify({ role: yangiRole }) });
      ko_rsat("Rol yangilandi.", "success");
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    }
  }

  async function ochirish() {
    if (!ochirishId) return;
    setOchirilmoqda(true);
    try {
      await apiFetch(`/api/employees/${ochirishId}`, { method: "DELETE" });
      ko_rsat("Xodim o'chirildi.", "success");
      setOchirishId(null);
      yuklash();
    } catch (err) {
      ko_rsat(err instanceof ApiError ? err.message : "Xatolik yuz berdi.", "error");
    } finally {
      setOchirilmoqda(false);
    }
  }

  if (!tanlanganDokon) return null;

  if (huquqYo_q) {
    return (
      <div className="card p-8 text-center text-slate-400">
        Bu bo'limni ko'rish uchun sizda yetarli huquq yo'q.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Xodimlar</h1>
        {tanlanganDokon.role === "EGASI" && (
          <button className="btn-primary" onClick={() => setModalOchiq(true)}>
            + Xodim qo'shish
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        {yuklanmoqda ? (
          <div className="p-6 text-slate-400">Yuklanmoqda...</div>
        ) : xodimlar.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Xodimlar yo'q.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Ism familiya</th>
                <th className="px-4 py-3">Aloqa</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {xodimlar.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-medium">
                    {m.user.ism} {m.user.familiya}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{m.user.email || m.user.telefon}</td>
                  <td className="px-4 py-3">
                    {tanlanganDokon.role === "EGASI" ? (
                      <select
                        className="input !py-1.5 !text-xs"
                        value={m.role}
                        onChange={(e) => rolniOzgartirish(m.id, e.target.value as Role)}
                      >
                        {Object.entries(ROL_NOMI).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    ) : (
                      ROL_NOMI[m.role]
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tanlanganDokon.role === "EGASI" && (
                      <button
                        className="btn-ghost !px-2 !py-1 text-xs text-red-600"
                        onClick={() => setOchirishId(m.id)}
                      >
                        O'chirish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal ochiq={modalOchiq} onYopish={() => setModalOchiq(false)} sarlavha="Xodim qo'shish">
        <form onSubmit={xodimQoshish} className="space-y-4">
          <div>
            <label className="label">Xodimning email yoki telefon raqami</label>
            <input
              className="input"
              value={identifikator}
              onChange={(e) => setIdentifikator(e.target.value)}
              placeholder="Xodim avval tizimda ro'yxatdan o'tgan bo'lishi kerak"
              required
            />
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {Object.entries(ROL_NOMI).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={qoshilmoqda}>
            {qoshilmoqda ? "Qo'shilmoqda..." : "Qo'shish"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        ochiq={!!ochirishId}
        onYopish={() => setOchirishId(null)}
        onTasdiqlash={ochirish}
        matn="Ushbu xodimni do'kondan o'chirishni tasdiqlaysizmi?"
        yuklanmoqda={ochirilmoqda}
      />
    </div>
  );
}
