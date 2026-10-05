import { useLayoutEffect, useRef, useState } from "react";

// Forma del latido: dirección vertical de cada uno de sus 6 puntos (-1 arriba, 1 abajo, 0 centro)
const BEAT_SHAPE = [-1, 1, 0, 1, -1, 0];

function buildPulsePath(
  width: number,
  height: number,
  beats: number[],
  beatWidth: number,
  amplitude: number,
) {
  const mid = height / 2;

  // Si no caben, los latidos se encogen (máx. 80 % del hueco que le toca a cada uno)
  const scale = Math.min(1, (width / beats.length) * 0.8 / beatWidth);
  const bw = beatWidth * scale;
  const amp = Math.min(amplitude * scale, mid - 4); // misma forma, más pequeña
  const step = bw / BEAT_SHAPE.length;

  let d = `M-20 ${mid}`;
  let cursor = 0; // dónde acabó el latido anterior

  for (const beat of [...beats].sort((a, b) => a - b)) {
    // Centrado en su posición, pero sin pisar al anterior ni salirse por la derecha
    const start = Math.min(Math.max(beat * width - bw / 2, cursor), width - bw);
    d += ` H${start}`;
    BEAT_SHAPE.forEach((direction, i) => {
      d += ` L${start + step * (i + 1)} ${mid + direction * amp}`;
    });
    cursor = start + bw;
  }

  return `${d} H${width + 20}`;
}

interface PulseLineProps {
  beats?: number[]; // posición de cada latido, de 0 (izquierda) a 1 (derecha)
  beatWidth?: number; // ancho del latido en px
  amplitude?: number; // altura del pico en px
  animated?: boolean; // traza luminosa recorriendo la línea
  baseClassName?: string; // color y grosor de la línea base
  className?: string; // posición y tamaño
}

export default function PulseLine({
  beats = [0.6],
  beatWidth = 168,
  amplitude = 32,
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
      ? buildPulsePath(size.width, size.height, beats, beatWidth, amplitude)
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
