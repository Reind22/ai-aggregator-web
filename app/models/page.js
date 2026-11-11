"use client";

/**
 * /models — каталог моделей.
 *
 * Устройство повторяет меню выбора модели в чате: вкладки по типу, поиск,
 * мультивыбор компаний и сортировка кликом по заголовку колонки. Компания в
 * строке — ссылка на её страницу.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";

const TYPES = [
  { id: "all", label: "Все" },
  { id: "text", label: "Текст" },
  { id: "image", label: "Изображения" },
  { id: "video", label: "Видео" },
];

const money = (v) => (v == null || v === 0 ? "—" : `$${Number(v).toFixed(4)}`);
const moneyReq = (m) => {
  const perToken = m.price_in ?? m.input_per_1m;
  const perReq = m.request_price ?? m.price_request;
  if ((!perToken || perToken === 0) && perReq) return `$${Number(perReq).toFixed(2)} / запрос`;
  return money(perToken);
};
const ctxLabel = (v) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
};

function SortArrow({ dir }) {
  return (
    <span className="ml-1 inline-block text-[9px] text-gray-500">
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

export default function ModelsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [brandSel, setBrandSel] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const brandRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/models/list");
        if (res.ok) {
          const d = await res.json();
          setItems(d.items || d || []);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (brandRef.current && !brandRef.current.contains(e.target)) setBrandOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const brands = useMemo(
    () => [...new Set(items.map((m) => m.brand).filter(Boolean))].sort(),
    [items]
  );

  const shown = useMemo(() => {
    let list = items.filter((m) => m.enabled !== false);
    if (type !== "all") list = list.filter((m) => m.modality === type);
    if (brandSel.length) list = list.filter((m) => brandSel.includes(m.brand));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (m) =>
          (m.id || "").toLowerCase().includes(q) ||
          (m.name || "").toLowerCase().includes(q) ||
          (m.brand || "").toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (m) => {
      switch (sortKey) {
        case "context":
          return m.context_length ?? 0;
        case "price_in":
          return m.price_in ?? m.input_per_1m ?? Infinity;
        case "price_out":
          return m.price_out ?? m.output_per_1m ?? Infinity;
        default:
          return (m.name || m.id || "").toLowerCase();
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
  }, [items, type, brandSel, query, sortKey, sortDir]);

  const clickSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "price_in" || key === "price_out" || key === "context" ? "asc" : "asc");
    }
  };

  const toggleBrand = (b) =>
    setBrandSel((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const reset = () => {
    setType("all");
    setQuery("");
    setBrandSel([]);
    setSortKey("name");
    setSortDir("asc");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/models" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Каталог моделей</h1>
            <p className="mt-1 text-sm text-gray-500">
              {items.length} моделей через один API-ключ. Цены — за 1M токенов.
            </p>
          </div>
          <a href="/companies" className="text-xs text-[#00CC00] hover:underline">
            Все компании →
          </a>
        </div>

        {/* Тип модели */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                type === t.id
                  ? "border-[#00CC00]/60 bg-[#00CC00]/10 text-white"
                  : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Поиск, компании, сброс */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или компании…"
            className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-[#00CC00]"
          />

          <div className="relative" ref={brandRef}>
            <button
              onClick={() => setBrandOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-[#00CC00]/50"
            >
              Компании
              {brandSel.length > 0 && (
                <span className="rounded bg-[#00CC00]/20 px-1.5 text-[11px] text-[#00FF00]">
                  {brandSel.length}
                </span>
              )}
              <span className="text-[10px] text-gray-500">▾</span>
            </button>
            {brandOpen && (
              <div className="absolute left-0 top-11 z-30 max-h-72 w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0d0d14] p-2 shadow-2xl">
                {brands.map((b) => (
                  <label
                    key={b}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={brandSel.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="accent-[#00CC00]"
                    />
                    {b}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-500 transition-colors hover:text-white"
          >
            Сбросить
          </button>
        </div>

        {/* Таблица */}
        <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="cursor-pointer px-4 py-3 text-left font-medium hover:text-gray-300"
                    onClick={() => clickSort("name")}>
                  Модель {sortKey === "name" && <SortArrow dir={sortDir} />}
                </th>
                <th className="px-4 py-3 text-left font-medium">Компания</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Тип</th>
                <th className="cursor-pointer px-4 py-3 text-right font-medium hover:text-gray-300"
                    onClick={() => clickSort("context")}>
                  Контекст {sortKey === "context" && <SortArrow dir={sortDir} />}
                </th>
                <th className="cursor-pointer px-4 py-3 text-right font-medium hover:text-gray-300"
                    onClick={() => clickSort("price_in")}>
                  Вход {sortKey === "price_in" && <SortArrow dir={sortDir} />}
                </th>
                <th className="hidden cursor-pointer px-4 py-3 text-right font-medium hover:text-gray-300 sm:table-cell"
                    onClick={() => clickSort("price_out")}>
                  Выход {sortKey === "price_out" && <SortArrow dir={sortDir} />}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Загрузка…</td></tr>
              )}
              {!loading && shown.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <a href={`/models/${encodeURIComponent(m.id)}`} className="font-medium text-white hover:text-[#00FF00]">
                      {m.name || m.id}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {m.brand ? (
                      <a href={`/companies/${encodeURIComponent(m.brand)}`} className="text-xs text-gray-400 hover:text-[#00CC00]">
                        {m.brand}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-500 sm:table-cell">
                    {m.modality === "text" ? "текст" : m.modality === "image" ? "изображения" : m.modality === "video" ? "видео" : m.modality}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400">{ctxLabel(m.context_length)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{moneyReq(m)}</td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-gray-300 sm:table-cell">
                    {money(m.price_out ?? m.output_per_1m)}
                  </td>
                </tr>
              ))}
              {!loading && !shown.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Ничего не найдено</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-gray-600">
          Показано {shown.length} из {items.length}. Клик по заголовку колонки меняет сортировку.
        </p>
      </main>
    </div>
  );
}