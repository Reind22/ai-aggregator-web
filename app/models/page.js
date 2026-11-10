"use client";

/**
 * /models — каталог моделей: поиск, фильтры, сортировка, ссылки на карточки.
 * Данные — из нашего каталога (/api/models/list), описания и даты релиза
 * подмешиваются на сервере в /api/models/{id}.
 */
import { useEffect, useMemo, useState } from "react";
import Logo from "../../components/Logo";
import AuthButtons from "../../components/AuthButtons";

const MODALITY_LABEL = { text: "Текст", image: "Изображения", video: "Видео", audio: "Аудио" };
const price = (v) => (v == null ? "—" : `$${Number(v).toFixed(4)}`);
const ctx = (v) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
};

export default function ModelsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ brands: [], modalities: [], providers: [] });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [modality, setModality] = useState("");
  const [vision, setVision] = useState(false);
  const [sort, setSort] = useState("price_asc");

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/models/list"),
          fetch("/api/models/filters"),
        ]);
        if (r1.ok) {
          const d = await r1.json();
          setItems(d.items || d || []);
        }
        if (r2.ok) setFilters(await r2.json());
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const shown = useMemo(() => {
    let list = items.filter((m) => m.enabled !== false);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((m) =>
        (m.id || "").toLowerCase().includes(t) ||
        (m.name || "").toLowerCase().includes(t) ||
        (m.brand || "").toLowerCase().includes(t)
      );
    }
    if (brand) list = list.filter((m) => m.brand === brand);
    if (modality) list = list.filter((m) => m.modality === modality);
    if (vision) list = list.filter((m) => (m.input_per_1m > 0) && /image|vision/i.test(m.id + " " + (m.name || "") + " " + (m.modality || "")));

    const by = {
      price_asc: (a, b) => (a.price_in ?? 9e9) - (b.price_in ?? 9e9),
      price_desc: (a, b) => (b.price_in ?? -1) - (a.price_in ?? -1),
      context: (a, b) => (b.context_length ?? 0) - (a.context_length ?? 0),
      name: (a, b) => (a.name || a.id).localeCompare(b.name || b.id),
    };
    return [...list].sort(by[sort] || by.price_asc);
  }, [items, q, brand, modality, vision, sort]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-extrabold text-white">AI Combiner</span>
          </a>
          <nav className="flex items-center gap-4 text-sm text-gray-400">
            <a href="/models" className="text-white">Модели</a>
            <a href="/pricing" className="hover:text-white">Цены</a>
            <a href="/chat" className="hover:text-white">Чат</a>
            <AuthButtons />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Каталог моделей</h1>
        <p className="mt-1 text-sm text-gray-500">
          {items.length} моделей через один API-ключ. Цены — за 1M токенов.
        </p>

        {/* Фильтры */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию или разработчику…"
            className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-[#00CC00]"
          />
          <select value={brand} onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#00CC00]">
            <option value="">Все разработчики</option>
            {(filters.brands || []).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={modality} onChange={(e) => setModality(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#00CC00]">
            <option value="">Все типы</option>
            {(filters.modalities || []).map((m) => <option key={m} value={m}>{MODALITY_LABEL[m] || m}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#00CC00]">
            <option value="price_asc">Сначала дешёвые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="context">Больше контекста</option>
            <option value="name">По названию</option>
          </select>
          <button
            onClick={() => setVision((v) => !v)}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${vision ? "border-[#00CC00]/60 bg-[#00CC00]/10 text-white" : "border-white/10 text-gray-400 hover:text-white"}`}
          >
            С картинками
          </button>
        </div>

        {/* Таблица */}
        <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08]">
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Модель</th>
                <th className="px-4 py-3 text-left font-medium">Тип</th>
                <th className="px-4 py-3 text-right font-medium">Контекст</th>
                <th className="px-4 py-3 text-right font-medium">Вход</th>
                <th className="px-4 py-3 text-right font-medium">Выход</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Загрузка…</td></tr>
              )}
              {!loading && shown.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <a href={`/models/${encodeURIComponent(m.id)}`} className="block">
                      <span className="font-medium text-white">{m.name || m.id}</span>
                      <span className="ml-2 text-xs text-gray-600">{m.brand}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{MODALITY_LABEL[m.modality] || m.modality}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400">{ctx(m.context_length)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{price(m.price_in)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{price(m.price_out)}</td>
                </tr>
              ))}
              {!loading && !shown.length && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Ничего не найдено</td></tr>
              )}
            </tbody>
          </table>

          {/* Мобильные карточки */}
          <ul className="divide-y divide-white/5 md:hidden">
            {shown.map((m) => (
              <li key={m.id}>
                <a href={`/models/${encodeURIComponent(m.id)}`} className="block px-4 py-3 hover:bg-white/[0.03]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-white">{m.name || m.id}</span>
                    <span className="text-xs text-gray-500">{ctx(m.context_length)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                    <span>{m.brand}</span>
                    <span>{MODALITY_LABEL[m.modality] || m.modality}</span>
                    <span className="tabular-nums">{price(m.price_in)} / {price(m.price_out)}</span>
                  </div>
                </a>
              </li>
            ))}
            {!loading && !shown.length && (
              <li className="px-4 py-10 text-center text-gray-500">Ничего не найдено</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}