"use client";

/**
 * Вкладка «Финансы»: баланс, KPI, расход по моделям (круговая) и по дням (столбики ↔ линия).
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { BarChart, PieChart, LineChart } from "./Charts";

const fmt$ = (usd) => `$${Number(usd).toFixed(5)}`;
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
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setMode("bar")}
                className={`px-2 py-1 rounded ${mode === "bar" ? "bg-white/10 text-white" : "text-gray-500"}`}
                title="Столбики"
              >
                ▮▮▮
              </button>
              <button
                onClick={() => setMode("line")}
                className={`px-2 py-1 rounded ${mode === "line" ? "bg-white/10 text-white" : "text-gray-500"}`}
                title="Линия"
              >
                ⌁
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
