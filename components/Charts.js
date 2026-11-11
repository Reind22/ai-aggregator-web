"use client";

/**
 * Лёгкие SVG-диаграммы без библиотек.
 *
 * Общие правила оформления: горизонтальная сетка, подписи оси Y справа,
 * даты в формате дд.мм, выбранная точка подсвечивается и показывает значение.
 * Ничего не тянем из сети и не подключаем чарт-библиотек.
 */

import { useId, useState } from "react";

const fmtDefault = (v) => `$${Number(v ?? 0).toFixed(2)}`;

const compact = (v) => {
  const n = Number(v ?? 0);
  if (n === 0) return "0";
  const abs = Math.abs(n);
  // мелкие суммы ($0.0001) в compact-нотации превращаются в «0» — показываем значащие цифры
  if (abs < 0.01) return "$" + n.toFixed(abs < 0.001 ? 6 : 4).replace(/0+$/, "").replace(/\.$/, "");
  if (abs < 1) return "$" + n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(n);
};

const fmtDate = (d) => {
  if (!d || typeof d !== "string") return "";
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}` : d;
};

const niceMax = (max) => {
  if (!max || max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

function Empty({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17V7m6 10V4m6 13v-6m6 6V9" />
        </svg>
      </div>
      <p className="text-xs text-gray-500">{text}</p>
    </div>
  );
}

function Scale({ max, fmt, height }) {
  const values = [max, max / 2, 0];
  return (
    <div
      className="flex flex-col justify-between text-[10px] tabular-nums text-gray-500 text-right select-none flex-shrink-0 w-11"
      style={{ height }}
      aria-hidden
    >
      {values.map((v, i) => (
        <span key={i} style={{ lineHeight: 1 }}>{fmt(v)}</span>
      ))}
    </div>
  );
}

function Caption({ sel, data, valueKey, nameKey, format }) {
  if (sel === null || !data[sel]) {
    return <div className="mt-2 h-4 text-[10px] text-gray-600">Нажмите на точку, чтобы увидеть значение</div>;
  }
  const d = data[sel];
  const name = nameKey ? d[nameKey] : fmtDate(d.date);
  return (
    <div className="mt-2 h-4 text-[11px] text-gray-300">
      <span className="text-gray-500">{name}:</span>{" "}
      <span className="font-semibold text-[#00FF00]">{format(d[valueKey])}</span>
    </div>
  );
}

function Axes({ H, max, yFmt }) {
  return (
    <>
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1="0"
          x2="100"
          y1={H - f * (H - 6) - 2}
          y2={H - f * (H - 6) - 2}
          stroke="currentColor"
          className="text-white/[0.07]"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}

export function BarChart({ data, valueKey, label = "", format = fmtDefault, height = 180 }) {
  const [sel, setSel] = useState(null);
  const gid = useId().replace(/:/g, "");

  if (!data.length) return <Empty text="Данных пока нет" />;

  const rawMax = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 0);
  const max = niceMax(rawMax);
  const H = height / 2;
  const w = 100 / data.length;
  const yFmt = (v) => (format === fmtDefault ? compact(v) : compact(v));

  return (
    <div>
      <div className="flex gap-2">
        <Scale max={max} fmt={yFmt} height={height} />
        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
            <defs>
              <linearGradient id={`bar-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF00" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#00CC00" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <Axes H={H} max={max} yFmt={yFmt} />
            {data.map((d, i) => {
              const v = Number(d[valueKey]) || 0;
              const h = max ? (v / max) * (H - 8) : 0;
              const isSel = sel === i;
              return (
                <g key={i} onClick={() => setSel(isSel ? null : i)} className="cursor-pointer">
                  {/* зона нажатия на всю высоту — по столбикам трудно попасть */}
                  <rect x={i * w} y="0" width={w} height={H} fill="transparent" />
                  <rect
                    x={i * w + w * 0.18}
                    y={H - Math.max(h, v > 0 ? 0.8 : 0)}
                    width={w * 0.64}
                    height={Math.max(h, v > 0 ? 0.8 : 0)}
                    rx="0.7"
                    fill={`url(#bar-${gid})`}
                    className={isSel ? "opacity-100" : "opacity-80 hover:opacity-100"}
                  >
                    <title>{`${fmtDate(d.date)}: ${format(v)}`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
            <span>{fmtDate(data[0]?.date)}</span>
            {label && <span className="text-gray-600">{label}</span>}
            <span>{fmtDate(data[data.length - 1]?.date)}</span>
          </div>
        </div>
      </div>
      <Caption sel={sel} data={data} valueKey={valueKey} format={format} />
    </div>
  );
}

const PIE_COLORS = ["#00FF00", "#00A3FF", "#FFB800", "#FF4D6A", "#9B59F6", "#00D4C8", "#FF7A45", "#7F8C9B"];

export function PieChart({ data, valueKey, nameKey, format = fmtDefault }) {
  const [sel, setSel] = useState(null);
  if (!data.length) return <Empty text="Нет данных" />;

  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0) || 1;
  let acc = 0;
  const R = 42, r0 = 26, cx = 50, cy = 50;

  const arcs = data.map((d, i) => {
    const frac = (Number(d[valueKey]) || 0) / total;
    const a0 = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const xi1 = cx + r0 * Math.cos(a1), yi1 = cy + r0 * Math.sin(a1);
    const xi0 = cx + r0 * Math.cos(a0), yi0 = cy + r0 * Math.sin(a0);
    return (
      <path
        key={i}
        d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r0} ${r0} 0 ${large} 0 ${xi0} ${yi0} Z`}
        fill={PIE_COLORS[i % PIE_COLORS.length]}
        className={`cursor-pointer transition-opacity ${sel === null || sel === i ? "opacity-100" : "opacity-30"}`}
        onClick={() => setSel(sel === i ? null : i)}
      >
        <title>{`${d[nameKey]}: ${format(d[valueKey])} (${(frac * 100).toFixed(1)}%)`}</title>
      </path>
    );
  });

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-36 h-36 flex-shrink-0">
        {arcs}
      </svg>
      <ul className="text-xs space-y-1.5 min-w-[160px] flex-1">
        {data.map((d, i) => (
          <li
            key={i}
            onClick={() => setSel(sel === i ? null : i)}
            className={`flex items-center gap-2 cursor-pointer rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${sel === i ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-300 flex-1 truncate">{d[nameKey]}</span>
            <span className="text-gray-500 tabular-nums">{format(d[valueKey])}</span>
            <span className="text-gray-600 tabular-nums w-10 text-right">
              {((Number(d[valueKey]) || 0) / total * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({ data, valueKey, label = "", height = 180 }) {
  const [sel, setSel] = useState(null);
  const gid = useId().replace(/:/g, "");

  if (!data.length) return <Empty text="Данных пока нет" />;

  const rawMax = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 0);
  const max = niceMax(rawMax);
  const W = 100, H = height / 2;
  const pad = 2;

  const pts = data.map((d, i) => {
    const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * (W - pad * 2) + pad;
    const y = H - ((Number(d[valueKey]) || 0) / max) * (H - 8) - 2;
    return [x, y];
  });

  // Плавная линия: сглаживание через средние точки
  const path = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `${acc} C ${cx} ${prev[1]}, ${cx} ${p[1]}, ${p[0]} ${p[1]}`;
  }, "");

  const area = `${path} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const yFmt = (v) => compact(v);

  return (
    <div>
      <div className="flex gap-2">
        <Scale max={max} fmt={yFmt} height={height} />
        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
            <defs>
              <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF00" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#00FF00" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <Axes H={H} max={max} yFmt={yFmt} />
            <path d={area} fill={`url(#area-${gid})`} />
            <path
              d={path}
              fill="none"
              stroke="#00FF00"
              strokeWidth="1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {sel !== null && pts[sel] && (
              <line
                x1={pts[sel][0]} x2={pts[sel][0]} y1="0" y2={H}
                stroke="#00FF00" strokeOpacity="0.35" strokeWidth="0.5"
                strokeDasharray="2 2" vectorEffect="non-scaling-stroke"
              />
            )}
            {pts.map((p, i) => (
              <g key={i} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
                <circle cx={p[0]} cy={p[1]} r="4" fill="transparent" />
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={sel === i ? 1.9 : 1.1}
                  className={sel === i ? "fill-white" : "fill-[#00FF00]"}
                >
                  <title>{`${fmtDate(data[i].date)}: ${data[i][valueKey]}`}</title>
                </circle>
              </g>
            ))}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
            <span>{fmtDate(data[0]?.date)}</span>
            {label && <span className="text-gray-600">{label}</span>}
            <span>{fmtDate(data[data.length - 1]?.date)}</span>
          </div>
        </div>
      </div>
      <Caption sel={sel} data={data} valueKey={valueKey} format={compact} />
    </div>
  );
}