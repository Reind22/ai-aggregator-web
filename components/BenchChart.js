"use client";

/**
 * Сравнение модели с топ-5 по бенчмарку — горизонтальные полосы.
 *
 * Зачем: одна цифра «#23 из 40» ничего не говорит о разрыве. Полосы показывают,
 * насколько модель отстаёт от лидера и где находится относительно пятёрки.
 */
export default function BenchChart({ title, subtitle, rows, unit = "%", max }) {
  if (!rows?.length) return null;
  const ceiling = max || Math.max(...rows.map((r) => Number(r.value) || 0), 1);
  const our = rows.find((r) => r.ours);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
        </div>
        {our && (
          <div className="flex-shrink-0 text-right">
            <div className="text-[11px] text-gray-500">наша модель</div>
            <div className="tabular-nums text-sm font-semibold text-[#00FF00]">
              {Number(our.value).toFixed(unit === "%" ? 1 : 0)}{unit}
            </div>
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {rows.map((r, i) => {
          const width = Math.max(2, (Number(r.value) / ceiling) * 100);
          return (
            <li key={`${r.label}-${i}`} className="group">
              <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
                <span className={`truncate ${r.ours ? "font-medium text-[#00FF00]" : "text-gray-400"}`}>
                  {r.ours ? "▸ " : ""}{r.label}
                </span>
                <span className={`tabular-nums ${r.ours ? "text-[#00FF00]" : "text-gray-500"}`}>
                  {Number(r.value).toFixed(unit === "%" ? 1 : 0)}{unit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all ${r.ours ? "bg-[#00FF00]" : "bg-white/30 group-hover:bg-white/45"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}