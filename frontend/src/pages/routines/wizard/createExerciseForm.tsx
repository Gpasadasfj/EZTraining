import React, { useState } from "react";
import { isAxiosError } from "axios";
import { Check, Lock } from "lucide-react";
import { useCreateExercise, useMuscles } from "../../../hooks/useExercises";
import type { Exercise } from "../../../types/exercises";
import { composerFieldClass } from "./wizardUi";
import { capitalize } from "../../../utils/format";

interface CreateExerciseFormProps {
  initialName: string;
  onCreated: (exercise: Exercise) => void;
  onBack: () => void;
  onCancel: () => void;
}

// Formulario corto: solo lo obligatorio. Instrucciones, foto y demás
// se añaden después desde Ejercicios, para no sacar al usuario de la rutina.
export default function CreateExerciseForm({
  initialName,
  onCreated,
  onBack,
  onCancel,
}: CreateExerciseFormProps) {
  const [name, setName] = useState(initialName);
  const [muscleId, setMuscleId] = useState<number | null>(null);

  const { data: muscles, isLoading: isLoadingMuscles } = useMuscles();
  const { mutate: createExercise, isPending, error } = useCreateExercise();

  // El backend responde 400 con { name: ["Ya tienes un ejercicio con ese nombre."] }
  const nameError: string | undefined = isAxiosError(error)
    ? error.response?.data?.name?.[0]
    : undefined;
  const canSubmit = name.trim().length > 0 && muscleId !== null && !isPending;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit || muscleId === null) return;

    createExercise(
      { name: capitalize(name.trim()), muscle: muscleId },
      { onSuccess: onCreated },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid animate-fade-in gap-4 rounded-xl border border-line-strong bg-surface p-3.5 shadow-xl shadow-black/40 lg:bg-canvas"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">Nuevo ejercicio</p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Volver a la lista
        </button>
      </div>

      <div className="grid gap-2">
        <label htmlFor="new-exercise-name" className="font-semibold">
          Nombre
        </label>
        <input
          id="new-exercise-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hip thrust con banda"
          autoComplete="off"
          autoFocus
          aria-invalid={Boolean(nameError)}
          className={`${composerFieldClass} h-12 px-3.5`}
        />
        {nameError && <p className="text-sm text-red-300">{nameError}</p>}
      </div>

      <div className="grid gap-2">
        <span id="muscle-label" className="font-semibold">
          Músculo principal
        </span>
        {isLoadingMuscles ? (
          <div
            className="h-9 w-2/3 animate-pulse rounded-full bg-surface-hover"
            aria-busy="true"
          />
        ) : (
          <div
            role="group"
            aria-labelledby="muscle-label"
            className="flex flex-wrap gap-1.5"
          >
            {muscles?.map((muscle) => {
              const selected = muscleId === muscle.id;
              return (
                <button
                  key={muscle.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMuscleId(muscle.id)}
                  className={`h-9 rounded-full border px-3 text-sm font-medium transition active:scale-96 ${
                    selected
                      ? "border-primary bg-primary/15 text-orange-300"
                      : "border-line bg-canvas text-fg-muted hover:border-line-strong hover:text-fg lg:bg-surface"
                  }`}
                >
                  {muscle.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-sm text-fg-subtle">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        Solo lo verás tú. Las instrucciones y la foto puedes añadirlas después
        desde Ejercicios.
      </p>

      {error && !nameError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
        >
          No se pudo crear el ejercicio: {error.message}
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
          disabled={!canSubmit}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:active:scale-100"
        >
          <Check className="size-4" strokeWidth={2.6} aria-hidden />
          {isPending ? "Creando…" : "Crear y elegir"}
        </button>
      </div>
    </form>
  );
}
