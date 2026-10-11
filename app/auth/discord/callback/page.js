"use client";

/**
 * Универсальный колбэк Discord OAuth.
 * Токены приходят в URL-фрагменте (#discord&access_token=...&refresh_token=...)
 * при входе/регистрации; при привязке — редирект на /profile?discord_link=ok|error.
 */
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "../../../../components/Logo";

function DiscordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Завершаю вход через Discord...");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Сценарий привязки: бэк редиректит на /profile?discord_link=...
    const linkResult = params.get("discord_link");
    if (linkResult) return; // это не наша страница — профиль сам покажет

    // Сценарий входа: фрагмент #discord&access_token=...
    const hash = window.location.hash.replace(/^#/, "");
    const parts = new URLSearchParams(hash.startsWith("discord&") ? hash.slice(8) : hash);
    const access = parts.get("access_token");
    const refresh = parts.get("refresh_token");
    const created = parts.get("created");

    if (!access || !refresh) {
      const err = params.get("error_description") || params.get("error");
      setError(
        err
          ? `Discord вернул ошибку: ${err}`
          : "В ответе Discord нет токенов. Попробуй войти заново."
      );
      setStatus("");
      return;
    }

    localStorage.setItem("ai_token", access);
    localStorage.setItem("ai_refresh_token", refresh);
    if (window.umami) {
      window.umami.track("login-success", { method: "discord" });
    }
    setStatus(created === "1" ? "Аккаунт создан! Перенаправляю..." : "Вход выполнен! Перенаправляю...");
    setTimeout(() => router.push("/profile"), 900);
  }, [params, router]);

  const linkResult = params.get("discord_link");
  if (linkResult) {
    // Не наш сценарий — отдаём на профиль (там покажется результат)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Возвращаю в профиль...</p>
          <ScriptRedirect target="/profile" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {error ? (
          <>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
            <a
              href="/login"
              className="inline-block mt-4 text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Назад ко входу
            </a>
          </>
        ) : (
          <p className="text-gray-300">{status}</p>
        )}
      </div>
    </div>
  );
}

function ScriptRedirect({ target }) {
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = target; }, 1200);
    return () => clearTimeout(t);
  }, [target]);
  return null;
}

export default function DiscordCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    }>
      <DiscordInner />
    </Suspense>
  );
}
