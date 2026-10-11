"use client";

/**
 * Email-код: вход/регистрация и привязка.
 * Компонент двухрежимный:
 *   mode="login" — ввод почты → код → JWT (использует onAuthed)
 *   mode="link"  — ввод почты → код → привязка к текущему аккаунту (onLinked)
 */
import { useState } from "react";
import { apiFetch } from "../lib/api";

const API_BASE = "/api";

export default function EmailCodeFlow({ mode = "login", onAuthed, onLinked, onNotify }) {
  const [stage, setStage] = useState("email"); // email → code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendIn, setResendIn] = useState(0);

  const startResendTimer = () => {
    setResendIn(30);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Проверь формат почты: name@example.com");
      return;
    }
    setLoading(true);
    try {
      const req = mode === "link"
        ? apiFetch(`/auth/email/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, purpose: mode }),
          })
        : fetch(`${API_BASE}/auth/email/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, purpose: mode }),
          });
      const r = await req;
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Не удалось отправить код");
      setStage("code");
      startResendTimer();
      onNotify && onNotify("Код отправлен на почту");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setLoading(true);
    try {
      let d;
      if (mode === "link") {
        const r = await apiFetch(`/auth/email/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, purpose: mode }),
        });
        d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Неверный код");
      } else {
        const r = await fetch(`${API_BASE}/auth/email/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, purpose: mode }),
        });
        d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Неверный код");
      }
      if (mode === "login") {
        localStorage.setItem("ai_token", d.access_token);
        localStorage.setItem("ai_refresh_token", d.refresh_token);
        if (window.umami) {
          window.umami.track("login-success", { method: "email" });
          if (d.user?.id) window.umami.identify(`user_${d.user.id}`);
        }
        onAuthed && onAuthed(d);
      } else {
        onLinked && onLinked(email);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {stage === "email" ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendCode()}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-black/40 border border-white/15 focus:border-[#00FF00]/60 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none transition-colors"
          />
          <button
            onClick={sendCode}
            disabled={loading}
            className="w-full bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-50 text-black rounded-xl py-3 font-bold transition-colors"
          >
            {loading ? "Отправляю..." : "Получить код"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            Код отправлен на <span className="text-gray-200">{email}</span>. Проверь папку «Спам»,
            если не видишь письмо.
          </p>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && !loading && code.length === 6 && verifyCode()}
            placeholder="000000"
            autoFocus
            className="w-full bg-black/40 border border-white/15 focus:border-[#00FF00]/60 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder:text-gray-700 outline-none transition-colors"
          />
          <button
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className="w-full bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-50 text-black rounded-xl py-3 font-bold transition-colors"
          >
            {loading ? "Проверяю..." : mode === "login" ? "Войти" : "Привязать"}
          </button>
          <div className="flex justify-between text-sm">
            <button onClick={() => { setStage("email"); setCode(""); }} className="text-gray-400 hover:text-gray-200 transition-colors">
              ← Другая почта
            </button>
            <button
              onClick={sendCode}
              disabled={resendIn > 0 || loading}
              className="text-gray-400 hover:text-gray-200 disabled:opacity-40 transition-colors"
            >
              {resendIn > 0 ? `Повторно через ${resendIn}с` : "Отправить код снова"}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
