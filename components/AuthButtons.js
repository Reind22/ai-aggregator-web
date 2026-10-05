"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";

/**
 * Иконка профиля в шапке.
 * Если пользователь вошёл — показываем круглую иконку с аватаром/инициалом,
 * клик ведёт в личный кабинет. Если нет — кнопку «Войти».
 */
export default function AuthButtons({ variant = "dark" }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    // Аватар из Telegram (если сохраняли при входе)
    const savedPhoto = localStorage.getItem("ai_photo");
    if (savedPhoto) setPhoto(savedPhoto);

    const token = localStorage.getItem("ai_token");
    if (!token) {
      setChecked(true);
      return;
    }
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
    return <div className="w-[38px] h-[38px]" aria-hidden="true" />;
  }

  if (user) {
    const initial = user.telegram_linked
      ? "T"
      : (user.email ? user.email.charAt(0).toUpperCase() : "U");

    return (
      <Link
        href="/profile"
        title="Личный кабинет"
        aria-label="Профиль"
        className="group relative flex items-center justify-center w-[38px] h-[38px] rounded-full border-2 border-[#00CC00]/50 hover:border-[#00FF00] bg-[#00CC00]/10 hover:bg-[#00CC00]/20 transition-all overflow-hidden flex-shrink-0"
      >
        {photo ? (
          // Аватар из Telegram (если есть)
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[14px] font-bold text-[#33FF33] group-hover:text-[#00FF00] transition-colors">
            {initial}
          </span>
        )}
      </Link>
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
