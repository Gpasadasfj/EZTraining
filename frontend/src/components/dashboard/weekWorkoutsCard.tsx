// components/dashboard/weekCard.tsx
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { formatKg } from "../../utils/format";

const DAYS = [
  { short: "L", long: "Lunes" },
  { short: "M", long: "Martes" },
  { short: "X", long: "Miércoles" },
  { short: "J", long: "Jueves" },
  { short: "V", long: "Viernes" },
  { short: "S", long: "Sábado" },
  { short: "D", long: "Domingo" },
];

interface WeekCardProps {
  done: number;
  target: number | null;
  volume: number;
  daysTrained: number[];
}

export default function WeekCard({
  done,
  target,
  volume,
  daysTrained,
}: WeekCardProps) {
  const goalMet = target !== null && done >= target;
  const todayIndex = (new Date().getDay() + 6) % 7; // getDay(): 0 = domingo → 0 = lunes

  return (
    <section
      aria-labelledby="week-title"
      className={`flex flex-col rounded-card border p-4.5 lg:p-5.5 ${
        goalMet
          ? "border-success/40 bg-[radial-gradient(90%_90%_at_100%_0%,rgb(34_197_94/0.14),transparent_65%)] bg-surface"
          : "border-line bg-surface"
      }`}
    >
      {/* Título */}
      <h2
        id="week-title"
        className="m-0 flex items-center gap-2 text-base font-semibold"
      >
        <span aria-hidden="true" className="text-[1.1rem] leading-none">
          {goalMet ? "🎉" : "🔥"}
        </span>
        Esta semana
      </h2>

      {/* Número grande */}
      <p className="m-0 mt-3 flex items-baseline gap-2 lg:mt-auto lg:pt-3">
        <span
          className={`font-display text-[2.6rem] leading-none font-bold tabular-nums lg:text-[3.2rem] ${
            goalMet ? "text-green-400" : "text-fg"
          }`}
        >
          {done}
        </span>
        <span className="font-medium text-fg-muted">
          {target !== null ? `de ${target} entrenos` : "entrenos"}
        </span>
      </p>

      {/* Días de la semana */}
      <ol className="m-0 my-4 grid list-none grid-cols-7 gap-1.5 p-0 lg:my-auto lg:gap-2 lg:py-3.5">
        {DAYS.map((day, i) => {
          const trained = daysTrained.includes(i);
          const isToday = i === todayIndex;

          let circle = "bg-surface-hover text-fg-subtle";
          if (trained) {
            circle = goalMet
              ? "bg-success text-green-950 shadow-[0_6px_14px_-8px_rgb(34_197_94/0.9)]"
              : "bg-primary text-on-primary shadow-[0_6px_14px_-8px_rgb(249_115_22/0.9)]";
          } else if (isToday) {
            circle =
              "bg-transparent text-accent shadow-[inset_0_0_0_2px_var(--primary)]";
          }

          return (
            <li
              key={day.short}
              aria-label={`${day.long}${trained ? ", entrenado" : ""}${isToday ? ", hoy" : ""}`}
              className={`grid justify-items-center gap-1.5 text-[0.72rem] font-semibold ${
                isToday ? "text-accent" : "text-fg-subtle"
              }`}
            >
              <span
                className={`grid aspect-square w-full max-w-9.5 place-items-center rounded-full lg:max-w-10.5 ${circle}`}
              >
                {trained && (
                  <Check
                    className="size-4"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </span>
              {day.short}
            </li>
          );
        })}
      </ol>

      {/* Mensaje según el estado */}
      {goalMet && (
        <p className="m-0 mb-4 font-semibold text-green-400">
          ¡Objetivo cumplido! Buen trabajo&nbsp;💪
        </p>
      )}

      {target === null && (
        <p className="m-0 mb-4 text-sm text-fg-muted">
          🎯 Sin objetivo semanal.{" "}
          <Link to="/routines" className="font-semibold text-accent">
            Crea una rutina
          </Link>
        </p>
      )}

      {/* Volumen */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-[0.92rem] text-fg-muted">
        <span>🏋️ Volumen semanal</span>
        <strong className="font-bold text-fg tabular-nums">
          {formatKg(volume, 0)} kg
        </strong>
      </div>
    </section>
  );
}
