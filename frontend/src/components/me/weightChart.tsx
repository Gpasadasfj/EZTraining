import type { WeightLog } from "../../types/users";
import { formatNumber, formatShortDate } from "../../utils/format";

// Coordenadas internas del SVG; luego se estira al ancho de la tarjeta
const W = 600;
const H = 150;
const PAD_X = 18;
const AXIS = 26; // hueco abajo para las fechas

interface WeightChartProps {
  logs: WeightLog[]; // del más antiguo al más reciente, mínimo 2
  target: number | null;
}

export default function WeightChart({ logs, target }: WeightChartProps) {
  const weights = logs.map((log) => Number(log.weight));
  // El objetivo entra en la escala para que su línea quede siempre dentro
  const range = target !== null ? [...weights, target] : weights;
  const min = Math.min(...range) - 0.6;
  const max = Math.max(...range) + 0.6;

  const x = (index: number) =>
    PAD_X + (index * (W - PAD_X * 2)) / (logs.length - 1);
  const y = (weight: number) =>
    8 + ((max - weight) * (H - AXIS - 8)) / (max - min);

  const points = weights.map((weight, index) => ({
    x: x(index),
    y: y(weight),
  }));
  const first = points[0];
  const last = points[points.length - 1];
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${last.x.toFixed(1)} ${H - AXIS} L${first.x.toFixed(1)} ${H - AXIS} Z`;

  const labels =
    logs.length > 2
      ? [
          logs[0],
          logs[Math.floor((logs.length - 1) / 2)],
          logs[logs.length - 1],
        ]
      : logs;
  const summary = `Evolución del peso: de ${formatNumber(weights[0])} kg el ${formatShortDate(logs[0].recorded_at)} a ${formatNumber(weights[weights.length - 1])} kg el ${formatShortDate(logs[logs.length - 1].recorded_at)}`;

  return (
    <div
      role="img"
      aria-label={summary}
      className="relative -mx-1 h-37.5 lg:h-42.5"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block size-full overflow-visible"
      >
        <defs>
          <linearGradient id="weight-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        {target !== null && (
          <line
            x1="0"
            x2={W}
            y1={y(target)}
            y2={y(target)}
            strokeWidth="1.5"
            strokeDasharray="4 5"
            vectorEffect="non-scaling-stroke"
            className="stroke-fg-subtle"
          />
        )}
        <path d={area} fill="url(#weight-area)" />
        <path
          d={line}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-blue-400"
        />
      </svg>

      {target !== null && (
        <span
          style={{ top: `${(y(target) / H) * 100}%` }}
          className="absolute right-1 -translate-y-full pb-0.5 text-xs font-semibold text-fg-subtle"
        >
          Objetivo {formatNumber(target)} kg
        </span>
      )}

      {/* Los puntos van en HTML: con preserveAspectRatio="none" un círculo SVG se estiraría en elipse */}
      {points.map((point, index) => (
        <span
          key={logs[index].id}
          style={{
            left: `${(point.x / W) * 100}%`,
            top: `${(point.y / H) * 100}%`,
          }}
          className={`absolute -translate-1/2 rounded-full ${
            index === points.length - 1
              ? "size-3 bg-blue-400 ring-4 ring-blue-400/25"
              : "size-2 border-2 border-blue-400 bg-surface"
          }`}
        />
      ))}

      <div className="absolute inset-x-3.5 bottom-0 flex justify-between text-xs text-fg-subtle">
        {labels.map((log) => (
          <span key={log.id}>{formatShortDate(log.recorded_at)}</span>
        ))}
      </div>
    </div>
  );
}
