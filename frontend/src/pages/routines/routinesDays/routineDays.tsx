import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import useRoutineDays from "../../../hooks/routines/useRoutineDays";
import type { RoutineDay } from "../../../types/routines/routineDays";
import RoutineDayCard from "./routineDayCard";

interface RoutineDaysProps {
  routineId: number;
}

export default function RoutineDays({ routineId }: RoutineDaysProps) {
  const { data, isLoading, isError, error, refetch } =
    useRoutineDays(routineId);
  const newDayUrl = `/routines/${routineId}/days/new`;

  if (isLoading) {
    return (
      <div
        className="grid animate-pulse grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
        aria-busy="true"
      >
        <div className="h-72 rounded-xl border border-line bg-surface" />
        <div className="h-72 rounded-xl border border-line bg-surface" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="text-fg-muted">
          No se pudieron cargar los días: {error.message}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-10 rounded-lg border border-line-strong px-4 font-semibold transition hover:bg-surface-hover"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  if (data.results.length === 0) {
    return (
      <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-5 py-8 text-center">
        <span
          className="grid size-14 place-items-center rounded-2xl bg-surface-hover text-3xl"
          aria-hidden
        >
          🗓️
        </span>
        <h2 className="font-display text-2xl leading-none font-extrabold uppercase italic">
          Añade el primer día
        </h2>
        <p className="max-w-xs text-fg-muted">
          Cada día agrupa los ejercicios de una sesión: Push, Pull, Pierna…
        </p>
        <Link
          to={newDayUrl}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97"
        >
          <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
          Añadir día
        </Link>
      </div>
    );
  }

  return (
    <section aria-labelledby="days-title" className="grid gap-3">
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <h2
          id="days-title"
          className="flex items-baseline gap-2 text-lg font-semibold"
        >
          Días
          <span className="text-sm font-medium text-fg-subtle tabular-nums">
            {data.count}
          </span>
        </h2>
        <Link
          to={newDayUrl}
          className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
        >
          <Plus className="size-4" strokeWidth={2.4} aria-hidden />
          Añadir día
        </Link>
      </div>

      <ol className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {data.results.map((day: RoutineDay, index: number) => (
          <RoutineDayCard
            key={day.id}
            routineId={routineId}
            day={day}
            position={index + 1}
          />
        ))}
      </ol>
    </section>
  );
}
