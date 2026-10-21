import { Link } from "react-router-dom";
import { Calendar, ChevronRight, List, Repeat } from "lucide-react";
import PulseLine from "../pulseLine";
import RoutineMenu from "./routineMenu";
import type { Routine } from "../../types/routines/routines";

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

export default function RoutineCard({ routine }: { routine: Routine }) {
  const isActive = routine.is_active === true;
  const iconClass = `size-3.5 ${isActive ? "text-accent" : "text-fg-subtle"}`;

  const stats = [
    {
      icon: Calendar,
      value: routine.n_days,
      label: plural(routine.n_days, "día", "días"),
    },
    {
      icon: List,
      value: routine.n_exercises,
      label: plural(routine.n_exercises, "ejercicio", "ejercicios"),
    },
    {
      icon: Repeat,
      value: routine.n_sets,
      label: plural(routine.n_sets, "serie", "series"),
    },
  ];

  return (
    <li
      className={`group relative flex flex-col gap-3.5 rounded-card border p-4.5 pt-18 transition-colors duration-150 lg:p-5.5 lg:pt-20 ${
        isActive
          ? "border-primary/30 bg-surface bg-[radial-gradient(80%_140%_at_100%_0%,rgb(249_115_22/0.16),transparent_60%)] hover:border-primary/50"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      {/* Toda la tarjeta abre la rutina */}
      <Link
        to={`/routines/${routine.id}`}
        aria-label={`Ver rutina ${routine.name}`}
        className="absolute inset-0 z-1 rounded-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      />

      <PulseLine
        beats={[0.62]}
        beatWidth={84}
        amplitude={20}
        animated={isActive}
        baseClassName={
          isActive
            ? "stroke-primary/50 stroke-2"
            : "stroke-line-strong stroke-2"
        }
        className="absolute inset-x-0 top-2.5 h-13 overflow-hidden lg:top-3 lg:h-14"
      />

      <div className="flex items-start gap-2.5">
        <div className="grid min-w-0 flex-1 gap-1.5">
          <h2 className="m-0 font-display text-[1.65rem] leading-none font-extrabold uppercase italic wrap:anywhere lg:text-[1.9rem]">
            {routine.name}
          </h2>
          {isActive && (
            <span className="inline-flex h-5.5 items-center gap-1.5 justify-self-start rounded-full bg-success/15 px-2.5 text-[0.72rem] font-bold tracking-[0.04em] text-green-400 uppercase">
              <span
                className="size-1.75 rounded-full bg-success"
                aria-hidden="true"
              />
              En uso
            </span>
          )}
        </div>
        <RoutineMenu routineId={routine.id} routineName={routine.name} />
      </div>

      {routine.description && (
        <p className="m-0 line-clamp-2 max-w-[60ch] text-fg-muted">
          {routine.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-fg-muted">
        <ul className="m-0 flex min-w-0 list-none flex-wrap items-center gap-x-2.5 gap-y-1 p-0 text-[0.82rem]">
          {stats.map(({ icon: Icon, value, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 whitespace-nowrap"
            >
              <Icon className={iconClass} aria-hidden="true" />
              <b className="font-bold text-fg tabular-nums">{value}</b> {label}
            </li>
          ))}
        </ul>
        <span
          className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap transition-colors ${
            isActive ? "text-accent" : "text-fg-subtle group-hover:text-fg"
          }`}
        >
          <span className="hidden lg:inline">Ver rutina</span>
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </span>
      </div>
    </li>
  );
}
