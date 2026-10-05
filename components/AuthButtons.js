"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";

/**
 * Кнопки авторизации в шапке.
 * Если пользователь вошёл — показываем ссылку на профиль с аватаром/именем,
 * если нет — кнопку «Войти». Состояние проверяется по токену и профилю API.
 */
export default function AuthButtons({ variant = "dark" }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ai_token");
    if (!token) {
      setChecked(true);
      return;
    }
    // Токен есть — уточняем профиль (apiFetch сам обновит токен при необходимости)
    apiFetch("/profile/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else localStorage.removeItem("ai_token");
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    // Плейсхолдер, чтобы шапка не «прыгала»
    return <div className="w-[86px] h-[38px]" aria-hidden="true" />;
  }

  if (user) {
    const label = user.telegram_linked ? "Профиль" : (user.email ? user.email.split("@")[0] : "Профиль");
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-2 border border-[#00CC00]/40 hover:border-[#00FF00] bg-[#00CC00]/10 px-3 py-2 rounded-lg font-semibold text-[13px] sm:text-sm text-[#33FF33] transition-colors"
          title="Личный кабинет"
        >
          <span className="w-5 h-5 rounded-full bg-[#00CC00] text-black text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {label.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden sm:inline max-w-[110px] truncate">{label}</span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="border border-white/15 hover:border-white/35 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
    >
      Войти
    </Link>
  );
}
