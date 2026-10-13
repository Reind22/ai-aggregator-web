"use client";

/**
 * Колбэк Discord OAuth: Discord возвращает юзера с ?code=...&state=...
 * Страница передаёт code+state в API (/api/auth/discord/callback), получает JSON-токены,
 * сохраняет их и редиректит в чат. При привязке API редиректит на /profile.
 */
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "../../../../components/Logo";

function DiscordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Завершаю вход через Discord...");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Сценарий привязки: API редиректит на /profile?discord_link=...
    const linkResult = params.get("discord_link");
    if (linkResult) return; // это не наша страница — профиль сам покажет

    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error_description") || params.get("error");

    if (err || !code || !state) {
      setError(
        err
          ? `Discord вернул ошибку: ${err}`
          : "Discord не вернул код авторизации. Попробуй войти заново."
      );
      setStatus("");
      return;
    }

    fetch(`/api/auth/discord/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, { redirect: "follow" })
      .then(async (r) => {
        // API может вернуть JSON (login) или redirect на /profile (link) — для link браузер сам перейдёт
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          return { redirect: true };
        }
        return { ok: r.ok, data: await r.json() };
      })
      .then(async (res) => {
        if (res.redirect) return; // link-сценарий: страница /profile уже загружена API-редиректом
        if (!res.ok) {
          setError(res.data?.detail || "Discord: не удалось завершить вход.");
          setStatus("");
          return;
        }
        localStorage.setItem("ai_token", res.data.access_token);
        localStorage.setItem("ai_refresh_token", res.data.refresh_token);
        if (window.umami) {
          window.umami.track("login-success", { method: "discord" });
        }
        setStatus(res.data.created ? "Аккаунт создан! Перенаправляю..." : "Вход выполнен. Перенаправляю...");
        setTimeout(() => router.push("/chat"), 800);
      })
      .catch(() => {
        setError("Сервер недоступен. Попробуй позже.");
        setStatus("");
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 w-fit"><Logo size={64} /></div>
        {error ? (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">Ошибка входа</h1>
            <p className="text-red-300 mb-6 max-w-sm">{error}</p>
            <a href="/login" className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black px-8 py-3 rounded-xl font-bold transition-colors">Вернуться ко входу</a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">{status}</h1>
            <p className="text-gray-500 text-sm">Закрывать страницу не нужно</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function DiscordCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-dark" />}>
      <DiscordInner />
    </Suspense>
  );
}
