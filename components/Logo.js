import Link from "next/link";

// Лого: нейросеть — 10 зелёных точек по кругу, каждая соединена с каждой (45 линий), чёрный фон
export default function Logo({ size = 32 }) {
  // Координаты 10 точек на окружности r=42, центр (60,60)
  const points = [
    [60, 18], [84.7, 26], [99.9, 47], [99.9, 73], [84.7, 94],
    [60, 102], [35.3, 94], [20.1, 73], [20.1, 47], [35.3, 26],
  ];

  const lines = [];
  for (let i = 0; i < 10; i++) {
    for (let j = i + 1; j < 10; j++) {
      lines.push(
        <line
          key={`${i}-${j}`}
          x1={points[i][0]} y1={points[i][1]}
          x2={points[j][0]} y2={points[j][1]}
          stroke="#00CC00" strokeWidth="1.6" strokeOpacity="0.55"
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
          <circle key={i} cx={x} cy={y} r="5" fill="#00FF00" />
        ))}
      </g>
    </svg>
  );
}
