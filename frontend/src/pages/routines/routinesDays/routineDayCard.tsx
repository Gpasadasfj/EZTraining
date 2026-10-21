import { Link, useNavigate } from "react-router-dom";
import { Pencil, Play, Plus } from "lucide-react";
import useRoutineExercises from "../../../hooks/routines/useRoutineExercises";
import { useWorkoutsCreate } from "../../../hooks/workouts/useWorkouts";
import type { RoutineDay } from "../../../types/routines/routineDays";
import type { RoutineExercise } from "../../../types/routines/routineExercises";
import { formatReps } from "../../../utils/format";

interface RoutineDayCardProps {
  routineId: number;
  day: RoutineDay;
  position: number;
}

export default function RoutineDayCard({
  routineId,
  day,
  position,
}: RoutineDayCardProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRoutineExercises(routineId, day.id);
  const { mutate: startWorkout, isPending } = useWorkoutsCreate();

  const dayUrl = `/routines/${routineId}/days/${day.id}`;
  const exercises: RoutineExercise[] = data?.results ?? [];
  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.target_sets,
    0,
  );

  const handleStart = () => {
    startWorkout(
      { routine_day: day.id },
      { onSuccess: (workout) => navigate(`/workouts/${workout.id}`) },
    );
  };

  return (
    <li className="flex flex-col rounded-xl border border-line bg-surface px-4.5 pt-4 pb-4.5 lg:px-5.5 lg:pt-5 lg:pb-5.5">
      <div className="flex items-start gap-2.5">
        <div className="grid min-w-0 flex-1 gap-1.5">
          <span className="text-xs font-bold tracking-wider text-fg-subtle uppercase">
            Día {position}
          </span>
          <h3 className="font-display text-2xl leading-none font-extrabold uppercase italic wrap-anywhere">
            {day.name}
          </h3>
        </div>
        <Link
          to={dayUrl}
          aria-label={`Editar ${day.name}`}
          className="-mt-1.5 -mr-2 grid size-10 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-hover hover:text-fg active:scale-94"
        >
          <Pencil className="size-4.5" aria-hidden />
        </Link>
      </div>

      {isLoading && (
        <div className="mt-3 grid animate-pulse gap-3 py-2" aria-busy="true">
          <div className="h-3 w-3/4 rounded bg-surface-hover" />
          <div className="h-3 w-2/3 rounded bg-surface-hover" />
          <div className="h-3 w-4/5 rounded bg-surface-hover" />
        </div>
      )}

      {isError && (
        <p className="mt-3 text-sm text-fg-muted">
          No se pudieron cargar los ejercicios.
        </p>
      )}

      {data && exercises.length === 0 && (
        <div className="mt-3 grid justify-items-start gap-2.5 rounded-lg border border-dashed border-line-strong p-3.5 text-fg-muted">
          <p>Este día aún no tiene ejercicios.</p>
          <Link
            to={`${dayUrl}/exercises/new`}
            className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
          >
            <Plus className="size-4" strokeWidth={2.4} aria-hidden />
            Añadir ejercicios
          </Link>
        </div>
      )}

      {exercises.length > 0 && (
        <>
          <ol className="mt-3">
            {exercises.map((exercise, index) => (
              <li
                key={exercise.id}
                className="flex items-baseline gap-2.5 border-t border-line py-3.5"
              >
                <span className="w-5 shrink-0 text-sm font-semibold text-fg-subtle tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 leading-snug font-medium">
                  {exercise.exercise_name}
                </span>
                <span className="shrink-0 font-display text-lg leading-none font-bold whitespace-nowrap tabular-nums">
                  {exercise.target_sets}
                  <span className="mx-1 font-semibold text-fg-subtle">×</span>
                  {formatReps(exercise.min_reps, exercise.max_reps)}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm text-fg-muted">
            <span>
              <b className="font-bold text-fg tabular-nums">
                {exercises.length}
              </b>{" "}
              {exercises.length === 1 ? "ejercicio" : "ejercicios"} ·{" "}
              <b className="font-bold text-fg tabular-nums">{totalSets}</b>{" "}
              {totalSets === 1 ? "serie" : "series"}
            </span>
            <button
              type="button"
              onClick={handleStart}
              disabled={isPending}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary/15 px-4 text-sm font-semibold text-orange-300 transition hover:bg-primary hover:text-on-primary active:scale-97 disabled:opacity-60"
            >
              <Play
                className="size-3.5 fill-current"
                strokeWidth={0}
                aria-hidden
              />
              {isPending ? "Empezando…" : "Empezar"}
            </button>
          </div>
        </>
      )}
    </li>
  );
}
