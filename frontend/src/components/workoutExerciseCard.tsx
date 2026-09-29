import type { ReactNode } from "react";
import { Timer } from "lucide-react";
import type { WorkoutExercise } from "../types/workouts/workoutExercises";
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
  dayName: string;
  exercise: CardExercise;
  children: ReactNode;
}

const formatRest = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) return `${secs} s`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} s`;
};

export default function WorkoutExerciseCard({
  dayName,
  exercise,
  children,
}: WorkoutExerciseCardProps) {
  return (
    <article className="grid gap-4 rounded-card border border-line bg-surface p-4">
      <header className="grid gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
            {dayName}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted tabular-nums">
            <Timer className="size-4" aria-hidden="true" />
            {formatRest(exercise.rest_time)}
          </span>
        </div>

        <h3 className="font-display text-2xl leading-tight font-bold">
          {exercise.exercise_name}
        </h3>

        <p className="text-sm text-fg-muted tabular-nums">
          {exercise.target_sets} series · {exercise.min_reps}-{exercise.max_reps} repeticiones · RIR {exercise.target_rir}
        </p>
      </header>

      <div
        className={`${SET_GRID} border border-transparent px-2 text-xs tracking-wide text-fg-muted uppercase font-semibold`}
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
