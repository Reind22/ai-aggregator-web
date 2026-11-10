"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";

/**
 * Мобильное выпадающее меню лендинга: кнопка-гамбургер (видна на <md),
 * раскрывает навигацию + кнопки авторизации. На десктопе скрыто.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const links = [
    { href: "/#features", label: "Возможности" },
    { href: "/#pricing", label: "Тарифы" },
    { href: "/models", label: "Каталог моделей" },
    { href: "/pricing", label: "Цены" },
    { href: "/apikeys", label: "API" },
    { href: "/profile", label: "Личный кабинет" },
  ];

  return (
    <div className="md:hidden relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-gray-300 hover:text-white transition-colors"
        aria-label="Меню"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-56 bg-[#12121c] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <div className="border-t border-white/10 my-1"></div>
          <a href="/login" onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Войти</a>
          <a href="/chat" onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-bold text-[#00FF00] hover:bg-white/5 transition-colors">Открыть чат →</a>
        </div>
      )}
    </div>
  );
}
