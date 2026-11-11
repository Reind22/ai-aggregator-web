"use client";

/**
 * Страница API-ключей.
 *
 * Модели и цены берутся из единого каталога (/models), а не из списка в коде.
 * Ключи работают через OpenAI-совместимый шлюз: POST /api/v1/chat/completions.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import SiteHeader from "../../components/SiteHeader";
import { apiFetch } from "../../lib/api";

// Публичный адрес шлюза: nginx проксирует /v1/ напрямую на API
const GATEWAY_URL = "https://aicombiner.net/v1";

const RESET_PERIODS = [
  { value: "day", label: "Раз в день" },
  { value: "week", label: "Раз в неделю" },
  { value: "month", label: "Раз в месяц" },
];

function humanReset(p) {
  return RESET_PERIODS.find((r) => r.value === p)?.label || p;
}

function fmtPrice(v) {
  if (v === null || v === undefined) return "—";
  if (v < 0.001) return `$${v.toFixed(5)}`;
  return `$${v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`;
}

export default function ApiKeysPage() {
  const [copiedBase, setCopiedBase] = useState(false);
  const copyBase = async () => {
    try {
      await navigator.clipboard.writeText(GATEWAY_URL);
      setCopiedBase(true);
      setTimeout(() => setCopiedBase(false), 1500);
    } catch (_) {}
  };
  const [token, setToken] = useState(null);
  const [allModels, setAllModels] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyRaw, setNewKeyRaw] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("docs");

  // Форма создания
  const [name, setName] = useState("Мой ключ");
  const [moneyLimit, setMoneyLimit] = useState("5");
  const [timeLimit, setTimeLimit] = useState("0");
  const [resetPeriod, setResetPeriod] = useState("month");
  const [selectedModels, setSelectedModels] = useState([]);

  // Фильтры каталога моделей
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modalityFilter, setModalityFilter] = useState("text");
  const [onlyCheap, setOnlyCheap] = useState(false);

  const loadKeys = useCallback(async () => {
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

  const loadModels = useCallback(async () => {
    try {
      const res = await apiFetch("/models/");
      if (!res.ok) return;
      const data = await res.json();
      // бэкенд отдаёт массив (совместимо с чатом); на всякий случай поддержим {items}
      const list = Array.isArray(data) ? data : (data.items || []);
      setAllModels(list);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ai_token");
    if (saved) {
      setToken(saved);
      loadKeys();
      loadModels();
    } else {
      setLoading(false);
    }
  }, [loadKeys, loadModels]);

  const brands = useMemo(
    () => Array.from(new Set(allModels.map((m) => m.brand))).sort(),
    [allModels]
  );

  const visibleModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allModels.filter((m) => {
      if (modalityFilter && m.modality !== modalityFilter) return false;
      if (brandFilter && m.brand !== brandFilter) return false;
      if (onlyCheap && (m.input_per_1m ?? 999) > 1) return false;
      if (q) {
        const hay = `${m.model} ${m.display_name} ${m.brand}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allModels, search, brandFilter, modalityFilter, onlyCheap]);

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
        loadKeys();
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
    await apiFetch(`/api-keys/${key.id}`, { method: "PATCH", body: { is_active: !key.is_active } });
    loadKeys();
  };

  const deleteKey = async (key) => {
    if (!confirm(`Удалить ключ «${key.name}»? Действие необратимо.`)) return;
    await apiFetch(`/api-keys/${key.id}`, { method: "DELETE" });
    loadKeys();
  };

  const toggleModel = (id) =>
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const copyKey = () => {
    navigator.clipboard.writeText(newKeyRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySnippet = (code, tag) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(tag);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const modelName = (id) => allModels.find((m) => m.model === id)?.display_name || id;

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
        <SiteHeader active="/apikeys" subtitle="API" />
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

  const curlSnippet = `curl ${GATEWAY_URL}/chat/completions \\
  -H "Authorization: Bearer ВАШ_КЛЮЧ" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"glm-5.3-flash","messages":[{"role":"user","content":"Привет"}]}'`;

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="${GATEWAY_URL}",
    api_key="ВАШ_КЛЮЧ",
)

r = client.chat.completions.create(
    model="glm-5.3-flash",
    messages=[{"role": "user", "content": "Привет"}],
)
print(r.choices[0].message.content)`;

  const jsSnippet = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${GATEWAY_URL}",
  apiKey: process.env.AICOMBINER_KEY,
});

const r = await client.chat.completions.create({
  model: "glm-5.3-flash",
  messages: [{ role: "user", content: "Привет" }],
});
console.log(r.choices[0].message.content);`;

  return (
    <div className="min-h-screen bg-surface-dark">
      <SiteHeader active="/apikeys" subtitle="API" />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">API-ключи</h1>
        <p className="text-gray-500 mb-8">
          OpenAI-совместимый API. Один ключ работает везде, где можно указать свой base URL: Codex CLI, Claude Code, Hermes, OpenClaw, Cline, Cursor, OpenCode, Zed и любом OpenAI SDK.
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

        {/* Табы */}
        <div className="flex gap-1 mb-6 border-b border-white/[0.08]">
          {[["docs", "Подключение"], ["create", "Новый ключ"], ["keys", `Мои ключи (${keys.length})`]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === id ? "border-[#00FF00] text-white" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Подключение */}
        {tab === "docs" && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="font-bold text-white mb-2">Адрес и авторизация</h2>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Base URL</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyBase()}
                    title="Нажмите, чтобы скопировать"
                    className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-left transition-colors hover:border-[#00CC00]/50"
                  >
                    <code className="truncate text-sm text-[#33FF33]">{GATEWAY_URL}</code>
                    <span className="ml-auto flex-shrink-0 text-[11px] text-gray-500 group-hover:text-[#00FF00]">
                      {copiedBase ? "скопировано" : "копировать"}
                    </span>
                  </button>
                  <button
                    onClick={() => copyBase()}
                    aria-label="Скопировать Base URL"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-[#00CC00]/50 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Ключ передаётся в заголовке <code className="text-gray-300">Authorization: Bearer aico-...</code> или{" "}
                <code className="text-gray-300">x-api-key</code>.
              </p>
              <div className="text-xs text-gray-600">
                Совместимо с OpenAI SDK: укажи <code>base_url</code> и свой ключ, остальной код не меняется.
              </div>
            </div>

            {[
              ["curl", "curl", curlSnippet],
              ["python", "Python", pythonSnippet],
              ["js", "JavaScript", jsSnippet],
            ].map(([tag, label, code]) => (
              <div key={tag} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                  <button
                    onClick={() => copySnippet(code, tag)}
                    className="text-xs text-gray-500 hover:text-[#00FF00] transition-colors"
                  >
                    {copiedSnippet === tag ? "✓ Скопировано" : "Копировать"}
                  </button>
                </div>
                <pre className="p-5 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{code}</pre>
              </div>
            ))}

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="font-bold text-white mb-3">Ошибки</h2>
              <div className="space-y-2 text-sm text-gray-400">
                <div><code className="text-red-400">401</code> — ключ не передан, неверный или отключён</div>
                <div><code className="text-red-400">403</code> — модель не разрешена для этого ключа</div>
                <div><code className="text-red-400">404</code> — такой модели нет</div>
                <div><code className="text-red-400">429</code> — исчерпан лимит ключа или слишком частые запросы</div>
                <div><code className="text-red-400">503</code> — у модели нет доступного поставщика</div>
              </div>
            </div>
          </div>
        )}

        {/* Создание */}
        {tab === "create" && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Новый ключ</h2>
            <div className="space-y-4 max-w-2xl">
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
                  {selectedModels.length > 0 && <span className="text-[#00FF00] ml-2">выбрано: {selectedModels.length}</span>}
                </label>

                {/* Фильтры каталога */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск модели…"
                    className="flex-1 min-w-[160px] bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-100 outline-none focus:border-[#00CC00]"
                  />
                  <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                    className="bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#00CC00]">
                    <option value="">Все разработчики</option>
                    {brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                  <select value={modalityFilter} onChange={(e) => setModalityFilter(e.target.value)}
                    className="bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#00CC00]">
                    <option value="">Все типы</option>
                    <option value="text">Текст</option>
                    <option value="image">Изображения</option>
                    <option value="video">Видео</option>
                  </select>
                  <button
                    onClick={() => setOnlyCheap((v) => !v)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                      onlyCheap ? "border-[#00CC00] text-[#00FF00]" : "border-white/10 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    до $1 / 1M
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 border border-white/[0.06] rounded-xl p-2">
                  {visibleModels.length === 0 && (
                    <p className="text-gray-600 text-xs p-2">Ничего не найдено</p>
                  )}
                  {visibleModels.map((m) => (
                    <label key={m.model} className="flex items-center justify-between gap-3 text-sm text-gray-300 cursor-pointer hover:bg-white/[0.03] rounded-lg px-2 py-1.5">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <input type="checkbox" checked={selectedModels.includes(m.model)}
                          onChange={() => toggleModel(m.model)}
                          className="accent-[#00CC00] w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{m.display_name}</span>
                      </span>
                      <span className="text-[11px] text-gray-600 whitespace-nowrap flex-shrink-0">
                        {m.request_price != null
                          ? `${fmtPrice(m.request_price)} / запрос`
                          : m.input_per_1m != null
                            ? `${fmtPrice(m.input_per_1m)} / 1M`
                            : "—"}
                      </span>
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
        )}

        {/* Список ключей */}
        {tab === "keys" && (
          <div className="space-y-3">
            {keys.length === 0 && (
              <p className="text-gray-600 text-sm">Ключей пока нет — создай первый во вкладке «Новый ключ».</p>
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
                  <div>Потрачено: <span className="text-gray-300">${(k.money_used_usd || 0).toFixed(4)}</span></div>
                  <div>Интервал: <span className="text-gray-300">{k.time_limit_hours > 0 ? `${k.time_limit_hours} ч` : "нет"}</span></div>
                  <div>Сброс: <span className="text-gray-300">{humanReset(k.reset_period)}</span></div>
                  <div>Использован: <span className="text-gray-300">{k.last_used_at ? new Date(k.last_used_at).toLocaleString("ru-RU") : "—"}</span></div>
                  <div className="col-span-2">
                    Модели: <span className="text-gray-300">{k.models && k.models.length > 0 ? k.models.map(modelName).join(", ") : "все"}</span>
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
        )}
      </main>
    </div>
  );
}
