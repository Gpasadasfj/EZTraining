import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import useRoutineExercises, {
  useDeleteRoutineExercise,
} from "../../../hooks/routines/useRoutineExercises";
import type { RoutineDay } from "../../../types/routines/routineDays";
import type { RoutineExercise } from "../../../types/routines/routineExercises";
import type { Exercise } from "../../../types/exercises";
import { formatReps } from "../../../utils/format";
import ExercisePicker from "./exercisePicker";
import CreateExerciseForm from "./createExerciseForm";
import ExerciseConfigForm from "./exerciseConfigForm";
import { StepIntro, WizardActions } from "./wizardUi";

// Estado del panel para añadir: cerrado, buscando, creando uno nuevo
// o configurando el ejercicio elegido.
type Composer =
  | { mode: "closed" }
  | { mode: "pick" }
  | { mode: "create"; initialName: string }
  | { mode: "config"; exercise: Exercise };

interface StepDayExercisesProps {
  routineId: number;
  routineName: string;
  day: RoutineDay;
  isLastDay: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function StepDayExercises({
  routineId,
  routineName,
  day,
  isLastDay,
  onBack,
  onNext,
}: StepDayExercisesProps) {
  const [composer, setComposer] = useState<Composer>({ mode: "closed" });

  const { data, isLoading, isError } = useRoutineExercises(routineId, day.id);
  const {
    mutate: deleteExercise,
    isPending: isDeleting,
    variables: deletingId,
    error: deleteError,
  } = useDeleteRoutineExercise(routineId, day.id);

  const exercises: RoutineExercise[] = data?.results ?? [];
  // El mayor orden + 1, no la longitud: al borrar quedan huecos y se repetiría un orden.
  const nextOrder =
    Math.max(0, ...exercises.map((exercise) => exercise.order)) + 1;

  return (
    <>
      <div className="grid gap-5.5 pt-3.5 lg:px-7 lg:pt-5.5">
        <StepIntro
          eyebrow={routineName}
          title={day.name}
          subtitle="Añade los ejercicios en el orden en que los harás."
        />

        {isLoading && (
          <div className="grid animate-pulse gap-2" aria-busy="true">
            <div className="h-16 rounded-lg bg-surface lg:bg-canvas" />
            <div className="h-16 rounded-lg bg-surface lg:bg-canvas" />
          </div>
        )}

        {isError && (
          <p className="text-fg-muted">
            No se pudieron cargar los ejercicios de este día.
          </p>
        )}

        {exercises.length > 0 && (
          <ol className="grid gap-2">
            {exercises.map((exercise) => {
              const isRemoving = isDeleting && deletingId === exercise.id;

              return (
                <li
                  key={exercise.id}
                  className={`flex min-h-16 items-center gap-3 rounded-lg border border-line bg-surface py-2.5 pr-1.5 pl-3.5 transition duration-200 ease-out starting:-translate-y-1.5 starting:opacity-0 motion-reduce:transition-none lg:bg-canvas ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  <div className="grid min-w-0 flex-1 gap-0.5">
                    <span className="leading-snug font-semibold wrap-anywhere">
                      {exercise.exercise_name}
                    </span>
                    <span className="text-sm text-fg-muted">
                      RIR {exercise.target_rir} · {exercise.rest_time} s de
                      descanso
                    </span>
                  </div>
                  <span className="shrink-0 font-display text-lg leading-none font-bold whitespace-nowrap tabular-nums">
                    {exercise.target_sets}
                    <span className="mx-1 font-semibold text-fg-subtle">×</span>
                    {formatReps(exercise.min_reps, exercise.max_reps)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExercise(exercise.id)}
                    disabled={isRemoving}
                    aria-label={`Quitar ${exercise.exercise_name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-red-500/10 hover:text-red-400 active:scale-94 disabled:cursor-wait"
                  >
                    <Trash2 className="size-4.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {composer.mode === "closed" && (
          <button
            type="button"
            onClick={() => setComposer({ mode: "pick" })}
            className="flex h-13.5 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong font-semibold text-accent transition hover:border-primary/45 hover:bg-primary/15"
          >
            <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
            {exercises.length > 0
              ? "Añadir otro ejercicio"
              : "Añadir ejercicio"}
          </button>
        )}

        {composer.mode === "pick" && (
          <ExercisePicker
            onPick={(exercise) => setComposer({ mode: "config", exercise })}
            onCreate={(name) =>
              setComposer({ mode: "create", initialName: name })
            }
            onCancel={() => setComposer({ mode: "closed" })}
          />
        )}

        {composer.mode === "create" && (
          <CreateExerciseForm
            initialName={composer.initialName}
            onCreated={(exercise) => setComposer({ mode: "config", exercise })}
            onBack={() => setComposer({ mode: "pick" })}
            onCancel={() => setComposer({ mode: "closed" })}
          />
        )}

        {composer.mode === "config" && (
          <ExerciseConfigForm
            routineId={routineId}
            dayId={day.id}
            exercise={composer.exercise}
            order={nextOrder}
            onChangeExercise={() => setComposer({ mode: "pick" })}
            onCancel={() => setComposer({ mode: "closed" })}
            onSaved={() => setComposer({ mode: "closed" })}
          />
        )}

        {!isLoading && exercises.length === 0 && composer.mode === "closed" && (
          <p className="text-sm text-fg-subtle">
            Si aún no lo tienes claro, sigue sin ejercicios y complétalo luego
            desde la rutina.
          </p>
        )}

        {deleteError && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
          >
            No se pudo quitar el ejercicio: {deleteError.message}
          </p>
        )}
      </div>

      <WizardActions
        onBack={onBack}
        onNext={onNext}
        nextLabel={isLastDay ? "Terminar" : "Siguiente día"}
        nextDisabled={composer.mode !== "closed"}
      />
    </>
  );
}
