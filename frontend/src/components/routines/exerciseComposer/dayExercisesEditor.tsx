import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import useRoutineExercises, {
  useDeleteRoutineExercise,
} from "../../../hooks/routines/useRoutineExercises";
import type { Exercise } from "../../../types/exercises";
import type { RoutineExercise } from "../../../types/routines/routineExercises";
import { formatReps } from "../../../utils/format";
import ExercisePicker from "./exercisePicker";
import CreateExerciseForm from "./createExerciseForm";
import ExerciseConfigForm from "./exerciseConfigForm";
import ExerciseThumb from "../../exercises/exerciseThumb";

// Solo puede haber un panel abierto a la vez.
type Panel =
  | { mode: "closed" }
  | { mode: "pick" }
  | { mode: "create"; initialName: string }
  | { mode: "config"; exercise: Exercise }
  | { mode: "edit"; routineExercise: RoutineExercise };

interface DayExercisesEditorProps {
  routineId: number;
  dayId: number;
  emptyHint: string;
  // Avisa al padre de si hay un panel abierto (el asistente desactiva «Siguiente»).
  onPanelOpenChange?: (open: boolean) => void;
}

// Lista de ejercicios de un día con todo lo necesario para añadir, editar y quitar.
// La usan el asistente de creación y la página «Editar día».
export default function DayExercisesEditor({
  routineId,
  dayId,
  emptyHint,
  onPanelOpenChange,
}: DayExercisesEditorProps) {
  const [panel, setPanel] = useState<Panel>({ mode: "closed" });

  const changePanel = (next: Panel) => {
    setPanel(next);
    onPanelOpenChange?.(next.mode !== "closed");
  };
  const closePanel = () => changePanel({ mode: "closed" });

  const { data, isLoading, isError } = useRoutineExercises(routineId, dayId);
  const {
    mutate: deleteExercise,
    isPending: isDeleting,
    variables: deletingId,
    error: deleteError,
  } = useDeleteRoutineExercise(routineId, dayId);

  const exercises: RoutineExercise[] = data?.results ?? [];
  // El mayor orden + 1, no la longitud: al borrar quedan huecos y se repetiría un orden.
  const nextOrder =
    Math.max(0, ...exercises.map((exercise) => exercise.order)) + 1;

  return (
    <div className="grid gap-4">
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
            // El ejercicio que se está editando se sustituye por su formulario.
            if (
              panel.mode === "edit" &&
              panel.routineExercise.id === exercise.id
            ) {
              return (
                <li key={exercise.id}>
                  <ExerciseConfigForm
                    mode="edit"
                    routineId={routineId}
                    dayId={dayId}
                    routineExercise={exercise}
                    onCancel={closePanel}
                    onSaved={closePanel}
                  />
                </li>
              );
            }

            const isRemoving = isDeleting && deletingId === exercise.id;

            return (
              <li
                key={exercise.id}
                className={`flex min-h-16 items-center gap-3 rounded-lg border border-line bg-surface py-2 pr-1.5 pl-2 transition duration-200 ease-out starting:-translate-y-1.5 starting:opacity-0 motion-reduce:transition-none lg:bg-canvas ${
                  isRemoving ? "opacity-50" : ""
                }`}
              >
                <ExerciseThumb src={exercise.exercise_image} />
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
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      changePanel({ mode: "edit", routineExercise: exercise })
                    }
                    aria-label={`Editar ${exercise.exercise_name}`}
                    className="grid size-10 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-hover hover:text-fg active:scale-94"
                  >
                    <Pencil className="size-4.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteExercise(exercise.id)}
                    disabled={isRemoving}
                    aria-label={`Quitar ${exercise.exercise_name}`}
                    className="grid size-10 place-items-center rounded-lg text-fg-subtle transition hover:bg-red-500/10 hover:text-red-400 active:scale-94 disabled:cursor-wait"
                  >
                    <Trash2 className="size-4.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {panel.mode === "closed" && (
        <button
          type="button"
          onClick={() => changePanel({ mode: "pick" })}
          className="flex h-13.5 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong font-semibold text-accent transition hover:border-primary/45 hover:bg-primary/15"
        >
          <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
          {exercises.length > 0 ? "Añadir otro ejercicio" : "Añadir ejercicio"}
        </button>
      )}

      {panel.mode === "pick" && (
        <ExercisePicker
          onPick={(exercise) => changePanel({ mode: "config", exercise })}
          onCreate={(name) =>
            changePanel({ mode: "create", initialName: name })
          }
          onCancel={closePanel}
        />
      )}

      {panel.mode === "create" && (
        <CreateExerciseForm
          initialName={panel.initialName}
          onCreated={(exercise) => changePanel({ mode: "config", exercise })}
          onBack={() => changePanel({ mode: "pick" })}
          onCancel={closePanel}
        />
      )}

      {panel.mode === "config" && (
        <ExerciseConfigForm
          mode="create"
          routineId={routineId}
          dayId={dayId}
          exercise={panel.exercise}
          order={nextOrder}
          onChangeExercise={() => changePanel({ mode: "pick" })}
          onCancel={closePanel}
          onSaved={closePanel}
        />
      )}

      {!isLoading && exercises.length === 0 && panel.mode === "closed" && (
        <p className="text-sm text-fg-subtle">{emptyHint}</p>
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
  );
}
