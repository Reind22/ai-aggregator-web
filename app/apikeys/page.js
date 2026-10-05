"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import { apiFetch } from "../../lib/api";

const API_BASE = "/api";

const ALL_MODELS = [
  { id: "glm-5.3-flash", name: "GLM 5.3 Flash" },
  { id: "glm-5.3-flashx", name: "GLM 5.3 FlashX" },
  { id: "glm-5.2", name: "GLM 5.2" },
  { id: "glm-5.3", name: "GLM 5.3" },
  { id: "glm-5.1", name: "GLM 5.1" },
  { id: "deepseek-chat", name: "DeepSeek Chat" },
];

const RESET_PERIODS = [
  { value: "day", label: "Раз в день" },
  { value: "week", label: "Раз в неделю" },
  { value: "month", label: "Раз в месяц" },
];

function humanReset(p) {
  return RESET_PERIODS.find((r) => r.value === p)?.label || p;
}

export default function ApiKeysPage() {
  const [token, setToken] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyRaw, setNewKeyRaw] = useState(null); // полный ключ — показывается один раз
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Форма создания
  const [name, setName] = useState("Мой ключ");
  const [moneyLimit, setMoneyLimit] = useState("5");
  const [timeLimit, setTimeLimit] = useState("0");
  const [resetPeriod, setResetPeriod] = useState("month");
  const [selectedModels, setSelectedModels] = useState([]);

  const loadKeys = useCallback(async (t) => {
    try {
      const res = await apiFetch("/api-keys/");
      if (res.ok) setKeys(await res.json());
      else if (res.status === 401) {
        localStorage.removeItem("ai_token");
        setToken(null);
      }
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ai_token");
    if (saved) {
      setToken(saved);
      loadKeys(saved);
    } else {
      setLoading(false);
    }
  }, [loadKeys]);

  const createKey = async () => {
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch("/api-keys/", {
        method: "POST",
        body: {
          name,
          money_limit_usd: parseFloat(moneyLimit) || 0,
          time_limit_hours: parseInt(timeLimit) || 0,
          models: selectedModels,
          reset_period: resetPeriod,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setNewKeyRaw(data.key);
        loadKeys(token);
        if (window.umami) window.umami.track("api-key-created");
      } else {
        setError(typeof data.detail === "string" ? data.detail : "Не удалось создать ключ");
      }
    } catch (e) {
      setError("Сервер недоступен");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (key) => {
    await apiFetch(`/api-keys/${key.id}`, {
      method: "PATCH",
      body: { is_active: !key.is_active },
    });
    loadKeys(token);
  };

  const deleteKey = async (key) => {
    if (!confirm(`Удалить ключ «${key.name}»? Действие необратимо.`)) return;
    await apiFetch(`/api-keys/${key.id}`, { method: "DELETE" });
    loadKeys(token);
  };

  const toggleModel = (id) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKeyRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-surface-dark">
        <header className="border-b border-white/[0.06] sticky top-0 bg-surface-dark/90 backdrop-blur-xl z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-extrabold text-[15px] text-white">AI Combiner</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Профиль</Link>
              <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Чат</Link>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Войти</Link>
            </nav>
          </div>
        </header>
        <div className="flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 61px)" }}>
          <div className="text-center">
            <div className="mx-auto mb-5 w-fit"><Logo size={56} /></div>
            <h1 className="text-2xl font-extrabold text-white mb-2">API для разработчиков</h1>
            <p className="text-gray-500 mb-7">Войдите, чтобы управлять API-ключами</p>
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
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 bg-surface-dark/90 backdrop-blur-xl z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-extrabold text-[15px] text-white">AI Combiner</span>
            <span className="text-xs text-gray-600 ml-2">API</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Профиль</Link>
            <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Чат</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">API-ключи</h1>
        <p className="text-gray-500 mb-8">
          Используй нейросети в своих проектах. До 50 ключей, у каждого — свои лимиты.
        </p>

        {/* Модалка нового ключа */}
        {newKeyRaw && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0d14] border border-[#00CC00]/40 rounded-2xl p-6 max-w-lg w-full">
              <h2 className="text-xl font-extrabold text-[#00FF00] mb-2">Ключ создан</h2>
              <p className="text-gray-400 text-sm mb-4">
                Скопируй его сейчас — <b className="text-white">полностью он больше никогда не покажется</b>.
              </p>
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-sm text-[#33FF33] break-all mb-4">
                {newKeyRaw}
              </div>
              <div className="flex gap-3">
                <button onClick={copyKey} className="flex-1 bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl py-2.5 font-bold transition-colors">
                  {copied ? "✓ Скопировано" : "Скопировать"}
                </button>
                <button onClick={() => setNewKeyRaw(null)} className="flex-1 border border-white/10 hover:border-white/30 text-gray-200 rounded-xl py-2.5 font-medium transition-colors">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8">
          {/* Форма создания */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 h-fit">
            <h2 className="font-bold text-white mb-4">Новый ключ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Название</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#00CC00] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Лимит, $ <span className="text-gray-700">(0 = нет)</span>
                  </label>
                  <input type="number" min="0" step="0.5" value={moneyLimit} onChange={(e) => setMoneyLimit(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#00CC00]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Мин. интервал, ч <span className="text-gray-700">(0 = нет)</span>
                  </label>
                  <input type="number" min="0" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#00CC00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Сброс лимита</label>
                <select value={resetPeriod} onChange={(e) => setResetPeriod(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#00CC00]">
                  {RESET_PERIODS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Модели <span className="text-gray-700">(ничего не выбрано = все)</span>
                </label>
                <div className="space-y-1.5">
                  {ALL_MODELS.map((m) => (
                    <label key={m.id} className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={selectedModels.includes(m.id)}
                        onChange={() => toggleModel(m.id)}
                        className="accent-[#00CC00] w-4 h-4" />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={createKey} disabled={creating || !name.trim()}
                className="w-full bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-40 text-black rounded-xl py-3 font-bold text-sm transition-colors">
                {creating ? "..." : "Создать ключ"}
              </button>
            </div>
          </div>

          {/* Список ключей */}
          <div className="space-y-3">
            <h2 className="font-bold text-white">Мои ключи {keys.length > 0 && `(${keys.length})`}</h2>
            {keys.length === 0 && (
              <p className="text-gray-600 text-sm">Ключей пока нет — создай первый слева.</p>
            )}
            {keys.map((k) => (
              <div key={k.id} className={`bg-white/[0.03] border rounded-2xl p-5 ${k.is_active ? "border-white/[0.08]" : "border-white/[0.04] opacity-50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white text-sm">{k.name}</div>
                    <code className="text-xs text-gray-600 font-mono">{k.key_prefix}...</code>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.is_active ? "bg-[#00CC00]/15 text-[#00FF00]" : "bg-white/5 text-gray-500"}`}>
                    {k.is_active ? "Активен" : "Отключён"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <div>Лимит: <span className="text-gray-300">{k.money_limit_usd > 0 ? `$${k.money_limit_usd}` : "нет"}</span></div>
                  <div>Потрачено: <span className="text-gray-300">${(k.money_used_usd || 0).toFixed(3)}</span></div>
                  <div>Интервал: <span className="text-gray-300">{k.time_limit_hours > 0 ? `${k.time_limit_hours} ч` : "нет"}</span></div>
                  <div>Сброс: <span className="text-gray-300">{humanReset(k.reset_period)}</span></div>
                  <div className="col-span-2">
                    Модели: <span className="text-gray-300">{k.models && k.models.length > 0 ? k.models.map((m) => ALL_MODELS.find((a) => a.id === m)?.name || m).join(", ") : "все"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(k)}
                    className="flex-1 border border-white/10 hover:border-[#00CC00]/50 text-gray-300 text-xs py-2 rounded-lg transition-colors">
                    {k.is_active ? "Отключить" : "Включить"}
                  </button>
                  <button onClick={() => deleteKey(k)}
                    className="flex-1 border border-red-500/20 hover:border-red-500/60 text-red-400 text-xs py-2 rounded-lg transition-colors">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
