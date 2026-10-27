"use client";

/**
 * ModelPickerModal v2 — модальное окно выбора моделей в стиле таблицы (GameStore-референс).
 * Требования юзера (26.10):
 *  - фиксированная высота (не на весь экран), таблица с одной моделью в строке
 *  - чипы-фильтры по типам не сжимаются (flex-shrink-0, фикс. высота)
 *  - LED-индикаторы статуса — SVG со свечением, не эмодзи
 *  - все иконки — SVG, не эмодзи
 *  - кастомные дропдауны (бренд/сортировка) — часть сайта, не системные <select>
 *  - колонки таблицы: Название | Вход | Выход | Кэш | Контекст | Дата | Бренд — клик по заголовку сортирует asc/desc
 *  - Gemini 3.5/3.6/3.7... классифицированы как text (не "other")
 *  - мультивыбор брендов
 */

import { useState, useMemo, useRef, useEffect } from "react";

const MODEL_TYPES = [
  { id: "all",   label: "Все",         icon: "grid" },
  { id: "text",  label: "Текстовые",   icon: "text" },
  { id: "image", label: "Изображения", icon: "image" },
  { id: "audio", label: "Аудио",       icon: "audio" },
  { id: "video", label: "Видео",       icon: "video" },
  { id: "other", label: "Прочее",      icon: "other" },
];

const TYPE_ICONS = {
  text: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3.5h10M8 3.5v9M5.5 12.5h5" strokeLinecap="round"/>
    </svg>
  ),
  image: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5"/>
      <circle cx="5.7" cy="6" r="1.2"/>
      <path d="M2.5 11l3-3 2.5 2.5 2-2 3.5 3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="2" width="4" height="7.5" rx="2"/>
      <path d="M3.5 8a4.5 4.5 0 009 0M8 12.5v1.8" strokeLinecap="round"/>
    </svg>
  ),
  video: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="3.5" width="9" height="9" rx="1.5"/>
      <path d="M10.5 7l4-2.5v7l-4-2.5z" strokeLinejoin="round"/>
    </svg>
  ),
  other: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <circle cx="3.5" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="12.5" cy="8" r="1.4"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
    </svg>
  ),
};

// SVG LED-индикатор со свечением
function Led({ status }) {
  const colors = {
    green:  { core: "#4ade80", glow: "rgba(74,222,128,.55)" },
    yellow: { core: "#facc15", glow: "rgba(250,204,21,.55)" },
    red:    { core: "#f87171", glow: "rgba(248,113,113,.6)" },
  };
  const c = colors[status] || colors.green;
  return (
    <span className="relative inline-flex w-2.5 h-2.5 shrink-0" title={status}>
      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
        <circle cx="5" cy="5" r="4.5" fill={c.glow} opacity="0.35"/>
        <circle cx="5" cy="5" r="2.6" fill={c.core}/>
        <circle cx="4" cy="4" r="0.9" fill="white" opacity="0.85"/>
      </svg>
    </span>
  );
}

// Стрелка сортировки в заголовке колонки
function SortArrow({ dir }) {
  return (
    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 inline-block ml-0.5 opacity-90">
      {dir === "asc"
        ? <path d="M5 1.5l3.5 5h-7z" fill="currentColor"/>
        : <path d="M5 8.5l-3.5-5h7z" fill="currentColor"/>}
    </svg>
  );
}

const BRAND_COLORS = {
  OpenAI: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  Anthropic: "text-orange-300 bg-orange-500/10 border-orange-500/25",
  Google: "text-blue-300 bg-blue-500/10 border-blue-500/25",
  Zhipu: "text-sky-300 bg-sky-500/10 border-sky-500/25",
  xAI: "text-neutral-300 bg-neutral-500/10 border-neutral-500/25",
  Moonshot: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  Alibaba: "text-indigo-300 bg-indigo-500/10 border-indigo-500/25",
  DeepSeek: "text-blue-300 bg-blue-600/10 border-blue-600/25",
  Xiaomi: "text-orange-300 bg-orange-600/10 border-orange-600/25",
  MiniMax: "text-red-300 bg-red-500/10 border-red-500/25",
  Meta: "text-blue-300 bg-blue-500/10 border-blue-500/25",
  Tencent: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
  ByteDance: "text-rose-300 bg-rose-500/10 border-rose-500/25",
  Vidu: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25",
  Другое: "text-gray-300 bg-white/5 border-white/15",
};

export function modelType(mid) {
  const m = (mid || "").toLowerCase();
  if (/(video|kling|veo|viduq|wan-|seedance|minimax-h3)/.test(m)) return "video";
  if (/(gpt-image|imagine-image|nano-banana|flash-image|image-2|image-2\.5|image-preview)/.test(m)) return "image";
  if (/(tts|audio|voice|speech|whisper|chirp)/.test(m)) return "audio";
  if (/(text|flash|sol|luna|astra|terra|haiku|sonnet|opus|fable|glm|mimo|deepseek|qwen|kimi|grok-4|grok-build|minimax-m|muse|hy\d|hy4|gemini)/.test(m)) return "text";
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

// Метаданные: цены $/1M (или request), контекст (число млн для сортировки), дата релиза
const MODEL_META = {
  "glm-5.3-flash":   { pi: 0.135, po: 0.473, ctx: 1,    date: "2025-06" },
  "glm-5.3-flashx":  { pi: 0.338, po: 1.182, ctx: 1,    date: "2025-06" },
  "glm-5.2":         { pi: 1.35,  po: 4.722, ctx: 1,    date: "2025-05" },
  "glm-5.3":         { pi: 1.35,  po: 4.722, ctx: 1,    date: "2025-06" },
  "glm-5.1":         { pi: 1.35,  po: 4.722, ctx: 0.2,  date: "2025-04" },
  "claude-opus-5-5": { pi: 3.6,   po: 18.0,  ctx: 1,    date: "2025-09" },
  "claude-opus-5":   { pi: 4.5,   po: 22.5,  ctx: 1,    date: "2025-08" },
  "claude-sonnet-5": { pi: 0.9,   po: 4.5,   ctx: 1,    date: "2025-09" },
  "claude-sonnet-4-6": { pi: 3.0, po: 15.0,  ctx: 1,    date: "2025-05" },
  "claude-haiku-4-5":{ pi: 0.054, po: 0.27,  ctx: 0.2,  date: "2025-09" },
  "claude-opus-4-8": { pi: 5.0,   po: 25.0,  ctx: 1,    date: "2025-08" },
  "claude-opus-4-7": { pi: 5.0,   po: 25.0,  ctx: 1,    date: "2025-07" },
  "claude-opus-4-6": { pi: 5.0,   po: 25.0,  ctx: 1,    date: "2025-05" },
  "gpt-6.1-sol":     { pi: 1.8,   po: 9.0,   ctx: 1.05, date: "2025-10" },
  "gpt-6-sol":       { pi: 1.8,   po: 9.0,   ctx: 1.05, date: "2025-10" },
  "gpt-6-astra":     { pi: 10.0,  po: 50.0,  ctx: 1.05, date: "2025-11" },
  "gpt-5.6-sol":     { pi: 5.0,   po: 30.0,  ctx: 0.272,date: "2025-08" },
  "gpt-5.6-terra":   { pi: 2.0,   po: 12.0,  ctx: 1,    date: "2025-09" },
  "gemini-3.8-flash":{ pi: 0.315, po: 1.26,  ctx: 1,    date: "2025-09" },
  "gemini-3.7-flash":{ pi: 3.0,   po: 15.0,  ctx: 1,    date: "2025-08" },
  "gemini-3.6-flash":{ pi: 1.5,   po: 7.5,   ctx: 1,    date: "2025-06" },
  "gemini-3.5-flash":{ pi: 0.15,  po: 0.6,   ctx: 1,    date: "2025-03" },
  "gemini-3.1-pro":  { pi: 1.25,  po: 10.0,  ctx: 1,    date: "2025-03" },
  "gemini-3-pro":    { pi: 1.25,  po: 10.0,  ctx: 1,    date: "2025-03" },
  "gemini-2.5-pro":  { pi: 1.25,  po: 10.0,  ctx: 1,    date: "2025-02" },
  "qwen3.8-max":     { pi: 0.30,  po: 1.20,  ctx: 1,    date: "2025-09" },
  "qwen3.8-flash":   { pi: 0.009, po: 0.028, ctx: 1,    date: "2025-09" },
  "qwen3.7-plus":    { pi: 0.30,  po: 1.20,  ctx: 1,    date: "2025-07" },
  "kimi-k2.6":       { pi: 0.084, po: 0.42,  ctx: 0.256,date: "2025-08" },
  "kimi-k2.7-code":  { pi: 0.095, po: 0.4,   ctx: 0.256,date: "2025-10" },
  "kimi-k3":         { pi: 0.09,  po: 0.45,  ctx: 1,    date: "2025-11" },
  "grok-4.7":        { pi: 0.08,  po: 0.24,  ctx: 0.5,  date: "2025-10" },
  "grok-4.6":        { pi: 1.44,  po: 5.76,  ctx: 0.5,  date: "2025-06" },
  "grok-4.5":        { pi: 1.44,  po: 5.76,  ctx: 0.5,  date: "2025-05" },
  "grok-4.3":        { pi: 1.5,   po: 6.0,   ctx: 0.13, date: "2025-03" },
  "grok-4.20-0309-reasoning": { pi: 1.5, po: 6.0, ctx: 0.13, date: "2025-03" },
  "grok-4.20-0309-non-reasoning": { pi: 1.5, po: 6.0, ctx: 0.13, date: "2025-03" },
  "grok-4.20-multi-agent-0309": { pi: 1.5, po: 6.0, ctx: 0.13, date: "2025-03" },
  "grok-build-0.1":  { pi: 0.6,   po: 2.4,   ctx: 0.13, date: "2025-04" },
  "mimo-v2.6-flash": { pi: 0.126, po: 0.252, ctx: 1,    date: "2025-08" },
  "mimo-v2.6-pro":   { pi: 0.392, po: 0.783, ctx: 1,    date: "2025-08" },
  "mimo-v2.5-pro":   { pi: 0.392, po: 0.783, ctx: 1,    date: "2025-07" },
  "mimo-v2.5":       { pi: 0.126, po: 0.252, ctx: 1,    date: "2025-07" },
  "deepseek-flash":  { pi: 0.165, po: 0.66,  ctx: 1,    date: "2025-08" },
  "deepseek-v4-pro": { pi: 0.81,  po: 2.43,  ctx: 1,    date: "2025-08" },
  "hy4-preview":     { pi: 0.32,  po: 1.27,  ctx: 0.256,date: "2025-09" },
  "hy3":             { pi: 0.024, po: 0.095, ctx: 0.256,date: "2025-07" },
  "minimax-m3":      { pi: 0.06,  po: 0.24,  ctx: 1,    date: "2025-06" },
  "minimax-m2.7":    { pi: 0.06,  po: 0.24,  ctx: 1,    date: "2025-05" },
  "muse-spark-1.3-contributor": { pi: 1.5, po: 5.1, ctx: 0.128, date: "2025-06" },
  // RelayFast (R)
  "gpt-6-luna":      { pi: 0.0024, po: 0.012, ctx: 1.05, date: "2026-10" },
  "gpt-5.6-luna":    { pi: 0.0048, po: 0.029, ctx: 1,    date: "2025-09" },
  "gpt-5.5":         { pi: 6.0,   po: 36.0,  ctx: 0.272,date: "2025-08" },
  "claude-haiku-5-5":{ pi: 0.0043, po: 0.0216, ctx: 1,   date: "2026-09" },
  "claude-sonnet-5-5": { pi: 2.4, po: 12.0,  ctx: 1,    date: "2026-10" },
  "claude-fable-5":  { pi: 12.0,  po: 60.0,  ctx: 1,    date: "2026-10" },
  "claude-fable-5-1":{ pi: 12.0,  po: 60.0,  ctx: 1,    date: "2026-10" },
  "deepseek-v4-flash-0731": { pi: 0.036, po: 0.144, ctx: 1, date: "2025-07" },
  "deepseek-v4-flash-vision-exp": { pi: 0.036, po: 0.144, ctx: 1, date: "2025-09" },
  "deepseek-v4-pro-0813": { pi: 1.584, po: 4.752, ctx: 1, date: "2025-08" },
  "deepseek-v4.1-flash": { pi: 0.036, po: 0.144, ctx: 1, date: "2025-09" },
  "deepseek-v4.1-flash-1017": { pi: 0.036, po: 0.144, ctx: 1, date: "2025-10" },
  "gemini-3.1-pro-preview": { pi: 2.4, po: 14.4, ctx: 1, date: "2025-11" },
  "gemini-4-argon":  { pi: 4.8,   po: 24.0,  ctx: 1,    date: "2026-09" },
  "hy4":             { pi: 0.317, po: 1.267, ctx: 0.256,date: "2025-10" },
  "minimax-m3.1-flash-preview": { pi: 0.72, po: 2.88, ctx: 1, date: "2026-09" },
  "muse-spark-1.3":  { pi: 1.5,   po: 5.1,   ctx: 0.128,date: "2025-06" },
  "muse-wonder":     { pi: 4.8,   po: 24.0,  ctx: 0.128,date: "2026-08" },
  "kimi-k3.1-pro":   { pi: 0.133, po: 0.667, ctx: 1,    date: "2026-10" },
  // per-request (image/video/audio)
  "gemini-nano-banana-2.1": { req: 0.72, type: "image" },
  "gemini-omni-fast":       { req: 0.384, type: "video" },
  "gpt-image-2":            { req: 0.6, type: "image" },
  "gpt-image-2.5":          { req: 0.6, type: "image" },
  "gpt-image-2.5-flare":    { req: 0.6, type: "image" },
  "gpt-image-2.5-flare-2k": { req: 4.5, type: "image" },
  "gpt-image-2.5-flare-4k": { req: 4.5, type: "image" },
  "gpt-image-2.5-sunburst": { req: 0.6, type: "image" },
  "gpt-image-2.5-sunburst-2k": { req: 4.5, type: "image" },
  "gpt-image-2.5-sunburst-4k": { req: 4.5, type: "image" },
  "grok-imagine-image-2.0": { req: 1.44, type: "image" },
  "grok-imagine-video-1.5": { req: 0.108, type: "video" },
  "kling-3.0":              { req: 0.456, type: "video" },
  "minimax-h3-1440p":       { req: 0.072, type: "video" },
  "minimax-h3-768p":        { req: 0.048, type: "video" },
  "seedance-2.0-fast":      { req: 0.288, type: "video" },
  "seedance-2.0-mini":      { req: 0.144, type: "video" },
  "seedance-2.5":           { req: 0.528, type: "video" },
  "veo-3.1-lite":           { req: 0.24, type: "video" },
  "viduq3-turbo":           { req: 0.288, type: "video" },
  "wan-3.0":                { req: 0.288, type: "video" },
};

export default function ModelPickerModal({ open, onClose, models, modelStatuses, current, onPick, usageCounts }) {
  const [type, setType] = useState("all");
  const [sortKey, setSortKey] = useState("uses");      // колонка сортировки
  const [sortDir, setSortDir] = useState("desc");      // asc | desc
  const [query, setQuery] = useState("");
  const [brandSel, setBrandSel] = useState([]);        // мультивыбор брендов
  const [brandOpen, setBrandOpen] = useState(false);
  const brandRef = useRef(null);

  // Закрытие дропдауна брендов по клику вне
  useEffect(() => {
    if (!brandOpen) return;
    const h = (e) => { if (brandRef.current && !brandRef.current.contains(e.target)) setBrandOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [brandOpen]);

  const enriched = useMemo(() => models.map(m => {
    const meta = MODEL_META[m.id] || {};
    return {
      ...m,
      type: meta.type || modelType(m.id),
      brand: brandOf(m.id),
      pi: meta.pi, po: meta.po, req: meta.req,
      ctx: meta.ctx, date: meta.date,
      uses: (usageCounts && usageCounts[m.id]) || 0,
    };
  }), [models, usageCounts]);

  const brands = useMemo(() => {
    const set = new Set(enriched.filter(m => type === "all" || m.type === type).map(m => m.brand));
    return [...set].sort();
  }, [enriched, type]);

  const typeCounts = useMemo(() => {
    const c = { all: models.length };
    for (const m of enriched) c[m.type] = (c[m.type] || 0) + 1;
    return c;
  }, [enriched, models.length]);

  const filtered = useMemo(() => {
    let list = enriched.filter(m => type === "all" || m.type === type);
    if (brandSel.length) list = list.filter(m => brandSel.includes(m.brand));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (m) => {
      switch (sortKey) {
        case "name": return m.name.toLowerCase();
        case "date": return m.date || "";
        case "ctx": return m.ctx ?? -1;
        case "in": return m.pi ?? m.req ?? Infinity;
        case "out": return m.po ?? m.req ?? Infinity;
        case "uses": return m.uses ?? 0;
        default: return m.uses ?? 0;
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
  }, [enriched, type, brandSel, query, sortKey, sortDir]);

  const clickHeader = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "name" || key === "date" ? "asc" : "desc"); }
  };

  const toggleBrand = (b) => {
    setBrandSel(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const fmtPrice = (m) => {
    if (m.req != null) return `$${m.req < 1 ? m.req.toFixed(2) : m.req.toFixed(2)}/вызов`;
    if (m.pi != null) {
      const f = (v) => v < 0.01 ? v.toFixed(4) : v < 1 ? v.toFixed(3) : v.toFixed(2);
      return `$${f(m.pi)} / $${f(m.po)}`;
    }
    return "—";
  };
  const fmtCtx = (ctx) => ctx == null ? "—" : ctx >= 1 ? `${ctx}M` : `${Math.round(ctx * 1000)}K`;

  if (!open) return null;

  const H = ({ k, label, className }) => (
    <th onClick={() => clickHeader(k)}
      className={"px-2 py-2 text-[11px] font-medium text-gray-400 select-none cursor-pointer hover:text-white whitespace-nowrap " + (className || "")}>
      {label}
      {sortKey === k && <SortArrow dir={sortDir}/>}
    </th>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl h-[560px] max-h-[88vh] flex flex-col bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Заголовок + чипы типов */}
        <div className="px-4 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <div className="font-bold text-white">Выбор модели <span className="text-gray-500 font-normal text-sm">({models.length})</span></div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none px-2">✕</button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {MODEL_TYPES.map((t) => {
              const active = type === t.id;
              const count = typeCounts[t.id] || 0;
              return (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={"flex-shrink-0 h-8 px-3 rounded-lg text-xs whitespace-nowrap transition-colors border flex items-center gap-1.5 " +
                    (active ? "bg-[#00CC00]/15 border-[#00CC00]/50 text-white" : "border-white/10 text-gray-400 hover:border-white/25")}>
                  <span className="text-gray-400">{TYPE_ICONS[t.icon]}</span>
                  {t.label}
                  <span className="text-gray-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Поиск + бренд-мультивыбор */}
        <div className="px-4 py-2.5 flex gap-2 border-b border-white/10">
          <div className="relative flex-1">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск модели..."
              className="w-full bg-[#0d0d14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00CC00] placeholder:text-gray-600" />
          </div>

          {/* Кастомный мультивыбор брендов */}
          <div className="relative" ref={brandRef}>
            <button onClick={() => setBrandOpen(o => !o)}
              className="h-full min-w-[150px] bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#00CC00] flex items-center justify-between gap-2 hover:border-white/25 transition-colors">
              <span className="truncate">
                {brandSel.length === 0 ? "Все бренды"
                 : brandSel.length === 1 ? brandSel[0]
                 : `Бренды: ${brandSel.length}`}
              </span>
              <svg viewBox="0 0 10 6" className={"w-2.5 h-2.5 text-gray-500 transition-transform " + (brandOpen ? "rotate-180" : "")} fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l4 4 4-4" strokeLinecap="round"/>
              </svg>
            </button>
            {brandOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 max-h-72 overflow-y-auto bg-[#16161f] border border-white/15 rounded-xl shadow-2xl z-10 py-1">
                <button onClick={() => setBrandSel([])}
                  className={"w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 " + (brandSel.length === 0 ? "text-[#00CC00]" : "text-gray-300")}>
                  Все бренды
                </button>
                {brands.map(b => (
                  <button key={b} onClick={() => toggleBrand(b)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 flex items-center gap-2">
                    <span className={"w-3.5 h-3.5 rounded border flex items-center justify-center " +
                      (brandSel.includes(b) ? "bg-[#00CC00] border-[#00CC00]" : "border-white/25")}>
                      {brandSel.includes(b) && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="text-gray-300">{b}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ТАБЛИЦА (одна модель в строке) */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-[#12121a] z-10 border-b border-white/10">
              <tr>
                <H k="name" label="Модель" className="text-left pl-4"/>
                <H k="in" label="Вход $/1M" className="text-right"/>
                <H k="out" label="Выход $/1M" className="text-right"/>
                <th className="px-2 py-2 text-[11px] font-medium text-gray-400 text-right">Кэш $/1M</th>
                <H k="ctx" label="Контекст" className="text-right"/>
                <H k="date" label="Релиз" className="text-right"/>
                <th className="px-2 py-2 text-[11px] font-medium text-gray-400 text-right pr-4">Бренд</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">Ничего не найдено</td></tr>
              )}
              {filtered.map((m) => {
                const st = (modelStatuses[m.id] || {}).status || "green";
                const active = current === m.id;
                const bc = BRAND_COLORS[m.brand] || BRAND_COLORS["Другое"];
                return (
                  <tr key={m.id} onClick={() => !m.soon && onPick(m.id)}
                    className={"cursor-pointer border-b border-white/5 transition-colors " +
                      (active ? "bg-[#00CC00]/10" : "hover:bg-white/5") + (m.soon ? " opacity-40" : "")}>
                    <td className="px-2 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <Led status={st}/>
                        <span className="text-gray-100 font-medium truncate max-w-[220px]">{m.name}{m.soon && <span className="text-gray-500 font-normal"> — скоро</span>}</span>
                        {m.req != null && <span className="text-[10px] text-gray-500">per-call</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right text-gray-300 whitespace-nowrap">
                      {m.pi != null ? `$${m.pi < 0.01 ? m.pi.toFixed(4) : m.pi < 1 ? m.pi.toFixed(3) : m.pi.toFixed(2)}` : m.req != null ? `$${m.req.toFixed(2)}/выз.` : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-300 whitespace-nowrap">
                      {m.po != null ? `$${m.po < 0.01 ? m.po.toFixed(4) : m.po < 1 ? m.po.toFixed(3) : m.po.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-400 whitespace-nowrap">
                      {m.pi != null && m.req == null ? `$${((m.pi) * 0.25).toFixed(4)}` : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-400 whitespace-nowrap">{m.ctx != null ? fmtCtx(m.ctx) : "—"}</td>
                    <td className="px-2 py-2 text-right text-gray-400 whitespace-nowrap">{m.date || "—"}</td>
                    <td className="px-2 pr-4 py-2 text-right">
                      <span className={"text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap " + bc}>{m.brand}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Футер */}
        <div className="px-4 py-2 border-t border-white/10 text-[11px] text-gray-500 flex items-center justify-between">
          <span>Найдено: {filtered.length}</span>
          <span>Цены за 1M токенов · клик по колонке — сортировка</span>
        </div>
      </div>
    </div>
  );
}
