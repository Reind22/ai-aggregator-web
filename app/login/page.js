"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import TelegramLogin from "../../components/TelegramLogin";

const API_BASE = "/api";

// Человеческие тексты ошибок вместо сырых сообщений валидации
function humanizeError(detail) {
  if (!detail) return "Что-то пошло не так. Попробуй ещё раз.";
  const d = String(detail).toLowerCase();
  if (d.includes("уже зарегистрирован") || d.includes("already registered"))
    return "Этот email уже занят. Попробуй войти или используй другой.";
  if (d.includes("неверный") || d.includes("invalid") || d.includes("401") || d.includes("wrong"))
    return "Неверный email или пароль. Проверь раскладку и попробуй снова.";
  if (d.includes("заблокирован") || d.includes("blocked"))
    return "Аккаунт заблокирован. Напиши в поддержку в Telegram.";
  if (d.includes("пароль должен") || d.includes("password"))
    return "Пароль не подходит: нужно минимум 8 символов, хотя бы одна буква и одна цифра.";
  if (d.includes("email") && (d.includes("value is not") || d.includes("valid")))
    return "Похоже, в адресе почты опечатка. Проверь формат: name@example.com";
  if (d.includes("недоступен") || d.includes("unavailable"))
    return "Сервер временно недоступен. Подожди минуту и попробуй снова.";
  return String(detail);
}

// Кнопки соцсетей
const OAuthButtons = ({ onNotify }) => {
  const handlers = {
    telegram: () => onNotify("Telegram: нажми кнопку «Log in with Telegram» выше"),
    discord: () => {
      if (window.umami) window.umami.track("oauth-click", { provider: "discord" });
      onNotify("Вход через Discord скоро заработает — ключи подключаются");
    },
    google: () => {
      if (window.umami) window.umami.track("oauth-click", { provider: "google" });
      onNotify("Вход через Google скоро заработает — ключи подключаются");
    },
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <button onClick={handlers.telegram} title="Telegram"
        className="flex items-center justify-center gap-2 border border-white/10 hover:border-[#00CC00]/50 rounded-xl py-2.5 text-gray-300 hover:text-white text-sm transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.04 15.51l-.38 5.32c.54 0 .78-.23 1.06-.5l2.55-2.44 5.28 3.87c.97.53 1.65.25 1.91-.9L23.9 3.8c.31-1.42-.51-1.98-1.45-1.63L1.7 10.9c-1.39.54-1.37 1.32-.24 1.67l4.68 1.46L18.34 6.2c.51-.34.98-.15.6.19L9.04 15.51z"/>
        </svg>
        TG
      </button>
      <button onClick={handlers.discord} title="Discord"
        className="flex items-center justify-center gap-2 border border-white/10 hover:border-[#5865F2]/60 rounded-xl py-2.5 text-gray-300 hover:text-white text-sm transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.32 4.37a19.8 19.8 0 00-4.93-1.51 13.8 13.8 0 00-.64 1.28 18.3 18.3 0 00-5.5 0 12.6 12.6 0 00-.64-1.28c-1.71.29-3.37.8-4.93 1.51A20.3 20.3 0 00.1 18.06a19.9 19.9 0 006.07 3.03c.49-.66.93-1.37 1.3-2.1a12.9 12.9 0 01-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0012.16 0c.16.13.33.26.5.38-.65.38-1.34.71-2.05.98.37.73.8 1.44 1.3 2.1a19.8 19.8 0 006.07-3.03 20.2 20.2 0 00-3.58-13.69zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42z"/>
        </svg>
        DC
      </button>
      <button onClick={handlers.google} title="Google"
        className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/40 rounded-xl py-2.5 text-gray-300 hover:text-white text-sm transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        G
      </button>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = async (user) => {
    setLoading(true);
    setError(null);
    setNotice(null);
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
        if (window.umami) window.umami.track("login-success", { method: "telegram" });
        router.push("/profile");
      } else {
        setError(humanizeError(data.detail));
      }
    } catch (e) {
      setError("Сервер недоступен. Подожди минуту и попробуй снова.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    // Клиентские проверки с человеческими текстами
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Похоже, в адресе почты опечатка. Проверь формат: name@example.com");
      return;
    }
    if (password.length < 8) {
      setError("Пароль короткий: нужно минимум 8 символов.");
      return;
    }
    if (mode === "register") {
      if (!/[A-Za-zА-Яа-я]/.test(password)) {
        setError("В пароле должна быть хотя бы одна буква.");
        return;
      }
      if (!/\d/.test(password)) {
        setError("В пароле должна быть хотя бы одна цифра.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setNotice(null);
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
        if (window.umami) window.umami.track("login-success", { method: "email" });
        router.push("/profile");
      } else {
        setError(humanizeError(data.detail));
      }
    } catch (e) {
      setError("Сервер недоступен. Подожди минуту и попробуй снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Logo size={36} />
          <span className="font-extrabold text-lg text-white">AI Combiner</span>
        </a>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h1 className="text-xl font-extrabold mb-1 text-white">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {mode === "login"
              ? "С возвращением"
              : "Бесплатно, $0.50 на запросы каждый день"}
          </p>

          {/* Telegram Login Widget (программная загрузка) */}
          <div className="mb-4">
            <TelegramLogin botName="aicombinernet_bot" onAuth={handleTelegramAuth} />
          </div>

          {/* Discord / Google */}
          <OAuthButtons onNotify={(msg) => { setNotice(msg); setError(null); }} />

          <div className="flex items-center gap-3 my-5">
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
              className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none focus:border-[#00CC00] transition-colors placeholder:text-gray-600"
            />
            <input
              type="password"
              placeholder="Пароль (мин. 8 символов, буквы и цифры)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none focus:border-[#00CC00] transition-colors placeholder:text-gray-600"
            />
            {mode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Реферальный код (необязательно)"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none focus:border-[#00CC00] transition-colors placeholder:text-gray-600"
                />
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Подтверждение почты включим в ближайшем обновлении — сейчас регистрация
                  работает без письма, но укажи реальный адрес: на него придут уведомления.
                </p>
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs leading-relaxed">
                {error}
              </div>
            )}
            {notice && (
              <div className="bg-[#00CC00]/10 border border-[#00CC00]/30 rounded-xl px-4 py-3 text-[#33FF33] text-xs leading-relaxed">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-50 text-black rounded-xl py-3 font-bold text-sm transition-colors"
            >
              {loading ? "Секунду..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm">
            {mode === "login" ? (
              <button
                onClick={() => { setMode("register"); setError(null); setNotice(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Нет аккаунта? <span className="text-[#00FF00] font-medium">Регистрация</span>
              </button>
            ) : (
              <button
                onClick={() => { setMode("login"); setError(null); setNotice(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Уже есть аккаунт? <span className="text-[#00FF00] font-medium">Войти</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Продолжая, ты соглашаешься с{" "}
          <a href="/terms" className="text-gray-500 hover:text-gray-300 underline">соглашением</a>
          {" "}и{" "}
          <a href="/privacy" className="text-gray-500 hover:text-gray-300 underline">политикой</a>
        </p>
      </div>
    </div>
  );
}
