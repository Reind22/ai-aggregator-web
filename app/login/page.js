"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: user.auth_date,
          hash: user.hash,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("ai_token", data.access_token);
        router.push("/chat");
      } else {
        setError(data.detail || "Ошибка авторизации через Telegram");
      }
    } catch (e) {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  if (typeof window !== "undefined") {
    window.onTelegramAuth = handleTelegramAuth;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, referral_code: referral || null };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("ai_token", data.access_token);
        localStorage.setItem("ai_refresh_token", data.refresh_token);
        router.push("/chat");
      } else {
        setError(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
      }
    } catch (e) {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-[#00FF00] to-[#00CC00] rounded-xl flex items-center justify-center text-lg">⚡</div>
          <span className="font-semibold text-lg text-ink">AI Combiner</span>
        </a>

        <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-xl font-semibold mb-1 text-ink">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>
          <p className="text-ink-soft text-sm mb-6">
            {mode === "login"
              ? "С возвращением"
              : "Бесплатно, $0.50 на запросы каждый день"}
          </p>

          {/* Telegram Login Widget */}
          <div className="flex justify-center mb-6">
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login="aicombinernet_bot"
              data-size="large"
              data-radius="10"
              data-onauth="onTelegramAuth(user)"
              data-request-access="write"
            ></script>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-ink-mute">или email</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-dark border border-surface-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-[#00CC00] transition-colors placeholder:text-ink-mute"
            />
            <input
              type="password"
              placeholder="Пароль (мин. 8 символов, буквы и цифры)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-surface-dark border border-surface-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-[#00CC00] transition-colors placeholder:text-ink-mute"
            />
            {mode === "register" && (
              <input
                type="text"
                placeholder="Реферальный код (необязательно)"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-[#00CC00] transition-colors placeholder:text-ink-mute"
              />
            )}

            {error && <div className="text-[#FF4444] text-xs">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-50 text-[#0A2A0A] rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm">
            {mode === "login" ? (
              <button
                onClick={() => { setMode("register"); setError(null); }}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Нет аккаунта? <span className="text-[#00A000] font-medium">Регистрация</span>
              </button>
            ) : (
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Уже есть аккаунт? <span className="text-[#00A000] font-medium">Войти</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-ink-mute text-xs mt-6">
          Продолжая, ты соглашаешься с условиями использования
        </p>
      </div>
    </div>
  );
}
