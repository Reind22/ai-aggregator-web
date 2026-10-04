"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Callback для Telegram Login Widget
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

  // Регистрируем глобальный колбэк для Telegram widget
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
    <div className="min-h-screen bg-[#08080c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg">⚡</div>
          <span className="font-semibold text-lg">AI Combiner</span>
        </a>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-1">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
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
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600">или email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
            />
            <input
              type="password"
              placeholder="Пароль (мин. 8 символов, буквы и цифры)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
            />
            {mode === "register" && (
              <input
                type="text"
                placeholder="Реферальный код (необязательно)"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
              />
            )}

            {error && <div className="text-red-400 text-xs">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 font-medium text-sm transition-colors"
            >
              {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm">
            {mode === "login" ? (
              <button
                onClick={() => { setMode("register"); setError(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Нет аккаунта? <span className="text-blue-400">Регистрация</span>
              </button>
            ) : (
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Уже есть аккаунт? <span className="text-blue-400">Войти</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Продолжая, ты соглашаешься с условиями использования
        </p>
      </div>
    </div>
  );
}
