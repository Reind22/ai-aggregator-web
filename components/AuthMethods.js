"use client";

/**
 * Блок «Способы входа» для /profile.
 * Показывает все методы столбиком (Telegram / Email / Discord) со статусом
 * и кнопкой «Привязать» или «Привязано». Отвязка — если метод не последний.
 */
import { useState, useEffect } from "react";
import EmailCodeFlow from "./EmailCodeFlow";

const API_BASE = "/api";

const METHOD_META = {
  telegram: { label: "Telegram", hint: "Вход через Telegram-аккаунт" },
  email: { label: "Email", hint: "Код на почту при входе" },
  discord: { label: "Discord", hint: "Вход через Discord-аккаунт" },
};

const maskEmail = (id) => {
  if (!id || !id.includes("@")) return id;
  const [u, d] = id.split("@");
  const head = u.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, u.length - 2))}@${d}`;
};

export default function AuthMethods({ onNotify }) {
  const [methods, setMethods] = useState(null);
  const [linking, setLinking] = useState(null); // 'email' | 'discord' | null
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const r = await apiFetch(`${API_BASE}/auth/methods`);
      if (!r.ok) throw new Error("Не удалось загрузить способы входа");
      const d = await r.json();
      setMethods(d.methods || []);
    } catch (e) {
      setError(e.message);
      setMethods([]);
    }
  };

  useEffect(() => { load(); }, []);

  const has = (m) => (methods || []).some((x) => x.method === m);

  const linkDiscord = async () => {
    setBusy("discord");
    setError(null);
    try {
      const r = await apiFetch(`${API_BASE}/auth/discord/start?link=1`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Не удалось начать привязку");
      window.location.href = d.url;
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  };

  const unlink = async (method) => {
    setBusy(method);
    setError(null);
    try {
      const r = await apiFetch(`${API_BASE}/auth/methods/${method}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Не удалось отвязать");
      await load();
      onNotify && onNotify(`${METHOD_META[method]?.label || method}: отвязано`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const onLinkedEmail = async (email) => {
    setLinking(null);
    await load();
    onNotify && onNotify(`Email ${maskEmail(email)} привязан`);
  };

  const rows = ["telegram", "email", "discord"];

  return (
    <div className="bg-white/[0.03] border border-[#00CC00]/25 rounded-2xl p-6 min-w-0">
      <h3 className="text-lg font-bold text-white mb-1">Способы входа</h3>
      <p className="text-gray-500 text-sm mb-4">
        Привяжи несколько — входи любым удобным. Отвязать можно любой, кроме последнего.
      </p>

      <div className="space-y-3">
        {rows.map((m) => {
          const linked = has(m);
          const meta = METHOD_META[m];
          const id = (methods || []).find((x) => x.method === m)?.identifier;
          const canUnlink = linked && (methods || []).length > 1;
          return (
            <div
              key={m}
              className="flex items-center justify-between gap-3 bg-black/20 border border-white/[0.06] rounded-xl px-4 py-3 min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MethodIcon method={m} />
                <div className="min-w-0">
                  <div className="text-gray-200 text-sm font-medium">{meta.label}</div>
                  <div className="text-gray-500 text-xs truncate">
                    {linked
                      ? m === "email"
                        ? maskEmail(id || "")
                        : `привязан${id ? ` · ${id}` : ""}`
                      : meta.hint}
                  </div>
                </div>
              </div>
              {linked ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#00FF00] text-sm">✓ привязано</span>
                  {canUnlink && (
                    <button
                      onClick={() => unlink(m)}
                      disabled={busy === m}
                      className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 transition-colors disabled:opacity-40"
                      title="Отвязать"
                    >
                      {busy === m ? "..." : "✕"}
                    </button>
                  )}
                </div>
              ) : linking === m ? null : (
                <button
                  onClick={() => (m === "email" ? setLinking("email") : linkDiscord())}
                  disabled={busy === m}
                  className="shrink-0 border border-[#00FF00]/40 hover:bg-[#00FF00]/10 text-[#00FF00] rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  {busy === m ? "..." : "Привязать"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Флоу привязки email */}
      {linking === "email" && (
        <div className="mt-4 bg-black/30 border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-200">Привязка Email</span>
            <button
              onClick={() => setLinking(null)}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Отмена
            </button>
          </div>
          <EmailCodeFlow mode="link" onLinked={onLinkedEmail} />
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs leading-relaxed">
          {error}
        </div>
      )}
    </div>
  );
}

function MethodIcon({ method }) {
  if (method === "telegram")
    return (
      <svg className="w-5 h-5 text-[#229ED9] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.04 15.51l-.38 5.32c.54 0 .78-.23 1.06-.5l2.55-2.44 5.28 3.87c.97.53 1.65.25 1.91-.9L23.9 3.8c.31-1.42-.51-1.98-1.45-1.63L1.7 10.9c-1.39.54-1.37 1.32-.24 1.67l4.68 1.46L18.34 6.2c.51-.34.98-.15.6.19L9.04 15.51z"/>
      </svg>
    );
  if (method === "discord")
    return (
      <svg className="w-5 h-5 text-[#5865F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.32 4.37a19.8 19.8 0 00-4.93-1.51 13.8 13.8 0 00-.64 1.28 18.3 18.3 0 00-5.5 0 12.6 12.6 0 00-.64-1.28c-1.71.29-3.37.8-4.93 1.51A20.3 20.3 0 00.1 18.06a19.9 19.9 0 006.07 3.03c.49-.66.93-1.37 1.3-2.1a12.9 12.9 0 01-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0012.16 0c.16.13.33.26.5.38-.65.38-1.34.71-2.05.98.37.73.8 1.44 1.3 2.1a19.8 19.8 0 006.07-3.03 20.2 20.2 0 00-3.58-13.69zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42z"/>
      </svg>
    );
  return (
    <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 6l-10 7L2 6"/>
    </svg>
  );
}
