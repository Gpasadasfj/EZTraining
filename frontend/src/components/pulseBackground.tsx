const PULSE_PATH =
  "M-20 640 H200 L230 598 L260 682 L290 640 L320 682 L350 598 L380 640 " +
  "H700 L730 598 L760 682 L790 640 L820 682 L850 598 L880 640 " +
  "H1200 L1230 598 L1260 682 L1290 640 L1320 682 L1350 598 L1380 640 H1620";

export default function PulseBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {/* resplandor naranja */}
      <div
        className="absolute -inset-[20%] motion-safe:animate-drift"
        style={{
          background: `
      radial-gradient(40% 35% at 68% 42%, color-mix(in oklab, var(--primary) 13%, transparent), transparent 70%),
      radial-gradient(30% 30% at 18% 85%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 70%)
    `,
        }}
      />

      {/* línea de pulso */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        className="absolute inset-x-0 h-full w-full top-[28%] lg:top-0"
      >
        {/* línea base, muy tenue */}
        <path
          d={PULSE_PATH}
          pathLength={1000}
          vectorEffect="non-scaling-stroke"
          fill="none"
          className="stroke-primary/10 stroke-[1.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* trazo brillante que recorre la línea */}
        <path
          d={PULSE_PATH}
          pathLength={1000}
          vectorEffect="non-scaling-stroke"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary stroke-2 drop-shadow-[0_0_6px_var(--primary)] [stroke-dasharray:90_910] motion-safe:animate-trace motion-reduce:[stroke-dasharray:none] motion-reduce:stroke-primary/25 motion-reduce:drop-shadow-none"
        />
      </svg>
    </div>
  );
}
