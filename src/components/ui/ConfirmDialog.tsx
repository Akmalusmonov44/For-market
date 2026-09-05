"use client";

import Modal from "./Modal";

export default function ConfirmDialog({
  ochiq,
  onYopish,
  onTasdiqlash,
  sarlavha = "Tasdiqlash",
  matn,
  yuklanmoqda = false,
}: {
  ochiq: boolean;
  onYopish: () => void;
  onTasdiqlash: () => void;
  sarlavha?: string;
  matn: string;
  yuklanmoqda?: boolean;
}) {
  return (
    <Modal ochiq={ochiq} onYopish={onYopish} sarlavha={sarlavha}>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">{matn}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onYopish} disabled={yuklanmoqda}>
          Bekor qilish
        </button>
        <button className="btn-danger" onClick={onTasdiqlash} disabled={yuklanmoqda}>
          {yuklanmoqda ? "Bajarilmoqda..." : "Ha, tasdiqlayman"}
        </button>
      </div>
    </Modal>
  );
}
