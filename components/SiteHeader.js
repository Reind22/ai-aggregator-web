"use client";

/**
 * Общая шапка сайта: логотип, разделы, меню профиля.
 *
 * Одна на все страницы, чтобы с любой из них можно было попасть в кабинет,
 * ключи или чат без возврата на главную. Если пользователь не авторизован,
 * вместо аватара показываем «Войти».
 */
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const NAV = [
  { href: "/models", label: "Модели" },
  { href: "/pricing", label: "Цены" },
  { href: "/chat", label: "Чат" },
  { href: "/apikeys", label: "API" },
];

export default function SiteHeader({ active, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState(null);
  const [balance, setBalance] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_token") : null;
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/profile/", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const d = await res.json();
          setEmail(d.email || null);
          setBalance(d.daily_balance_usd ?? null);
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("ai_token");
      localStorage.removeItem("ai_refresh_token");
    } catch (_) {}
    window.location.href = "/";
  };

  const initial = (email || "?")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-surface-dark/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <a href="/" className="flex min-w-0 items-center gap-2.5">
          <Logo size={26} />
          <span className="truncate text-[15px] font-extrabold text-white">AI Combiner</span>
          {subtitle && <span className="ml-1 hidden text-xs text-gray-600 sm:inline">{subtitle}</span>}
        </a>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          {NAV.map((l) => (
            <a key={l.href} href={l.href}
               className={active === l.href ? "text-white" : "text-gray-400 transition-colors hover:text-white"}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative flex items-center gap-2" ref={ref}>
          <a href="/chat" className="hidden rounded-lg bg-[#00FF00] px-3 py-1.5 text-xs font-medium text-[#0A2A0A] transition-colors hover:bg-[#00CC00] sm:inline-flex md:hidden">
            Чат
          </a>
          {email ? (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Меню профиля"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#00CC00]/40 bg-[#00FF00]/10 text-sm font-semibold text-[#00FF00] transition-colors hover:bg-[#00FF00]/20"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14] shadow-2xl">
                  <div className="border-b border-white/5 px-3 py-2.5">
                    <div className="truncate text-xs text-gray-300">{email}</div>
                    {balance != null && (
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        Баланс: <span className="tabular-nums text-gray-300">${Number(balance).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="py-1 text-sm">
                    {[
                      ["/profile", "Личный кабинет"],
                      ["/apikeys", "API-ключи"],
                      ["/chat", "Чат"],
                    ].map(([href, label]) => (
                      <a key={href} href={href}
                         className="block px-3 py-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white">
                        {label}
                      </a>
                    ))}
                    <button onClick={logout}
                            className="block w-full px-3 py-2 text-left text-red-400/90 transition-colors hover:bg-white/5 hover:text-red-400">
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <a href="/login" className="rounded-lg bg-[#00FF00] px-3 py-1.5 text-xs font-medium text-[#0A2A0A] transition-colors hover:bg-[#00CC00]">
              Войти
            </a>
          )}
        </div>
      </div>

      {/* Мобильная навигация */}
      <nav className="flex items-center gap-4 border-t border-white/5 px-4 py-2 text-xs md:hidden">
        {NAV.map((l) => (
          <a key={l.href} href={l.href}
             className={active === l.href ? "text-white" : "text-gray-400"}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}