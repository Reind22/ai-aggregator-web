"use client";

import { useState, useRef, useEffect } from "react";

// Языки интерфейса
const LANGS = [
  { code: "ru", label: "Русский", flag: "RU" },
  { code: "en", label: "English", flag: "EN" },
];

export default function LanguageMenu({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("ru");
  const ref = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai_lang") || "ru";
    setLang(saved);
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (code) => {
    setLang(code);
    localStorage.setItem("ai_lang", code);
    setOpen(false);
    // Событие в Umami — выбор языка
    if (window.umami) {
      window.umami.track("language-select", { lang: code });
    }
  };

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2.5 py-2 min-h-[44px] rounded-lg hover:bg-white/5"
        aria-label="Выбор языка"
      >
        <span className="text-[11px] font-bold tracking-wide">{current.flag}</span>
        {!compact && <span className="hidden sm:inline">{current.code.toUpperCase()}</span>}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[140px] z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                l.code === lang
                  ? "bg-[#00CC00]/10 text-[#00FF00]"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <span className="text-[11px] font-bold w-6 text-center">{l.flag}</span>
              {l.label}
              {l.code === lang && (
                <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
