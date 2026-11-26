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

  useEffect(() => {
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
    return (
      <Link
        href="/profile"
        className="border border-white/15 hover:border-white/35 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
      >
        Профиль
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
