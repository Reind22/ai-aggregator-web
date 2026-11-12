"use client";

/**
 * Вкладка «Логи»: запросы веб-чата и вызовы API в одном списке.
 *
 * Видно источник, канал (кто ответил), статус, ошибку, задержку и метку
 * запроса. Метка нужна поддержке: по ней находится конкретный вызов.
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const money = (usd) => `$${Number(usd ?? 0).toFixed(5)}`;
const dt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      })
    : "—";

const SOURCES = [
  ["all", "Все"],
  ["chat", "Чат"],
  ["api", "API"],
];

export default function LogsPanel({ onNotify }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const load = async (p, src) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/dashboard/logs?page=${p}&per_page=20&source=${src}`);
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs || []);
        setTotal(d.total || 0);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(page, source); }, [page, source]);

  const pages = Math.max(1, Math.ceil(total / 20));

  const copyTag = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {
      onNotify?.("Не удалось скопировать");
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Логи запросов</h2>
          <p className="text-xs text-gray-500">
            Всего: {total}. Метку запроса можно прислать в поддержку — по ней найдётся вызов.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {SOURCES.map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setSource(id); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                source === id ? "bg-[#00CC00]/20 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Загрузка…</p>
      ) : logs.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500">Запросов пока нет</p>
          <p className="mt-1 text-[11px] text-gray-600">
            Здесь появятся и сообщения в чате, и вызовы API по ключам
          </p>
        </div>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-2 py-2 font-medium">Дата</th>
                <th className="px-2 py-2 font-medium">Откуда</th>
                <th className="px-2 py-2 font-medium">Модель</th>
                <th className="hidden px-2 py-2 font-medium sm:table-cell">Канал</th>
                <th className="px-2 py-2 text-right font-medium">Вход</th>
                <th className="px-2 py-2 text-right font-medium">Выход</th>
                <th className="px-2 py-2 text-right font-medium">Стоимость</th>
                <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">мс</th>
                <th className="px-2 py-2 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="whitespace-nowrap px-2 py-2 text-gray-400">{dt(l.created_at)}</td>
                  <td className="px-2 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                      l.source === "api"
                        ? "bg-[#00A3FF]/15 text-[#7cc7ff]"
                        : "bg-[#00CC00]/15 text-[#7ff07f]"
                    }`}>
                      {l.source === "api" ? "API" : "чат"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-gray-300">{l.model}</td>
                  <td className="hidden px-2 py-2 text-[11px] text-gray-500 sm:table-cell">
                    {l.provider || "—"}
                  </td>
                  <td className="px-2 py-2 text-right text-gray-300">
                    {(l.input_tokens || 0).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-2 py-2 text-right text-gray-300">
                    {(l.output_tokens || 0).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-2 py-2 text-right text-[#00CC00]">{money(l.cost_usd)}</td>
                  <td className="hidden px-2 py-2 text-right tabular-nums text-gray-500 sm:table-cell">
                    {l.latency_ms ?? "—"}
                  </td>
                  <td className="px-2 py-2">
                    {l.status === "ok" ? (
                      <span className="text-[11px] text-gray-500">ок</span>
                    ) : (
                      <span className="text-[11px] text-red-400" title={l.error_code || ""}>
                        {l.error_code || l.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Последняя метка запроса — чтобы быстро скопировать в поддержку */}
      {logs[0]?.request_tag && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span>Метка последнего запроса:</span>
          <button
            onClick={() => copyTag(logs[0].request_tag)}
            className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-gray-300 hover:border-[#00CC00]/50"
          >
            {copied === logs[0].request_tag ? "скопировано" : logs[0].request_tag}
          </button>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:border-[#00CC00]/50 disabled:opacity-30"
          >
            ← Назад
          </button>
          <span className="text-gray-400">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:border-[#00CC00]/50 disabled:opacity-30"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}