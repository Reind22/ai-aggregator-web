"use client";

/**
 * Общая шапка сайта: логотип, язык, вход и бургер-меню со всеми разделами.
 *
 * Меню одинаковое на всех страницах и на всех ширинах: на мобильных это
 * единственный способ не растягивать строку кнопок, на десктопе — та же
 * кнопка, чтобы поведение не отличалось.
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LanguageMenu from "./LanguageMenu";

const NAV = [
  { href: "/models", label: "Модели", hint: "каталог и цены" },
  { href: "/pricing", label: "Цены", hint: "стоимость за миллион токенов" },
  { href: "/status", label: "Статус", hint: "доступность и скорость" },
  { href: "/billing", label: "Пополнить", hint: "баланс и история платежей" },
  { href: "/support", label: "Поддержка", hint: "обращения и ответы" },
  { href: "/chat", label: "Чат", hint: "диалоги с моделями" },
  { href: "/apikeys", label: "API", hint: "ключи и документация" },
];

export default function SiteHeader({ subtitle }) {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_token") : null;
    setLoggedIn(Boolean(token));
  }, []);

  // при переходе между страницами меню закрывается
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-transform ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition-transform ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* затемнение под меню, закрывает его по клику */}
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[57px] z-40 cursor-default bg-black/50 backdrop-blur-[2px]"
          />

          <nav className="absolute inset-x-0 top-full z-50 border-b border-white/[0.08] bg-[#0A0A0F] shadow-2xl shadow-black/40">
            <div className="mx-auto grid max-w-6xl gap-1 px-4 py-3 sm:grid-cols-2">
              {NAV.map((item) => {
                const current = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      current ? "bg-[#00CC00]/10 text-white" : "text-gray-300 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[11px] text-gray-600">{item.hint}</span>
                  </a>
                );
              })}
              <a
                href={loggedIn ? "/profile" : "/login"}
                className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white sm:hidden"
              >
                <span className="text-sm font-medium">{loggedIn ? "Кабинет" : "Войти"}</span>
                <span className="text-[11px] text-gray-600">{loggedIn ? "профиль и ключи" : "вход по коду"}</span>
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
