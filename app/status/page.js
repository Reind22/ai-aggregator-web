"use client";

/**
 * /status — публичная статистика моделей: доступность, скорость и цены за сутки.
 */
import { useCallback, useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { apiFetch } from "../../lib/api";

const money = (v) => {
  if (v === null || v === undefined) return "—";
  if (v === 0) return "$0";
  if (v < 0.001) return `$${v.toFixed(5)}`;
  return `$${Number(v).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`;
};

const ms = (v) => (v === null || v === undefined ? "—" : `${Math.round(v)} мс`);
const pct = (v) => (v === null || v === undefined ? "—" : `${(v * 100).toFixed(1)}%`);
const time = (iso) =>
  iso
    ? new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";

function hourColor(h) {
  if (!h || h.total === 0) return "bg-white/[0.04]";
  const rate = h.ok / h.total;
  if (rate >= 0.98) return "bg-[#00FF00]";
  if (rate >= 0.9) return "bg-amber-300";
  return "bg-red-400";
}

function health(value) {
  if (value === null || value === undefined) return { dot: "bg-gray-600", text: "text-gray-500", label: "нет данных" };
  if (value >= 0.98) return { dot: "bg-[#00FF00]", text: "text-[#00FF00]", label: "работает" };
  if (value >= 0.9) return { dot: "bg-amber-300", text: "text-amber-300", label: "сбои" };
  return { dot: "bg-red-400", text: "text-red-400", label: "проблемы" };
}

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/status/models");
      if (!r.ok) {
        setError("Не удалось загрузить статистику");
        return;
      }
      setData(await r.json());
      setError(null);
    } catch (e) {
      setError("Сеть недоступна");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  const models = (data?.models || []).filter((m) => {
    const q = query.trim().toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });

  const summary = data?.summary || {};
  const usage = data?.usage_by_hour || [];
  const maxUsage = Math.max(1, ...usage.map((u) => u.total));
  const hours = data?.window_hours ?? 24;
  const windowLabel = hours <= 24 ? "за сутки" : hours <= 48 ? "за двое суток" : "за неделю";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/status" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Статус моделей</h1>
        <p className="mt-1 text-sm text-gray-500">
          Доступность, скорость и цены {windowLabel}. Если за сутки запросов не было, показываем данные за неделю.
          Обновляется автоматически раз в минуту.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Моделей в каталоге</div>
            <div className="mt-1 text-2xl font-semibold text-white">{summary.models_total ?? "—"}</div>
            <div className="text-[11px] text-gray-600">под нагрузкой: {summary.models_with_traffic ?? 0}</div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Запросов {windowLabel}</div>
            <div className="mt-1 text-2xl font-semibold text-white">{summary.requests ?? "—"}</div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Доля успешных</div>
            <div className={`mt-1 text-2xl font-semibold ${health(summary.success_rate).text}`}>
              {pct(summary.success_rate)}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Средняя задержка</div>
            <div className="mt-1 text-2xl font-semibold text-white">{ms(summary.avg_ms)}</div>
          </div>
        </div>

        {/* График использования по часам */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-medium text-white">Использование по часам</div>
            <div className="text-[11px] text-gray-600">запросов за час, последние 24 часа</div>
          </div>

          {usage.every((u) => u.total === 0) && (
            <div className="mt-3 text-[11px] text-gray-600">
              За последние сутки запросов через шлюз не было — столбцы появятся с первым трафиком.
            </div>
          )}

          <div className="relative mt-3 flex h-24 items-end gap-[3px] border-b border-white/10">
            {(usage.length ? usage : Array.from({ length: 24 }, () => ({ total: 0, ok: 0 }))).map((u, i) => {
              const h = u.total === 0 ? 2 : Math.max(3, Math.round((u.total / maxUsage) * 96));
              const color =
                u.total === 0
                  ? "bg-white/10"
                  : u.ok === u.total
                  ? "bg-[#00CC00]"
                  : u.ok / u.total >= 0.9
                  ? "bg-amber-300"
                  : "bg-red-400";
              return (
                <div
                  key={u.hour || i}
                  className={`flex-1 rounded-sm ${color}`}
                  style={{ height: `${h}px` }}
                  title={`${u.hour ? u.hour.slice(11, 16) : ""} — ${u.total} запросов`}
                />
              );
            })}
          </div>

          <div className="mt-1 flex justify-between text-[10px] text-gray-600">
            <span>-24 ч</span>
            <span>-18 ч</span>
            <span>-12 ч</span>
            <span>-6 ч</span>
            <span className="text-[#00CC00]">сейчас</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или id"
            className="w-full max-w-xs rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-[#00CC00]"
          />
          <div className="text-xs text-gray-600">
            Обновлено: {time(data?.updated_at)}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-[3px] rounded-sm bg-[#00FF00]" /> все запросы успешны</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-[3px] rounded-sm bg-amber-300" /> часть сбоев</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-[3px] rounded-sm bg-red-400" /> сбои</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-[3px] rounded-sm bg-white/10" /> запросов не было</span>
          <span className="text-gray-600">полоса — один час, слева 24 часа назад, справа текущий час</span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Модель</th>
                <th className="px-3 py-2 text-right font-medium">Вход / выход за 1M</th>
                <th className="px-3 py-2 text-right font-medium">Запросов</th>
                <th className="px-3 py-2 text-left font-medium">Сутки по часам</th>
                <th className="px-3 py-2 text-right font-medium">Успешность</th>
                <th className="px-3 py-2 text-right font-medium">Средняя</th>
                <th className="px-3 py-2 text-right font-medium">p95</th>
                <th className="px-3 py-2 text-left font-medium">Последняя ошибка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!data && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-500">Загружаем статистику…</td>
                </tr>
              )}
              {data && models.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-500">Ничего не найдено</td>
                </tr>
              )}
              {models.map((m) => {
                const h = health(m.success_rate);
                return (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 flex-none rounded-full ${h.dot}`} title={h.label} />
                        <div>
                          <div className="text-gray-100">{m.name}</div>
                          <div className="text-[11px] text-gray-600">{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-300">
                      {money(m.input_per_1m)} / {money(m.output_per_1m)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-400">{m.requests || "—"}</td>
                    <td className="px-3 py-2">
                      {(m.hours || []).some((h) => h.total > 0) ? (
                      <div className="flex items-end gap-[4px]" title={`успешность за сутки: ${pct(m.uptime_24h)}`}>
                        {(m.hours || []).map((h, i) => (
                          <span
                            key={h.hour}
                            className={`h-[18px] w-[4px] rounded-sm ${hourColor(h)} ${
                              h.total === 0 ? "ring-1 ring-white/10" : ""
                            } ${i === 23 ? "outline outline-1 outline-offset-[2px] outline-white/30" : ""}`}
                            title={`${h.hour.slice(11, 16)} — ${h.total ? `${h.ok}/${h.total}` : "нет запросов"}`}
                          />
                        ))}
                      </div>
                      ) : (
                        <span className="text-[11px] text-gray-600">нет запросов за сутки</span>
                      )}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${h.text}`}>{pct(m.success_rate)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-300">{ms(m.avg_ms)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-400">{ms(m.p95_ms)}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {m.last_error_at ? (
                        <span title={m.last_error_code || ""}>{time(m.last_error_at)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-gray-600">
          Данные собираются по фактическим запросам через шлюз. Модель без запросов за сутки
          показывается серой точкой — это значит «ещё не проверена», а не «не работает».
          Если видите массовые ошибки, напишите в поддержку.
        </p>
      </main>
    </div>
  );
}
