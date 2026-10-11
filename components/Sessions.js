"use client";

/**
 * Сессии: список активных (refresh_tokens), отзыв отдельных сессий.
 */
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Sessions({ onNotify }) {
  const [sessions, setSessions] = useState(null);
  const [busy, setBusy] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/auth/sessions");
      if (!r.ok) throw new Error("Не удалось загрузить сессии");
      const d = await r.json();
      setSessions(d.sessions || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoke = async (id) => {
    setBusy(id);
    setError(null);
    try {
      const r = await apiFetch(`/auth/sessions/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.detail || "Не удалось завершить сессию");
      }
      setSessions((s) => s.filter((x) => x.id !== id));
      onNotify && onNotify("Сессия завершена");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
      setConfirmId(null);
    }
  };

  if (sessions === null && !error) {
    return <p className="text-gray-500 text-sm">Загрузка сессий...</p>;
  }
  if (error && sessions === null) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  return (
    <div className="space-y-3">
      {sessions && sessions.length === 0 && (
        <p className="text-gray-500 text-sm">Активных сессий нет.</p>
      )}
      {(sessions || []).map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-3 bg-black/20 border border-white/[0.06] rounded-xl px-4 py-3 min-w-0"
        >
          <div className="min-w-0">
            <div className="text-gray-200 text-sm font-medium flex items-center gap-2">
              {s.device}
              {s.current && (
                <span className="text-[10px] uppercase tracking-wider text-[#00FF00] border border-[#00FF00]/30 rounded px-1.5 py-0.5">
                  текущая
                </span>
              )}
            </div>
            <div className="text-gray-500 text-xs mt-0.5">
              IP {s.ip_address} · вход {fmtDate(s.created_at)}
            </div>
          </div>
          {!s.current && (
            <button
              onClick={() => setConfirmId(s.id)}
              className="shrink-0 text-xs text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              Завершить
            </button>
          )}
        </div>
      ))}

      {confirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="bg-[#0d1117] border border-white/15 rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-white font-bold mb-2">Завершить сессию?</h4>
            <p className="text-gray-400 text-sm mb-5">
              Это устройство выйдет из аккаунта при следующем действии.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white text-sm border border-white/10 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => revoke(confirmId)}
                disabled={busy === confirmId}
                className="px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-40"
              >
                {busy === confirmId ? "..." : "Завершить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
