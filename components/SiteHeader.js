"use client";

/**
 * Общая шапка сайта: логотип, язык, вход и бургер-меню со всеми разделами.
 *
 * Меню одинаковое на всех страницах и на всех ширинах: на мобильных это
 * единственный способ не растягивать строку кнопок, на десктопе — та же
 * кнопка, чтобы поведение не отличалось.
 */
import { useEffect, useState } from "react";
import Logo from "./Logo";
import LanguageMenu from "./LanguageMenu";
import NavMenu from "./NavMenu";

export default function SiteHeader({ subtitle }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_token") : null;
    setLoggedIn(Boolean(token));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-surface-dark/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <a href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <Logo size={26} />
          <span className="text-[15px] font-extrabold text-white">AI Combiner</span>
          {subtitle && <span className="ml-1 hidden text-xs text-gray-600 sm:inline">{subtitle}</span>}
        </a>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <LanguageMenu compact />
          {!loggedIn && (
            <a
              href="/login"
              className="rounded-lg bg-[#00FF00] px-4 py-1.5 text-xs font-medium text-[#0A2A0A] transition-colors hover:bg-[#00CC00]"
            >
              Войти
            </a>
          )}

          <NavMenu />
        </div>
      </div>

    </header>
  );
}
