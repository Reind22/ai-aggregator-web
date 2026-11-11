"use client";

/**
 * Вкладка «Финансы»: баланс, KPI, расход по моделям (круговая) и по дням (столбики ↔ линия).
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { BarChart, PieChart, LineChart } from "./Charts";

const fmt$ = (usd) => `$${Number(usd ?? 0).toFixed(5)}`;
const fmt2$ = (usd) => `$${Number(usd).toFixed(2)}`;

export default function FinancePanel({ profile }) {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState("bar"); // bar | line

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/dashboard/finance?days=${days}`);
        if (res.ok) setData(await res.json());
      } catch (e) {}
    })();
  }, [days]);

  if (!data) return <p className="text-gray-500 text-sm py-8 text-center">Загрузка…</p>;

  const models = [...data.by_model].sort((a, b) => b.cost_usd - a.cost_usd);
  const byDay = data.by_day;
  const tokensTotal = data.total_input_tokens + data.total_output_tokens;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Финансы</h2>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Баланс</div>
          <div className="text-xl font-bold text-[#00FF00]">{fmt2$(data.balance_usd)}</div>
          <div className="text-[10px] text-gray-500">тариф {data.tier}</div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Расход за {days} дн.</div>
          <div className="text-xl font-bold">{fmt$(data.total_cost_usd)}</div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Токены за {days} дн.</div>
          <div className="text-xl font-bold">{tokensTotal.toLocaleString("ru-RU")}</div>
          <div className="text-[10px] text-gray-500">
            вход {data.total_input_tokens.toLocaleString("ru-RU")} / выход {data.total_output_tokens.toLocaleString("ru-RU")}
          </div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Средний запрос</div>
          <div className="text-xl font-bold">
            {fmt$(byDay.length ? Math.round(data.total_cost_usd / Math.max(1, byDay.reduce((s, d) => s + (d.input_tokens + d.output_tokens > 0 ? 1 : 0), 0))) : 0)}
          </div>
        </div>
      </div>

      {/* Период */}
      <div className="flex gap-2 mb-4">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              days === d ? "border-[#00CC00] text-[#00FF00]" : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            {d} дней
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Расход по моделям — круговая */}
        <div className="border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Расход по моделям</h3>
          <PieChart data={models} valueKey="cost_usd" nameKey="model" />
        </div>

        {/* Расход по дням — столбики/линия */}
        <div className="border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Расход по дням</h3>
            <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setMode("bar")}
                title="Столбцы"
                aria-label="Показать столбцами"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors ${mode === "bar" ? "bg-[#00CC00]/20 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
                Столбцы
              </button>
              <button
                onClick={() => setMode("line")}
                title="Линия"
                aria-label="Показать линией"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-colors ${mode === "line" ? "bg-[#00CC00]/20 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 3 8-8" />
                </svg>
                Линия
              </button>
            </div>
          </div>
          {mode === "bar" ? (
            <BarChart data={byDay} valueKey="cost_usd" label="$ в день" />
          ) : (
            <LineChart data={byDay} valueKey="cost_usd" label="$ в день" />
          )}
        </div>
      </div>

      {/* Токены по дням */}
      {byDay.length > 0 && (
        <div className="border border-white/10 rounded-xl p-4 mt-6">
          <h3 className="text-sm font-medium mb-3">Токены по дням (вход)</h3>
          <BarChart data={byDay} valueKey="input_tokens" label="токенов вход/день" format={(v) => v.toLocaleString("ru-RU")} />
        </div>
      )}
    </div>
  );
}
