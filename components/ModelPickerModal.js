"use client";

/**
 * ModelPickerModal — модальное окно выбора модели (91 модель).
 * Функционал: типы ИИ (текст/изображения/аудио/видео/прочее), поиск, сортировки
 * (популярность, дата, контекст, цена), фильтр брендов, статусы из health-мониторинга.
 */

import { useState, useMemo } from "react";

const MODEL_TYPES = [
  { id: "all",   label: "Все",         icon: "✳️" },
  { id: "text",  label: "Текстовые",   icon: "📝" },
  { id: "image", label: "Изображения", icon: "🖼️" },
  { id: "audio", label: "Аудио",       icon: "🎙️" },
  { id: "video", label: "Видео",       icon: "🎬" },
  { id: "other", label: "Прочее",      icon: "🧩" },
];

const SORTS = [
  { id: "popular",   label: "Популярность" },
  { id: "date",      label: "Дата релиза" },
  { id: "ctx",       label: "Контекст" },
  { id: "price_in",  label: "Цена входа ↑" },
  { id: "price_out", label: "Цена выхода ↑" },
  { id: "name",      label: "Имя А-Я" },
];

const TYPE_ICONS = { text: "📝", image: "🖼️", audio: "🎙️", video: "🎬", other: "🧩" };

export function modelType(mid) {
  const m = (mid || "").toLowerCase();
  // Видео-генерация (проверять ДО image: kling/veo/vidu/wan/seedance генерируют видео)
  if (/(video|kling|veo|viduq|wan-|seedance|minimax-h3)/.test(m)) return "video";
  // Изображения
  if (/(gpt-image|imagine-image|nano-banana|flash-image|image-2|image-2\.5|image-preview)/.test(m)) return "image";
  // Аудио
  if (/(tts|audio|voice|speech|whisper|chirp)/.test(m)) return "audio";
  // Текст (основные семейства)
  if (/(text|flash|sol|luna|astra|terra|haiku|sonnet|opus|fable|glm|mimo|deepseek|qwen|kimi|grok-4|grok-build|minimax-m|muse|hy\d|hy4)/.test(m)) return "text";
  return "other";
}

export function brandOf(mid) {
  const m = (mid || "").toLowerCase();
  if (m.startsWith("claude")) return "Anthropic";
  if (m.startsWith("gpt")) return "OpenAI";
  if (m.startsWith("gemini")) return "Google";
  if (m.startsWith("glm")) return "Zhipu";
  if (m.startsWith("grok")) return "xAI";
  if (m.startsWith("kimi")) return "Moonshot";
  if (m.startsWith("qwen")) return "Alibaba";
  if (m.startsWith("deepseek")) return "DeepSeek";
  if (m.startsWith("mimo")) return "Xiaomi";
  if (m.startsWith("minimax")) return "MiniMax";
  if (m.startsWith("muse")) return "Meta";
  if (m.startsWith("hy")) return "Tencent";
  if (m.startsWith("kling") || m.startsWith("seedance") || m.startsWith("wan")) return "ByteDance";
  if (m.startsWith("veo")) return "Google";
  if (m.startsWith("vidu")) return "Vidu";
  return "Другое";
}

const BRAND_COLORS = {
  OpenAI: "bg-emerald-500/15 text-emerald-300",
  Anthropic: "bg-orange-500/15 text-orange-300",
  Google: "bg-blue-500/15 text-blue-300",
  Zhipu: "bg-sky-500/15 text-sky-300",
  xAI: "bg-neutral-500/15 text-neutral-300",
  Moonshot: "bg-violet-500/15 text-violet-300",
  Alibaba: "bg-indigo-500/15 text-indigo-300",
  DeepSeek: "bg-blue-600/15 text-blue-300",
  Xiaomi: "bg-orange-600/15 text-orange-300",
  MiniMax: "bg-red-500/15 text-red-300",
  Meta: "bg-blue-500/15 text-blue-300",
  Tencent: "bg-cyan-500/15 text-cyan-300",
  ByteDance: "bg-rose-500/15 text-rose-300",
  Vidu: "bg-fuchsia-500/15 text-fuchsia-300",
  Другое: "bg-white/10 text-gray-300",
};

// Цены и метаданные моделей (из биллинга, $/1M токенов)
const MODEL_META = {
  "glm-5.3-flash":   { price_in: 0.135, price_out: 0.473, ctx: "1M",  date: "2025-06" },
  "glm-5.3-flashx":  { price_in: 0.338, price_out: 1.182, ctx: "1M",  date: "2025-06" },
  "glm-5.2":         { price_in: 1.35,  price_out: 4.722, ctx: "1M",  date: "2025-05" },
  "glm-5.3":         { price_in: 1.35,  price_out: 4.722, ctx: "1M",  date: "2025-06" },
  "glm-5.1":         { price_in: 1.35,  price_out: 4.722, ctx: "200K",date: "2025-04" },
  "claude-opus-5-5": { price_in: 3.6,   price_out: 18.0,  ctx: "1M",  date: "2025-09" },
  "claude-opus-5":   { price_in: 4.5,   price_out: 22.5,  ctx: "1M",  date: "2025-08" },
  "claude-sonnet-5": { price_in: 0.9,   price_out: 4.5,   ctx: "1M",  date: "2025-09" },
  "claude-sonnet-4-6": { price_in: 3.0, price_out: 15.0,  ctx: "1M",  date: "2025-05" },
  "claude-haiku-4-5":{ price_in: 0.054, price_out: 0.27,  ctx: "200K",date: "2025-09" },
  "claude-opus-4-8": { price_in: 5.0,   price_out: 25.0,  ctx: "1M",  date: "2025-08" },
  "claude-opus-4-7": { price_in: 5.0,   price_out: 25.0,  ctx: "1M",  date: "2025-07" },
  "claude-opus-4-6": { price_in: 5.0,   price_out: 25.0,  ctx: "1M",  date: "2025-05" },
  "gpt-6.1-sol":     { price_in: 1.8,   price_out: 9.0,   ctx: "1.05M",date: "2025-10" },
  "gpt-6-sol":       { price_in: 1.8,   price_out: 9.0,   ctx: "1.05M",date: "2025-10" },
  "gpt-6-astra":     { price_in: 10.0,  price_out: 50.0,  ctx: "1.05M",date: "2025-11" },
  "gpt-5.6-sol":     { price_in: 5.0,   price_out: 30.0,  ctx: "272K",date: "2025-08" },
  "gpt-5.6-terra":   { price_in: 2.0,   price_out: 12.0,  ctx: "1M",  date: "2025-09" },
  "gemini-3.8-flash":{ price_in: 0.315, price_out: 1.26,  ctx: "1M",  date: "2025-09" },
  "gemini-3.7-flash":{ price_in: 3.0,   price_out: 15.0,  ctx: "1M",  date: "2025-08" },
  "gemini-3.6-flash":{ price_in: 1.5,   price_out: 7.5,   ctx: "1M",  date: "2025-06" },
  "gemini-3.5-flash":{ price_in: 0.15,  price_out: 0.6,   ctx: "1M",  date: "2025-03" },
  "gemini-3.1-pro":  { price_in: 1.25,  price_out: 10.0,  ctx: "1M",  date: "2025-03" },
  "gemini-3-pro":    { price_in: 1.25,  price_out: 10.0,  ctx: "1M",  date: "2025-03" },
  "gemini-2.5-pro":  { price_in: 1.25,  price_out: 10.0,  ctx: "1M",  date: "2025-02" },
  "qwen3.8-max":     { price_in: 0.30,  price_out: 1.20,  ctx: "1M",  date: "2025-09" },
  "qwen3.8-flash":   { price_in: 0.009, price_out: 0.028, ctx: "1M",  date: "2025-09" },
  "qwen3.7-plus":    { price_in: 0.30,  price_out: 1.20,  ctx: "1M",  date: "2025-07" },
  "kimi-k2.6":       { price_in: 0.084, price_out: 0.42,  ctx: "256K",date: "2025-08" },
  "kimi-k2.7-code":  { price_in: 0.095, price_out: 0.4,   ctx: "256K",date: "2025-10" },
  "kimi-k3":         { price_in: 0.09,  price_out: 0.45,  ctx: "1M",  date: "2025-11" },
  "grok-4.7":        { price_in: 0.08,  price_out: 0.24,  ctx: "500K",date: "2025-10" },
  "grok-4.6":        { price_in: 1.44,  price_out: 5.76,  ctx: "500K",date: "2025-06" },
  "grok-4.5":        { price_in: 1.44,  price_out: 5.76,  ctx: "500K",date: "2025-05" },
  "grok-4.3":        { price_in: 1.5,   price_out: 6.0,   ctx: "130K",date: "2025-03" },
  "grok-4.20-0309-reasoning":   { price_in: 1.5, price_out: 6.0, ctx: "130K", date: "2025-03" },
  "grok-4.20-0309-non-reasoning": { price_in: 1.5, price_out: 6.0, ctx: "130K", date: "2025-03" },
  "grok-4.20-multi-agent-0309": { price_in: 1.5, price_out: 6.0, ctx: "130K", date: "2025-03" },
  "grok-build-0.1":  { price_in: 0.6,   price_out: 2.4,   ctx: "130K",date: "2025-04" },
  "mimo-v2.6-flash": { price_in: 0.126, price_out: 0.252, ctx: "1M",  date: "2025-08" },
  "mimo-v2.6-pro":   { price_in: 0.392, price_out: 0.783, ctx: "1M",  date: "2025-08" },
  "mimo-v2.5-pro":   { price_in: 0.392, price_out: 0.783, ctx: "1M",  date: "2025-07" },
  "mimo-v2.5":       { price_in: 0.126, price_out: 0.252, ctx: "1M",  date: "2025-07" },
  "deepseek-flash":  { price_in: 0.165, price_out: 0.66,  ctx: "1M",  date: "2025-08" },
  "deepseek-v4-pro": { price_in: 0.81,  price_out: 2.43,  ctx: "1M",  date: "2025-08" },
  "hy4-preview":     { price_in: 0.32,  price_out: 1.27,  ctx: "256K",date: "2025-09" },
  "hy3":             { price_in: 0.024, price_out: 0.095, ctx: "256K",date: "2025-07" },
  "minimax-m3":      { price_in: 0.06,  price_out: 0.24,  ctx: "1M",  date: "2025-06" },
  "minimax-m2.7":    { price_in: 0.06,  price_out: 0.24,  ctx: "1M",  date: "2025-05" },
  "muse-spark-1.3-contributor": { price_in: 1.5, price_out: 5.1, ctx: "128K", date: "2025-06" },
  // === RelayFast (R) модели ===
  "gpt-6-luna":      { price_in: 0.0024, price_out: 0.012, ctx: "1.05M", date: "2026-10" },
  "gpt-5.6-luna":    { price_in: 0.0048, price_out: 0.029, ctx: "1M",  date: "2025-09" },
  "gpt-5.5":         { price_in: 6.0,    price_out: 36.0,  ctx: "272K",date: "2025-08" },
  "gpt-5.6-sol":     { price_in: 6.0,    price_out: 36.0,  ctx: "272K",date: "2025-08" },
  "claude-haiku-5-5":{ price_in: 0.0043, price_out: 0.0216, ctx: "1M", date: "2026-09" },
  "claude-sonnet-5-5":{ price_in: 2.4,   price_out: 12.0,  ctx: "1M",  date: "2026-10" },
  "claude-fable-5":  { price_in: 12.0,   price_out: 60.0,  ctx: "1M",  date: "2026-10" },
  "claude-fable-5-1":{ price_in: 12.0,   price_out: 60.0,  ctx: "1M",  date: "2026-10" },
  "deepseek-v4-flash-0731": { price_in: 0.036, price_out: 0.144, ctx: "1M", date: "2025-07" },
  "deepseek-v4-flash-vision-exp": { price_in: 0.036, price_out: 0.144, ctx: "1M", date: "2025-09" },
  "deepseek-v4-pro-0813": { price_in: 1.584, price_out: 4.752, ctx: "1M", date: "2025-08" },
  "deepseek-v4.1-flash": { price_in: 0.036, price_out: 0.144, ctx: "1M", date: "2025-09" },
  "deepseek-v4.1-flash-1017": { price_in: 0.036, price_out: 0.144, ctx: "1M", date: "2025-10" },
  "gemini-3.1-pro-preview": { price_in: 2.4, price_out: 14.4, ctx: "1M", date: "2025-11" },
  "gemini-4-argon":  { price_in: 4.8,   price_out: 24.0,  ctx: "1M",  date: "2026-09" },
  "hy4":             { price_in: 0.317, price_out: 1.267, ctx: "256K",date: "2025-10" },
  "minimax-m3.1-flash-preview": { price_in: 0.72, price_out: 2.88, ctx: "1M", date: "2026-09" },
  "muse-spark-1.3":  { price_in: 1.5,   price_out: 5.1,   ctx: "128K",date: "2025-06" },
  "muse-wonder":     { price_in: 4.8,   price_out: 24.0,  ctx: "?",   date: "2026-08" },
  "gemini-nano-banana-2.1": { request: 0.72, type: "image" },
  "gemini-omni-fast": { request: 0.384, type: "video" },
  "gpt-image-2":      { request: 0.6,  type: "image" },
  "gpt-image-2.5":    { request: 0.6,  type: "image" },
  "gpt-image-2.5-flare": { request: 0.6, type: "image" },
  "gpt-image-2.5-flare-2k": { request: 4.5, type: "image" },
  "gpt-image-2.5-flare-4k": { request: 4.5, type: "image" },
  "gpt-image-2.5-sunburst": { request: 0.6, type: "image" },
  "gpt-image-2.5-sunburst-2k": { request: 4.5, type: "image" },
  "gpt-image-2.5-sunburst-4k": { request: 4.5, type: "image" },
  "grok-imagine-image-2.0": { request: 1.44, type: "image" },
  "grok-imagine-video-1.5": { request: 0.108, type: "video" },
  "kling-3.0":        { request: 0.456, type: "video" },
  "minimax-h3-1440p": { request: 0.072, type: "video" },
  "minimax-h3-768p":  { request: 0.048, type: "video" },
  "seedance-2.0-fast":{ request: 0.288, type: "video" },
  "seedance-2.0-mini":{ request: 0.144, type: "video" },
  "seedance-2.5":     { request: 0.528, type: "video" },
  "veo-3.1-lite":     { request: 0.24,  type: "video" },
  "viduq3-turbo":     { request: 0.288, type: "video" },
  "wan-3.0":          { request: 0.288, type: "video" },
};

export default function ModelPickerModal({ open, onClose, models, modelStatuses, current, onPick, usageCounts }) {
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");

  const enriched = useMemo(() => models.map(m => {
    const meta = MODEL_META[m.id] || {};
    const mtype = meta.type || modelType(m.id);
    return {
      ...m,
      type: mtype,
      brand: brandOf(m.id),
      price_in: meta.price_in,
      price_out: meta.price_out,
      request: meta.request,
      ctx: meta.ctx,
      date: meta.date,
      uses: (usageCounts && usageCounts[m.id]) || 0,
    };
  }), [models, usageCounts]);

  const brands = useMemo(() => {
    const set = new Set(enriched.filter(m => type === "all" || m.type === type).map(m => m.brand));
    return ["all", ...[...set].sort()];
  }, [enriched, type]);

  const filtered = useMemo(() => {
    let list = enriched.filter(m => type === "all" || m.type === type);
    if (brand !== "all") list = list.filter(m => m.brand === brand);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    const by = {
      popular: (a, b) => b.uses - a.uses,
      date: (a, b) => (b.date || "").localeCompare(a.date || ""),
      ctx: (a, b) => (parseFloat(b.ctx) || 0) - (parseFloat(a.ctx) || 0),
      price_in: (a, b) => (a.price_in ?? a.request ?? 1e9) - (b.price_in ?? b.request ?? 1e9),
      price_out: (a, b) => (a.price_out ?? a.request ?? 1e9) - (b.price_out ?? b.request ?? 1e9),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort] || by.popular);
  }, [enriched, type, brand, query, sort]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Заголовок */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="font-bold text-white">Выбор модели <span className="text-gray-500 font-normal text-sm">({models.length})</span></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none px-2">✕</button>
        </div>

        {/* Плейсхолдеры типов ИИ */}
        <div className="px-3 pt-3 flex gap-1.5 overflow-x-auto pb-2">
          {MODEL_TYPES.map((t) => {
            const count = t.id === "all" ? models.length : enriched.filter(m => m.type === t.id).length;
            return (
              <button key={t.id} onClick={() => setType(t.id)}
                className={"px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors border " +
                  (type === t.id ? "bg-[#00CC00]/20 border-[#00CC00]/50 text-white" : "border-white/10 text-gray-400 hover:border-white/25")}>
                {t.icon} {t.label} <span className="text-gray-500">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Поиск + сортировка + бренд */}
        <div className="px-3 py-2.5 flex flex-col sm:flex-row gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск модели..."
            className="flex-1 bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00CC00] placeholder:text-gray-600" />
          <select value={brand} onChange={(e) => setBrand(e.target.value)}
            className="bg-[#0d0d14] border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 outline-none max-w-[140px]">
            {brands.map(b => <option key={b} value={b}>{b === "all" ? "Все бренды" : b}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-[#0d0d14] border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 outline-none">
            {SORTS.map(s => <option key={s.id} value={s.id}>↕ {s.label}</option>)}
          </select>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">Ничего не найдено</div>
          )}
          <div className="grid sm:grid-cols-2 gap-1.5">
            {filtered.map((m) => {
              const st = (modelStatuses[m.id] || {}).status || "green";
              const dot = st === "red" ? "🔴" : st === "yellow" ? "🟡" : "🟢";
              const bc = BRAND_COLORS[m.brand] || "bg-white/10 text-gray-300";
              const active = current === m.id;
              const icon = TYPE_ICONS[m.type] || "🧩";
              const price = m.request != null
                ? `$${m.request.toFixed(2)}/вызов`
                : m.price_in != null
                  ? `$${m.price_in < 0.01 ? m.price_in.toFixed(4) : m.price_in.toFixed(3)} · $${m.price_out < 0.01 ? m.price_out.toFixed(4) : m.price_out.toFixed(2)}`
                  : null;
              return (
                <button key={m.id} onClick={() => onPick(m.id)} disabled={m.soon}
                  className={"text-left px-3 py-2.5 rounded-xl border transition-colors " +
                    (active ? "border-[#00CC00]/60 bg-[#00CC00]/10" : "border-white/10 hover:border-white/25 hover:bg-white/5") +
                    (m.soon ? " opacity-50" : "")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{dot}</span>
                    <span className="text-sm text-white font-medium truncate flex-1">{icon} {m.name}{m.soon && <span className="text-gray-500"> — скоро</span>}</span>
                    <span className={"text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap " + bc}>{m.brand}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    {price && <span>{price}</span>}
                    {m.ctx && m.ctx !== "?" && <span>· {m.ctx}</span>}
                    {m.date && <span>· {m.date}</span>}
                    {m.uses > 0 && <span>· 🔥 {m.uses}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
