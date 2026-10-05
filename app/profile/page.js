"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";

const API_BASE = "/api";

const TIER_LABELS = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

export default function ProfilePage() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedSite, setCopiedSite] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai_token");
    if (!saved) {
      setLoading(false);
      return;
    }
    setToken(saved);
    fetch(`${API_BASE}/profile/`, {
      headers: { Authorization: `Bearer ${saved}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((p) => {
        setProfile(p);
        if (window.umami && p.id) window.umami.identify(`user_${p.id}`);
      })
      .catch((status) => {
        if (status === 401) localStorage.removeItem("ai_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const copyRef = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySiteRef = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`https://aicombiner.net/ref/${profile.referral.code}`);
    setCopiedSite(true);
    if (window.umami) window.umami.track("referral-link-copy", { type: "site" });
    setTimeout(() => setCopiedSite(false), 2000);
  };

  const logout = () => {
    localStorage.removeItem("ai_token");
    localStorage.removeItem("ai_refresh_token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!token || !profile) {
    return (
      <div className="min-h-screen bg-surface-dark">
        <header className="border-b border-white/[0.06] sticky top-0 bg-surface-dark/90 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-extrabold text-[15px] text-white">AI Combiner</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/apikeys" className="text-gray-400 hover:text-white transition-colors">API</Link>
              <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Чат</Link>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Войти</Link>
            </nav>
          </div>
        </header>
        <div className="flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 61px)" }}>
          <div className="text-center">
            <div className="mx-auto mb-5 w-fit"><Logo size={56} /></div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Профиль</h1>
            <p className="text-gray-500 mb-7">Войдите, чтобы увидеть свой профиль</p>
            <Link href="/login" className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black px-8 py-3 min-h-[44px] leading-[44px] rounded-xl font-bold transition-colors">
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      <header className="border-b border-white/[0.06] sticky top-0 bg-surface-dark/90 backdrop-blur-xl z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-extrabold text-[15px] text-white">AI Combiner</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/apikeys" className="text-gray-400 hover:text-white transition-colors">API</Link>
            <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Чат</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">Профиль</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Аккаунт */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Аккаунт</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-200 font-mono">#{profile.id}</span>
              </div>
              {profile.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-200">{profile.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Telegram</span>
                {profile.telegram_linked ? (
                  <span className="text-[#00FF00]">✓ привязан</span>
                ) : (
                  <span className="text-gray-600">не привязан</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discord</span>
                {profile.discord_linked ? (
                  <span className="text-[#00FF00]">✓ привязан</span>
                ) : (
                  <span className="text-gray-600">не привязан</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">С нами с</span>
                <span className="text-gray-200">
                  {new Date(profile.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          </div>

          {/* Подписка */}
          <div className="bg-white/[0.03] border border-[#00CC00]/25 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Подписка</h2>
            <div className="text-4xl font-extrabold text-white mb-1">
              {TIER_LABELS[profile.tier] || profile.tier}
            </div>
            <div className="text-[#33FF33] font-semibold mb-4">
              ${profile.daily_balance_usd.toFixed(2)} на сегодня
            </div>
            <div className="text-xs text-gray-500 mb-5">
              {profile.subscription_expires
                ? `Действует до ${new Date(profile.subscription_expires).toLocaleDateString("ru-RU")}`
                : "Бесплатный тариф"}
            </div>
            <Link href="/#pricing" className="block w-full text-center bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl py-2.5 font-bold text-sm transition-colors">
              {profile.tier === "free" ? "Улучшить тариф" : "Сменить тариф"}
            </Link>
          </div>

          {/* Статистика */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Статистика</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-extrabold text-white">{profile.stats.chats}</div>
                <div className="text-xs text-gray-500 mt-1">чатов</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{profile.stats.messages}</div>
                <div className="text-xs text-gray-500 mt-1">сообщений</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">{profile.stats.api_keys}</div>
                <div className="text-xs text-gray-500 mt-1">API-ключей</div>
              </div>
            </div>
            <Link href="/apikeys" className="block mt-5 text-center border border-white/10 hover:border-[#00CC00]/50 text-gray-300 rounded-xl py-2.5 text-sm font-medium transition-colors">
              Управлять API-ключами
            </Link>
          </div>

          {/* Рефералка */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-1">Реферальная программа</h2>
            <p className="text-xs text-gray-500 mb-4">
              {profile.referral.percent}% с оплат приведённых друзей — пожизненно
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#33FF33] font-mono truncate">
                  {profile.referral.link}
                </code>
                <button onClick={copyRef} title="Скопировать ссылку-бота" className="bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-lg px-3 py-2 text-xs font-bold transition-colors flex-shrink-0">
                  {copied ? "✓" : "TG"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono truncate">
                  https://aicombiner.net/ref/{profile.referral.code}
                </code>
                <button onClick={copySiteRef} title="Скопировать ссылку-сайт" className="border border-white/15 hover:border-[#00CC00]/60 text-gray-200 rounded-lg px-3 py-2 text-xs font-bold transition-colors flex-shrink-0">
                  {copiedSite ? "✓" : "Web"}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Приглашено</span>
              <span className="text-white font-semibold">{profile.referral.referred_count}</span>
            </div>
            {profile.referral.referred_by && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Тебя пригласил</span>
                <span className="text-gray-300">{profile.referral.referred_by}</span>
              </div>
            )}
          </div>
        </div>

        <button onClick={logout} className="mt-8 text-sm text-gray-600 hover:text-red-400 transition-colors">
          Выйти из аккаунта
        </button>
      </main>
    </div>
  );
}
