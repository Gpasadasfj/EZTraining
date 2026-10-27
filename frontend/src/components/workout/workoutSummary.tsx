import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useWorkoutSummary } from "../../hooks/workouts/useWorkouts";
import { formatDecimal, formatDuration, formatKg } from "../../utils/format";

interface StatProps {
  label: string;
  value: string;
  unit?: string;
}

function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="grid gap-1 rounded-card border border-line bg-surface p-3 lg:p-4">
      <span className="text-xs text-fg-muted">{label}</span>
      <strong className="font-display text-3xl leading-none font-bold tabular-nums lg:text-4xl">
        {value}
        {unit && (
          <span className="ml-1 font-sans text-sm font-medium text-fg-muted not-italic">
            {unit}
          </span>
        )}
      </strong>
    </div>
  );
}

export default function WorkoutSummary({ workoutId }: { workoutId: number }) {
  const { data: summary, isLoading, isError } = useWorkoutSummary(workoutId);

  if (isLoading) return <p className="text-fg-muted">Cargando resumen…</p>;
  if (isError || !summary)
    return <p className="text-fg-muted">No se pudo cargar el resumen.</p>;

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header className="flex items-start gap-4">
        <div className="grid min-w-0 flex-1 gap-2">
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">
            {summary.routine_name} · {summary.routine_day_name}
          </span>
          <h1 className="font-display text-4xl leading-none font-bold italic uppercase lg:text-5xl">
            Entreno completado
          </h1>
          <p className="text-fg-muted">
            Buen trabajo. Tu resumen de la semana ya está actualizado.
          </p>
        </div>
        <span className="grid size-14 shrink-0 animate-pop-in place-items-center rounded-full bg-success/15 text-success motion-reduce:animate-none lg:size-16">
          <Check
            className="size-7 lg:size-8"
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        <Stat
          label="Duración"
          value={
            summary.duration_seconds === null
              ? "–"
              : formatDuration(summary.duration_seconds)
          }
        />
        <Stat
          label="Series"
          value={String(summary.completed_sets)}
          unit={`/${summary.total_sets}`}
        />
        <Stat
          label="Volumen"
          value={formatKg(Number(summary.volume ?? 0), 0)}
          unit="kg"
        />
      </div>

      <ul className="divide-y divide-line rounded-card border border-line bg-surface">
        {summary.exercises.map((exercise) => (
          <li key={exercise.id} className="grid gap-1 px-4 py-3">
            <span className="font-semibold">{exercise.exercise_name}</span>
            {exercise.sets.length > 0 ? (
              <span className="text-sm text-fg-muted tabular-nums">
                {exercise.sets
                  .map(
                    (set) =>
                      `${formatDecimal(set.weight)}×${formatDecimal(set.reps)}`,
                  )
                  .join(" · ")}
              </span>
            ) : (
              <span className="text-sm text-amber-400">
                Sin series completadas
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link
        to="/"
        className="inline-flex h-12 items-center justify-center rounded-button bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[background-color,scale] duration-150 hover:bg-primary-hover active:scale-97"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
