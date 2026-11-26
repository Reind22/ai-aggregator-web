"use client";

/**
 * Бургер-меню сайта: кнопка и выпадающая карточка со всеми разделами.
 *
 * Оформление то же, что у меню на главной: компактная тёмная карточка под
 * кнопкой. Карточка рисуется через портал в body и позиционируется по кнопке —
 * так её не обрезают родительские контейнеры (в шапке чата есть overflow).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/models", label: "Модели" },
  { href: "/pricing", label: "Цены" },
  { href: "/status", label: "Статус" },
  { href: "/billing", label: "Пополнить" },
  { href: "/support", label: "Поддержка" },
  { href: "/apikeys", label: "API" },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_token") : null;
    setLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const place = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();

    const onDoc = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const panel = (
    <div
      ref={panelRef}
      style={{ top: pos?.top ?? 0, right: pos?.right ?? 8 }}
      className="fixed z-[100] w-60 rounded-xl border border-white/10 bg-[#12121c] py-2 shadow-2xl"
    >
      {NAV.map((item) => {
        const current = pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-white ${
              current ? "text-white" : "text-gray-300"
            }`}
          >
            {item.label}
          </a>
        );
      })}

      <div className="my-1 border-t border-white/10" />

      {loggedIn ? (
        <a
          href="/profile"
          onClick={() => setOpen(false)}
          className="block px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Профиль и ключи
        </a>
      ) : (
        <a
          href="/login"
          onClick={() => setOpen(false)}
          className="block px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Войти
        </a>
      )}

      <a
        href="/chat"
        onClick={() => setOpen(false)}
        className="block px-4 py-2.5 text-sm font-bold text-[#00FF00] transition-colors hover:bg-white/5"
      >
        Открыть чат →
      </a>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-gray-300 transition-colors hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(panel, document.body)}
    </div>
  );
}
