"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import ProfileTabs from "../../components/ProfileTabs";
import { apiFetch, logout as doLogout, logoutAll } from "../../lib/api";

const API_BASE = "/api";

export default function ProfilePage() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifyMsg, setNotifyMsg] = useState(null);

  const notify = (m) => {
    setNotifyMsg(m);
    setTimeout(() => setNotifyMsg(null), 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("ai_token");
    if (!saved) {
      setLoading(false);
      return;
    }
    setToken(saved);
    apiFetch("/profile/")
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

  const logout = async () => {
    await doLogout();
    window.location.href = "/";
  };

  const logoutAllDevices = async () => {
    if (!confirm("Выйти на всех устройствах? Все активные сессии будут завершены.")) return;
    await logoutAll();
    window.location.href = "/login";
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
            <h1 className="text-2xl font-extrabold text-white mb-2">Личный кабинет</h1>
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
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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

      {notifyMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d1117] border border-[#00FF00]/40 rounded-xl px-5 py-3 text-[#00FF00] text-sm shadow-lg shadow-black/50">
          {notifyMsg}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">Личный кабинет</h1>

        <ProfileTabs
          profile={profile}
          notify={notify}
          logout={logout}
          logoutAllDevices={logoutAllDevices}
        />
      </main>
    </div>
  );
}
