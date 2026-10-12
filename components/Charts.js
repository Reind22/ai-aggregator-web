"use client";

/**
 * Лёгкие SVG-диаграммы без библиотек.
 * BarChart — столбики по датам, PieChart — круговая по долям, LineChart — линия по датам.
 * Общее: Y-шкала с подписями + клик по элементу → точное значение.
 */

import { useState } from "react";

const fmt$ = (cents) => `$${(cents / 100).toFixed(5)}`;
const compact = (v) =>
  new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(v);

// Подписи Y-шкалы: max, середина, 0
const ticks = (max, fmt) => {
  if (!max) return ["0"];
  return [fmt(max), fmt(max / 2), fmt(0)];
};

function Scale({ max, fmt, height }) {
  return (
    <div
      className="flex flex-col justify-between text-[10px] text-gray-500 text-right select-none flex-shrink-0 w-12"
      style={{ height }}
      aria-hidden
    >
      {ticks(max, fmt).map((t, i) => (
        <span key={i} style={{ lineHeight: 1 }}>{t}</span>
      ))}
    </div>
  );
}

function SelectedLine({ sel, data, valueKey, nameKey, format }) {
  if (sel === null) return <div className="h-5 mt-1 text-[11px] text-gray-600">Клик по элементу — точное значение</div>;
  const d = data[sel];
  if (!d) return null;
  const name = nameKey ? d[nameKey] : d.date;
  return (
    <div className="h-5 mt-1 text-[11px] text-[#00FF00]">
      {name}: <b>{format(d[valueKey])}</b>
    </div>
  );
}

export function BarChart({ data, valueKey, label = "", format = fmt$, height = 180 }) {
  const [sel, setSel] = useState(null);
  if (!data.length) return <p className="text-gray-500 text-sm py-8 text-center">Нет данных за период</p>;
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const w = 100 / data.length;
  const H = height / 2;
  return (
    <div>
      <div className="flex gap-1.5">
        <Scale max={max} fmt={format === fmt$ ? (v) => "$" + (v / 100).toFixed(2) : compact} height={height} />
        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
            {data.map((d, i) => {
              const h = (d[valueKey] / max) * (H - 6);
              const isSel = sel === i;
              return (
                <rect
                  key={i}
                  x={i * w + w * 0.15}
                  y={H - h}
                  width={w * 0.7}
                  height={h}
                  rx="0.6"
                  className={`transition-all cursor-pointer ${isSel ? "fill-[#7CFF7C] stroke-[#FFFFFF] stroke-[0.4]" : "fill-[#00CC00] hover:fill-[#00FF00]"}`}
                  onClick={() => setSel(isSel ? null : i)}
                >
                  <title>{`${d.date}: ${format(d[valueKey])}`}</title>
                </rect>
              );
            })}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{data[0]?.date}</span>
            {label && <span>{label}</span>}
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>
      <SelectedLine sel={sel} data={data} valueKey={valueKey} format={format} />
    </div>
  );
}

const PIE_COLORS = ["#00CC00", "#00A3FF", "#FFB800", "#FF4D6A", "#9B59F6", "#00D4C8", "#FF7A45", "#7F8C9B"];

export function PieChart({ data, valueKey, nameKey, format = fmt$ }) {
  const [sel, setSel] = useState(null);
  if (!data.length) return <p className="text-gray-500 text-sm py-8 text-center">Нет данных</p>;
  const total = data.reduce((s, d) => s + d[valueKey], 0) || 1;
  let acc = 0;
  const R = 40, cx = 50, cy = 50;
  const arcs = data.map((d, i) => {
    const frac = d[valueKey] / total;
    const a0 = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`}
        fill={PIE_COLORS[i % PIE_COLORS.length]}
        className={sel === i ? "brightness-150 cursor-pointer" : "cursor-pointer"}
        onClick={() => setSel(sel === i ? null : i)}
      >
        <title>{`${d[nameKey]}: ${format(d[valueKey])} (${(frac * 100).toFixed(1)}%)`}</title>
      </path>
    );
  });
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-36 h-36 flex-shrink-0">
        {arcs}
        <circle cx="50" cy="50" r="22" className="fill-[#0d0d14]" />
      </svg>
      <ul className="text-xs space-y-1 min-w-[140px]">
        {data.map((d, i) => (
          <li
            key={i}
            onClick={() => setSel(sel === i ? null : i)}
            className={`flex items-center gap-2 cursor-pointer rounded px-1 -mx-1 ${sel === i ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-300 flex-1">{d[nameKey]}</span>
            <span className="text-gray-500">{format(d[valueKey])}</span>
          </li>
        ))}
      </ul>
      <SelectedLine sel={sel} data={data} valueKey={valueKey} nameKey={nameKey} format={format} />
    </div>
  );
}

export function LineChart({ data, valueKey, label = "", height = 180 }) {
  const [sel, setSel] = useState(null);
  if (!data.length) return <p className="text-gray-500 text-sm py-8 text-center">Нет данных за период</p>;
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const W = 100, H = height / 2;
  const pts = data.map((d, i) => [
    data.length === 1 ? W / 2 : (i / (data.length - 1)) * (W - 4) + 2,
    H - (d[valueKey] / max) * (H - 6) - 2,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  return (
    <div>
      <div className="flex gap-1.5">
        <Scale max={max} fmt={compact} height={height} />
        <div className="flex-1 min-w-0">
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
            <path d={area} className="fill-[#00CC00]/10" />
            <path d={path} fill="none" stroke="#00CC00" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            {pts.map((p, i) => (
              <g key={i} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
                <circle cx={p[0]} cy={p[1]} r="3" fill="transparent" />
                <circle cx={p[0]} cy={p[1]} r={sel === i ? "1.6" : "1"} className={sel === i ? "fill-[#FFFFFF]" : "fill-[#00FF00]"}>
                  <title>{`${data[i].date}: ${data[i][valueKey]}`}</title>
                </circle>
              </g>
            ))}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{data[0]?.date}</span>
            {label && <span>{label}</span>}
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </div>
      <SelectedLine sel={sel} data={data} valueKey={valueKey} format={compact} />
    </div>
  );
}
