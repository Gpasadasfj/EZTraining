// components/pulseBackground.tsx
import PulseLine from "./pulseLine";

const lineClass = "absolute inset-x-0 h-28 -translate-y-1/2";
const lineStroke = "stroke-primary/10 stroke-[1.5]";

export default function PulseBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Resplandor */}
      <div
        className="absolute -inset-[20%] motion-safe:animate-drift"
        style={{
          background: `
            radial-gradient(40% 35% at 68% 42%, color-mix(in oklab, var(--primary) 13%, transparent), transparent 70%),
            radial-gradient(35% 30% at 18% 85%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 70%)
          `,
        }}
      />

      {/* Móvil: dos latidos con más espacio */}
      <PulseLine
        animated
        beats={[0.28, 0.76]}
        beatWidth={110}
        amplitude={30}
        baseClassName={lineStroke}
        className={`${lineClass} top-[92%] lg:hidden`}
      />

      {/* Escritorio: tres latidos */}
      {/* Escritorio: tres latidos, pegados al borde inferior */}
      <PulseLine
        animated
        beats={[0.15, 0.55, 0.85]}
        beatWidth={180}
        amplitude={42}
        baseClassName={lineStroke}
        className="absolute inset-x-0 bottom-20 hidden h-28 lg:block"
      />
    </div>
  );
}
