import type { ReactNode } from "react";
import { Timer } from "lucide-react";
import type { WorkoutExercise } from "../../types/workouts/workoutExercises";
import { formatRest } from "../../utils/format";
import { SET_GRID } from "./setRow";

type CardExercise = Pick<
  WorkoutExercise,
  | "exercise_name"
  | "target_sets"
  | "min_reps"
  | "max_reps"
  | "target_rir"
  | "rest_time"
>;

interface WorkoutExerciseCardProps {
  exercise: CardExercise;
  children: ReactNode;
  dayName?: string;
  media?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export default function WorkoutExerciseCard({
  exercise,
  children,
  dayName,
  media,
  subtitle,
  actions,
}: WorkoutExerciseCardProps) {
  return (
    <article className="grid gap-4 rounded-card border border-line bg-surface p-4">
      <header className="grid gap-1">
        {dayName && (
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
              {dayName}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted tabular-nums">
              <Timer className="size-4" aria-hidden="true" />
              {formatRest(exercise.rest_time)}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {media}

          <div className="grid min-w-0 flex-1 gap-1">
            <h3 className="font-display text-2xl leading-tight font-bold">
              {exercise.exercise_name}
            </h3>

            <div className="text-sm text-fg-muted tabular-nums">
              {subtitle ??
                `${exercise.target_sets} series · ${exercise.min_reps}-${exercise.max_reps} repeticiones · RIR ${exercise.target_rir}`}
            </div>
          </div>

          {actions && (
            <div className="-mt-1 -mr-1 flex shrink-0 gap-0.5">{actions}</div>
          )}
        </div>
      </header>

      <div
        className={`${SET_GRID} border border-transparent px-2 text-xs font-semibold tracking-wide text-fg-muted uppercase`}
      >
        <span className="text-center">Serie</span>
        <span className="text-center">Peso</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RIR</span>
        <span aria-hidden="true" />
      </div>

      <ul className="grid gap-1.5">{children}</ul>
    </article>
  );
}
