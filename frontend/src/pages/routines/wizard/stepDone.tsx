import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useRoutineDetail } from "../../../hooks/routines/useRoutines";
import useRoutineExercises from "../../../hooks/routines/useRoutineExercises";
import type { RoutineDay } from "../../../types/routines/routineDays";
import type { RoutineExercise } from "../../../types/routines/routineExercises";
import type { RoutineValues } from "../../../types/routines/wizard";
import { formatReps } from "../../../utils/format";
import { StepIntro, WizardActions } from "./wizardUi";

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

interface StepDoneProps {
  routineId: number;
  routineValues: RoutineValues;
  days: RoutineDay[];
  onFinish: () => void;
}

export default function StepDone({ routineId, routineValues, days, onFinish }: StepDoneProps) {
  const queryClient = useQueryClient();
  const { data: routine } = useRoutineDetail(routineId);

  // Los días y ejercicios se crearon uno a uno y no refrescan la lista de rutinas:
  // la invalidamos para que sus contadores salgan actualizados al volver a ella.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["routines"] });
  }, [queryClient]);

  return (
    <>
      <div className="grid gap-5.5 pt-3.5 lg:px-7 lg:pt-5.5">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <StepIntro
              eyebrow="¡Hecho!"
              title="Rutina lista"
              subtitle="Ya está guardada. Puedes empezar a entrenar con ella o seguir ajustándola desde su detalle."
            />
          </div>
          <span className="grid size-14 shrink-0 animate-pop-in place-items-center rounded-full bg-green-500/15 text-green-400 motion-reduce:animate-none lg:size-16">
            <Check className="size-7 lg:size-8" strokeWidth={2.6} aria-hidden />
          </span>
        </div>

        <section
          aria-label={`Resumen de ${routineValues.name}`}
          className="overflow-hidden rounded-xl border border-line bg-surface lg:bg-canvas"
        >
          <header className="grid gap-2 px-4 pt-4 pb-3.5">
            <h2 className="font-display text-2xl leading-none font-extrabold uppercase italic wrap-anywhere">
              {routineValues.name}
            </h2>
            {routineValues.description && (
              <p className="text-sm text-pretty text-fg-muted">{routineValues.description}</p>
            )}
            {routine && (
              <p className="text-sm text-fg-muted">
                <b className="font-bold text-fg tabular-nums">{routine.n_days}</b>{" "}
                {plural(routine.n_days, "día", "días")} ·{" "}
                <b className="font-bold text-fg tabular-nums">{routine.n_exercises}</b>{" "}
                {plural(routine.n_exercises, "ejercicio", "ejercicios")} ·{" "}
                <b className="font-bold text-fg tabular-nums">{routine.n_sets}</b>{" "}
                {plural(routine.n_sets, "serie", "series")}
              </p>
            )}
          </header>

          <ol>
            {days.map((day, index) => (
              <DaySummary key={day.id} routineId={routineId} day={day} position={index + 1} />
            ))}
          </ol>
        </section>
      </div>

      <WizardActions onNext={onFinish} nextLabel="Ver rutina" showArrow={false} />
    </>
  );
}

interface DaySummaryProps {
  routineId: number;
  day: RoutineDay;
  position: number;
}

// Cada día pide sus ejercicios. Ya se cargaron en los pasos anteriores,
// así que React Query los devuelve de su caché al instante.
function DaySummary({ routineId, day, position }: DaySummaryProps) {
  const { data, isLoading } = useRoutineExercises(routineId, day.id);
  const exercises: RoutineExercise[] = data?.results ?? [];

  return (
    <li className="grid gap-2 border-t border-line px-4 py-3.5">
      <div className="flex items-baseline gap-3">
        <span className="w-12 shrink-0 text-xs font-bold tracking-wider text-fg-subtle uppercase">
          Día {position}
        </span>
        <span className="min-w-0 flex-1 font-semibold wrap-anywhere">{day.name}</span>
      </div>

      {isLoading ? (
        <div className="ml-15 h-4 w-2/3 animate-pulse rounded bg-surface-hover" aria-busy="true" />
      ) : exercises.length === 0 ? (
        <p className="pl-15 text-sm text-amber-400">Sin ejercicios: añádelos desde la rutina.</p>
      ) : (
        <ul className="grid gap-1.5 pl-15">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 text-fg-muted">{exercise.exercise_name}</span>
              <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">
                {exercise.target_sets}
                <span className="mx-0.5 text-fg-subtle">×</span>
                {formatReps(exercise.min_reps, exercise.max_reps)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}