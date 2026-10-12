"use client";

/**
 * Лёгкие SVG-диаграммы без библиотек.
 * BarChart — столбики по датам, PieChart — круговая по долям, LineChart — линия по датам.
 */

const fmt$ = (cents) => `$${(cents / 100).toFixed(2)}`;

export function BarChart({ data, valueKey, label = "", format = fmt$, height = 180 }) {
  if (!data.length) return <p className="text-gray-500 text-sm py-8 text-center">Нет данных за период</p>;
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const w = 100 / data.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d[valueKey] / max) * (height / 2 - 6);
          return (
            <rect
              key={i}
              x={i * w + w * 0.15}
              y={height / 2 - h}
              width={w * 0.7}
              height={h}
              rx="0.6"
              className="fill-[#00CC00] hover:fill-[#00FF00] transition-colors"
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
  );
}

const PIE_COLORS = ["#00CC00", "#00A3FF", "#FFB800", "#FF4D6A", "#9B59F6", "#00D4C8", "#FF7A45", "#7F8C9B"];

export function PieChart({ data, valueKey, nameKey, format = fmt$ }) {
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
          <li key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-300 flex-1">{d[nameKey]}</span>
            <span className="text-gray-500">{format(d[valueKey])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({ data, valueKey, label = "", height = 180 }) {
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
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d={area} className="fill-[#00CC00]/10" />
        <path d={path} fill="none" stroke="#00CC00" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1" className="fill-[#00FF00]">
            <title>{`${data[i].date}: ${data[i][valueKey]}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>{data[0]?.date}</span>
        {label && <span>{label}</span>}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
