"use client";

/**
 * Общая шапка сайта: логотип и разделы слева, язык и вход справа.
 *
 * Задача — одинаковая шапка на всех страницах, чтобы не возвращаться на
 * главную. Никаких круглых аватарок: если пользователь вошёл, справа стоит
 * компактная ссылка «Кабинет», если нет — кнопка «Войти».
 */
import { useEffect, useState } from "react";
import Logo from "./Logo";
import LanguageMenu from "./LanguageMenu";

const NAV = [
  { href: "/models", label: "Модели" },
  { href: "/pricing", label: "Цены" },
  { href: "/chat", label: "Чат" },
  { href: "/apikeys", label: "API" },
];

export default function SiteHeader({ active, subtitle }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_token") : null;
    setLoggedIn(Boolean(token));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-surface-dark/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2.5">
        {/* Слева: логотип и разделы */}
        <a href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <Logo size={26} />
          <span className="text-[15px] font-extrabold text-white">AI Combiner</span>
          {subtitle && <span className="ml-1 hidden text-xs text-gray-600 sm:inline">{subtitle}</span>}
        </a>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={active === l.href ? "text-white" : "text-gray-400 transition-colors hover:text-white"}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Справа: язык и вход */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <LanguageMenu compact />
          {loggedIn ? (
            <a
              href="/profile"
              className="rounded-lg border border-[#00CC00]/40 px-3 py-1.5 text-xs font-medium text-[#00FF00] transition-colors hover:bg-[#00CC00]/10"
            >
              Кабинет
            </a>
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-[#00FF00] px-4 py-1.5 text-xs font-medium text-[#0A2A0A] transition-colors hover:bg-[#00CC00]"
            >
              Войти
            </a>
          )}
        </div>
      </div>

      {/* Мобильная навигация */}
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-white/5 px-4 py-2 text-xs md:hidden">
        {NAV.map((l) => (
          <a key={l.href} href={l.href} className={active === l.href ? "text-white" : "text-gray-400"}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}