"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Logo from "../../../components/Logo";

const API_BASE = "/api";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Проверяю ответ Telegram...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error");

    if (err) {
      setError(`Telegram вернул ошибку: ${err}`);
      setStatus("");
      return;
    }
    if (!code) {
      setError("В ответе Telegram нет кода авторизации.");
      setStatus("");
      return;
    }

    // Проверка state (защита от CSRF)
    const savedState = localStorage.getItem("tg_oidc_state");
    if (savedState && state && savedState !== state) {
      setError("Проверка безопасности не пройдена (state не совпал). Попробуйте войти снова.");
      setStatus("");
      return;
    }

    fetch(`${API_BASE}/auth/oidc/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.detail || "Не удалось завершить вход через Telegram.");
          setStatus("");
          return;
        }
        localStorage.setItem("ai_token", data.access_token);
        localStorage.setItem("ai_refresh_token", data.refresh_token);
        // Аватар из Telegram — для иконки профиля в шапке
        if (data.picture) localStorage.setItem("ai_photo", data.picture);
        localStorage.removeItem("tg_oidc_state");
        if (window.umami) {
          window.umami.track("login-success", { method: "telegram_oidc" });
          if (data.user_id) window.umami.identify(`user_${data.user_id}`);
        }
        setStatus("Вход выполнен. Перенаправляю в профиль...");
        router.push("/profile");
      })
      .catch(() => {
        setError("Сервер недоступен. Попробуйте позже.");
        setStatus("");
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 w-fit"><Logo size={56} /></div>
        <h1 className="text-xl font-extrabold text-white mb-3">
          {error ? "Не удалось войти" : "Вход через Telegram"}
        </h1>
        {status && <p className="text-gray-400 text-sm">{status}</p>}
        {error && (
          <>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
              {error}
            </div>
            <a href="/login" className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
              Вернуться ко входу
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function TelegramCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
