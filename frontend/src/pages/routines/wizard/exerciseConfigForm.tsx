import React, { useState } from "react";
import { Check } from "lucide-react";
import { useCreateRoutineExercise } from "../../../hooks/routines/useRoutineExercises";
import type { Exercise } from "../../../types/exercises";
import { composerFieldClass } from "./wizardUi";

// Los inputs trabajan con texto para poder quedarse vacíos mientras el usuario escribe.
interface ConfigValues {
  sets: string;
  minReps: string;
  maxReps: string;
  rir: string;
  rest: string;
}

const DEFAULTS: ConfigValues = {
  sets: "3",
  minReps: "8",
  maxReps: "12",
  rir: "2",
  rest: "180",
};

function toInt(value: string) {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
}

// Convierte el formulario al formato de la API, o null si falta algún número.
function parseConfig(values: ConfigValues) {
  const sets = toInt(values.sets);
  const minReps = toInt(values.minReps);
  const maxReps = toInt(values.maxReps);
  const rir = toInt(values.rir);
  const rest = toInt(values.rest);

  if (
    sets === null ||
    minReps === null ||
    maxReps === null ||
    rir === null ||
    rest === null
  ) {
    return null;
  }
  return {
    target_sets: sets,
    min_reps: minReps,
    max_reps: maxReps,
    target_rir: rir,
    rest_time: rest,
  };
}

interface ExerciseConfigFormProps {
  routineId: number;
  dayId: number;
  exercise: Exercise;
  order: number;
  onChangeExercise: () => void;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ExerciseConfigForm({
  routineId,
  dayId,
  exercise,
  order,
  onChangeExercise,
  onCancel,
  onSaved,
}: ExerciseConfigFormProps) {
  const [values, setValues] = useState<ConfigValues>(DEFAULTS);
  const {
    mutate: createExercise,
    isPending,
    error,
  } = useCreateRoutineExercise(routineId, dayId);

  const config = parseConfig(values);
  const repsError =
    config && config.min_reps > config.max_reps
      ? "Las repeticiones máximas no pueden ser menos que las mínimas."
      : null;
  const isValid =
    config !== null &&
    config.target_sets >= 1 &&
    config.min_reps >= 1 &&
    config.target_rir >= 0 &&
    config.rest_time >= 0 &&
    !repsError;

  const update =
    (field: keyof ConfigValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!config || !isValid || isPending) return;

    createExercise(
      { exercise: exercise.id, order, ...config },
      { onSuccess: onSaved },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid animate-fade-in gap-4 rounded-xl border border-line-strong bg-surface p-3.5 shadow-xl shadow-black/40 lg:bg-canvas"
    >
      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3.5 py-3 lg:bg-surface">
        <div className="grid min-w-0 gap-0.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-fg-subtle">
            {exercise.is_custom && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold tracking-wide text-orange-300 uppercase">
                Tuyo
              </span>
            )}
            {exercise.muscle}
          </span>
          <strong className="font-semibold wrap-anywhere">
            {exercise.name_es}
          </strong>
        </div>
        <button
          type="button"
          onClick={onChangeExercise}
          className="shrink-0 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Cambiar
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2.5">
        <NumberField
          className="col-span-2"
          id="cfg-sets"
          label="Series"
          value={values.sets}
          onChange={update("sets")}
          min={1}
        />
        <NumberField
          className="col-span-2"
          id="cfg-min"
          label="Reps mín"
          value={values.minReps}
          onChange={update("minReps")}
          min={1}
        />
        <NumberField
          className="col-span-2"
          id="cfg-max"
          label="Reps máx"
          value={values.maxReps}
          onChange={update("maxReps")}
          min={1}
        />
        <NumberField
          className="col-span-3"
          id="cfg-rir"
          label="RIR"
          value={values.rir}
          onChange={update("rir")}
          min={0}
        />
        <NumberField
          className="col-span-3"
          id="cfg-rest"
          label="Descanso (s)"
          value={values.rest}
          onChange={update("rest")}
          min={0}
          step={15}
        />
      </div>

      {repsError && <p className="text-sm text-red-300">{repsError}</p>}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
        >
          No se pudo añadir el ejercicio: {error.message}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg px-4 text-sm font-semibold text-fg-muted transition hover:bg-surface-hover hover:text-fg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:active:scale-100"
        >
          <Check className="size-4" strokeWidth={2.6} aria-hidden />
          {isPending ? "Añadiendo…" : "Añadir"}
        </button>
      </div>
    </form>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  step?: number;
  className?: string;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  step,
  className = "",
}: NumberFieldProps) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-fg-muted">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        className={`${composerFieldClass} h-12 px-1.5 text-center font-semibold tabular-nums`}
      />
    </div>
  );
}
