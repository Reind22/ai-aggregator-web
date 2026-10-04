"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../../../components/Logo";

/**
 * Реферальная ссылка сайта: /ref/CODE
 * Сохраняю код в localStorage (подхватится при регистрации),
 * пишу событие в Umami и перебрасываю на регистрацию.
 */
export default function RefPage({ params }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const code = params.code;
    if (code && /^[a-zA-Z0-9]{1,16}$/.test(code)) {
      localStorage.setItem("ai_referral", code);
      if (window.umami) window.umami.track("referral-visit", { code });
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [params.code]);

  useEffect(() => {
    if (countdown <= 0) window.location.href = "/login";
  }, [countdown]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 w-fit"><Logo size={64} /></div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Тебя пригласили в AI Combiner</h1>
        <p className="text-gray-400 mb-1">
          Реферальный код{" "}
          <code className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-[#00FF00] font-mono">
            {params.code}
          </code>{" "}
          сохранён — применится при регистрации.
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Перенаправляю на регистрацию через {Math.max(0, countdown)}...
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Перейти сейчас
        </Link>
      </div>
    </div>
  );
}
