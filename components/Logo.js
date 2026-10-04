"use client";

// Лого: нейросеть — 7 зелёных точек по кругу, каждая соединена с каждой (21 линий), чёрный фон
export default function Logo({ size = 32 }) {
  const points = [[60.0, 18.0], [92.8, 33.8], [100.9, 69.3], [78.2, 97.8], [41.8, 97.8], [19.1, 69.3], [27.2, 33.8]];

  const lines = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      lines.push(
        <line
          key={`${i}-${j}`}
          x1={points[i][0]} y1={points[i][1]}
          x2={points[j][0]} y2={points[j][1]}
          stroke="#00CC00" strokeWidth="1.8" strokeOpacity="0.6"
        />
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="flex-shrink-0"
      aria-label="AI Combiner logo"
    >
      <rect width="120" height="120" rx="24" fill="#000000" />
      <g>
        {lines}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="#00FF00" />
        ))}
      </g>
    </svg>
  );
}
