import { useLayoutEffect, useRef, useState } from "react";

// Forma del latido: dirección vertical de cada uno de sus 6 puntos (-1 arriba, 1 abajo, 0 centro).
// Los picos de los extremos van a media altura para que se parezca a una barra EZ
const BEAT_SHAPE = [-0.5, 1, 0, 1, -0.5, 0];

type Point = [number, number];

// Cambia cada esquina por una curva: tramos rectos con los dobleces redondeados, como una barra EZ
function roundCorners(points: Point[], radius: number) {
  let d = `M${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < points.length - 1; i++) {
    const [prevX, prevY] = points[i - 1];
    const [x, y] = points[i];
    const [nextX, nextY] = points[i + 1];

    const lengthIn = Math.hypot(x - prevX, y - prevY);
    const lengthOut = Math.hypot(nextX - x, nextY - y);
    // Como mucho la mitad de cada tramo, para que dos curvas seguidas no se pisen
    const r = Math.min(radius, lengthIn / 2, lengthOut / 2);

    if (r === 0) {
      d += ` L${x} ${y}`;
      continue;
    }

    // La curva empieza r px antes de la esquina y acaba r px después
    const startX = x - ((x - prevX) / lengthIn) * r;
    const startY = y - ((y - prevY) / lengthIn) * r;
    const endX = x + ((nextX - x) / lengthOut) * r;
    const endY = y + ((nextY - y) / lengthOut) * r;

    d += ` L${startX} ${startY} Q${x} ${y} ${endX} ${endY}`;
  }

  const [lastX, lastY] = points[points.length - 1];
  return `${d} L${lastX} ${lastY}`;
}

function buildPulsePath(
  width: number,
  height: number,
  beats: number[],
  beatWidth: number,
  amplitude: number,
  cornerRadius: number,
) {
  const mid = height / 2;

  // Si no caben, los latidos se encogen (máx. 80 % del hueco que le toca a cada uno)
  const scale = Math.min(1, ((width / beats.length) * 0.8) / beatWidth);
  const bw = beatWidth * scale;
  const amp = Math.min(amplitude * scale, mid - 4); // misma forma, más pequeña
  const step = bw / BEAT_SHAPE.length;

  const points: Point[] = [[-20, mid]];
  let cursor = 0; // dónde acabó el latido anterior

  for (const beat of [...beats].sort((a, b) => a - b)) {
    // Centrado en su posición, pero sin pisar al anterior ni salirse por la derecha
    const start = Math.min(Math.max(beat * width - bw / 2, cursor), width - bw);
    points.push([start, mid]);
    BEAT_SHAPE.forEach((direction, i) => {
      points.push([start + step * (i + 1), mid + direction * amp]);
    });
    cursor = start + bw;
  }

  points.push([width + 20, mid]);

  // El radio también se encoge con el latido
  return roundCorners(points, cornerRadius * scale);
}

interface PulseLineProps {
  beats?: number[]; // posición de cada latido, de 0 (izquierda) a 1 (derecha)
  beatWidth?: number; // ancho del latido en px
  amplitude?: number; // altura del pico en px
  cornerRadius?: number; // radio de los dobleces en px (0 = picos en punta)
  animated?: boolean; // traza luminosa recorriendo la línea
  baseClassName?: string; // color y grosor de la línea base
  className?: string; // posición y tamaño
}

export default function PulseLine({
  beats = [0.6],
  beatWidth = 168,
  amplitude = 32,
  cornerRadius = 18,
  animated = false,
  baseClassName = "stroke-primary/35 stroke-[2.5]",
  className = "",
}: PulseLineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const d =
    size.width > 0
      ? buildPulsePath(
          size.width,
          size.height,
          beats,
          beatWidth,
          amplitude,
          cornerRadius,
        )
      : "";

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    >
      {d && (
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="size-full overflow-visible"
        >
          <path
            d={d}
            pathLength={1000}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`fill-none ${baseClassName}`}
          />
          {animated && (
            <path
              d={d}
              pathLength={1000}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-none stroke-primary stroke-2 drop-shadow-[0_0_6px_var(--primary)] [stroke-dasharray:90_910] motion-safe:animate-trace motion-reduce:hidden"
            />
          )}
        </svg>
      )}
    </div>
  );
}
