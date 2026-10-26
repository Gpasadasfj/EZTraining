import { useState } from "react";
import { Check, History, Info } from "lucide-react";
import ExerciseThumb from "../exercises/exerciseThumb";
import useWorkoutSets, {
  useUpdateWorkoutSet,
} from "../../hooks/workouts/useWorkoutSets";
import { usePreviousWorkoutExercise } from "../../hooks/workouts/useWorkoutExercises";
import type { WorkoutExercise } from "../../types/workouts/workoutExercises";
import type {
  SetField,
  SetStatus,
  WorkoutSet,
} from "../../types/workouts/workoutSets";
import { formatDecimal, formatReps, formatRest } from "../../utils/format";
import WorkoutExerciseCard from "./workoutExerciseCard";
import SetRow from "./setRow";

type SetForm = Record<SetField, string>;

interface WorkoutExerciseItemProps {
  workoutId: number;
  exercise: WorkoutExercise;
  onSetCompleted: (exercise: WorkoutExercise) => void;
  onShowInfo: (slug: string) => void;
}

// Valores guardados en el backend → texto para los inputs
const toForm = (set: WorkoutSet): SetForm => ({
  weight: formatDecimal(set.weight),
  reps: formatDecimal(set.reps),
  rir: set.rir?.toString() ?? "",
});

// Texto del input → número o null para el backend
const toNumber = (value: string) =>
  value === "" ? null : Number(value.replace(",", "."));

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

const toolClass =
  "grid size-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg aria-pressed:bg-primary-soft aria-pressed:text-accent";

export default function WorkoutExerciseItem({
  workoutId,
  exercise,
  onSetCompleted,
  onShowInfo,
}: WorkoutExerciseItemProps) {
  const [forms, setForms] = useState<Record<number, SetForm>>({});
  const [showPrevious, setShowPrevious] = useState(false);

  const { data, isLoading, isError } = useWorkoutSets(workoutId, exercise.id);
  const {
    mutate,
    isPending,
    variables,
    isError: isSaveError,
  } = useUpdateWorkoutSet(workoutId, exercise.id);
  const previous = usePreviousWorkoutExercise(
    workoutId,
    exercise.id,
    showPrevious,
  );

  // El backend no ordena las series
  const sets = [...(data?.results ?? [])].sort(
    (a, b) => a.set_number - b.set_number,
  );
  const currentIndex = sets.findIndex((set) => !set.completed);
  const allDone = sets.length > 0 && currentIndex === -1;

  const getForm = (set: WorkoutSet) => forms[set.id] ?? toForm(set);

  const statusOf = (set: WorkoutSet, index: number): SetStatus => {
    if (set.completed) return "done";
    return index === currentIndex ? "current" : "pending";
  };

  const handleChange = (set: WorkoutSet, field: SetField, value: string) => {
    setForms((prev) => ({
      ...prev,
      [set.id]: { ...(prev[set.id] ?? toForm(set)), [field]: value },
    }));
  };

  const handleSave = (set: WorkoutSet) => {
    // El check de una serie hecha la desmarca
    if (set.completed) {
      mutate({ setId: set.id, data: { completed: false } });
      return;
    }

    const form = getForm(set);
    mutate(
      {
        setId: set.id,
        data: {
          weight: form.weight.replace(",", "."),
          reps: toNumber(form.reps),
          rir: toNumber(form.rir),
          completed: true,
        },
      },
      { onSuccess: () => onSetCompleted(exercise) },
    );
  };

  // Último entreno: mínimo una fila por serie objetivo; si la última vez hizo más, se muestran todas
  const previousSets = previous.data?.sets ?? [];
  const previousBySet = new Map(
    previousSets.map((set) => [set.set_number, set]),
  );
  const previousRows = Math.max(
    sets.length,
    ...previousSets.map((set) => set.set_number),
  );

  const previousLabel = () => {
    if (previous.isLoading) return "Cargando…";
    if (previous.isError) return "No se pudo cargar";
    if (!previous.data?.finished_at) return "Aún no lo has hecho";
    return (
      <>
        Último entreno ·{" "}
        <b className="font-semibold text-fg">
          {formatDay(previous.data.finished_at)}
        </b>
      </>
    );
  };

  const subtitle = showPrevious ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-accent">
      <History className="size-3.5" aria-hidden="true" />
      {previousLabel()}
    </span>
  ) : (
    <>
      <b className="font-semibold text-fg">
        {exercise.target_sets} ×{" "}
        {formatReps(exercise.min_reps, exercise.max_reps)}
      </b>{" "}
      · RIR {exercise.target_rir} · {formatRest(exercise.rest_time)}
    </>
  );

  const media = allDone ? (
    <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-success/35 bg-success/10 text-success">
      <Check className="size-6" strokeWidth={3} aria-hidden="true" />
    </span>
  ) : (
    <ExerciseThumb src={exercise.exercise_image} />
  );

  const actions = (
    <>
      <button
        type="button"
        onClick={() => setShowPrevious((value) => !value)}
        aria-pressed={showPrevious}
        aria-label={
          showPrevious ? "Volver a tus series" : "Ver el último entreno"
        }
        title="Último entreno"
        className={toolClass}
      >
        <History className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onShowInfo(exercise.exercise_slug)}
        aria-haspopup="dialog"
        aria-label={`Información de ${exercise.exercise_name}`}
        title="Información"
        className={toolClass}
      >
        <Info className="size-5" aria-hidden="true" />
      </button>
    </>
  );

  return (
    <WorkoutExerciseCard
      exercise={exercise}
      media={media}
      subtitle={subtitle}
      actions={actions}
    >
      {isLoading && (
        <li className="px-2 py-3 text-sm text-fg-muted">Cargando series…</li>
      )}
      {isError && (
        <li className="px-2 py-3 text-sm text-fg-muted">
          No se pudieron cargar las series.
        </li>
      )}

      {showPrevious
        ? Array.from({ length: previousRows }, (_, index) => {
            const set = previousBySet.get(index + 1);
            return (
              <SetRow
                key={`previous-${index}`}
                setNumber={index + 1}
                weight={formatDecimal(set?.weight ?? null)}
                reps={formatDecimal(set?.reps ?? null)}
                rir={set?.rir?.toString() ?? ""}
                status="pending"
                repsPlaceholder=""
                rirPlaceholder=""
                readOnly
              />
            );
          })
        : sets.map((set, index) => {
            const form = getForm(set);
            return (
              <SetRow
                key={set.id}
                setNumber={set.set_number}
                weight={form.weight}
                reps={form.reps}
                rir={form.rir}
                status={statusOf(set, index)}
                repsPlaceholder={formatReps(
                  exercise.min_reps,
                  exercise.max_reps,
                )}
                rirPlaceholder={String(exercise.target_rir)}
                isSaving={isPending && variables?.setId === set.id}
                onChange={(field, value) => handleChange(set, field, value)}
                onSave={() => handleSave(set)}
              />
            );
          })}

      {isSaveError && !showPrevious && (
        <li role="alert" className="px-2 text-sm text-red-400">
          No se pudo guardar la serie. Revisa el peso y las repeticiones.
        </li>
      )}
    </WorkoutExerciseCard>
  );
}
