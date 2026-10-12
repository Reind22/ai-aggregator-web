"use client";

/**
 * Вкладка «Логи»: таблица запросов (токены вход/выход/кэш, стоимость) + пагинация.
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const fmt$ = (cents) => `$${(cents / 100).toFixed(4)}`;
const fmtDate = (iso) => new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function LogsPanel({ onNotify }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/dashboard/logs?page=${p}&per_page=20`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Логи запросов</h2>
      <p className="text-xs text-gray-500 mb-4">Всего запросов: {total}</p>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Загрузка…</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Пока нет запросов</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-white/10">
                <th className="py-2 px-2 font-medium">Дата</th>
                <th className="py-2 px-2 font-medium">Модель</th>
                <th className="py-2 px-2 font-medium text-right">Вход</th>
                <th className="py-2 px-2 font-medium text-right">Выход</th>
                <th className="py-2 px-2 font-medium text-right">Кэш</th>
                <th className="py-2 px-2 font-medium text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 text-gray-400 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  <td className="py-2 px-2 text-gray-300">{l.model}</td>
                  <td className="py-2 px-2 text-right text-gray-300">{l.input_tokens.toLocaleString("ru-RU")}</td>
                  <td className="py-2 px-2 text-right text-gray-300">{l.output_tokens.toLocaleString("ru-RU")}</td>
                  <td className="py-2 px-2 text-right text-gray-500">{l.cached_tokens ? l.cached_tokens.toLocaleString("ru-RU") : "—"}</td>
                  <td className="py-2 px-2 text-right text-[#00CC00]">{fmt$(l.cost_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30 hover:border-[#00CC00]/50 transition-colors"
          >
            ← Назад
          </button>
          <span className="text-gray-400">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30 hover:border-[#00CC00]/50 transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
