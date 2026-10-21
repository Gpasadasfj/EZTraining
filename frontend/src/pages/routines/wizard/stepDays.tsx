import React, { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useCreateRoutineDays,
  useDeleteRoutineDays,
} from "../../../hooks/routines/useRoutineDays";
import type { RoutineDay } from "../../../types/routines/routineDays";
import { StepIntro, WizardActions, fieldClass } from "./wizardUi";

interface StepDaysProps {
  routineId: number;
  routineName: string;
  days: RoutineDay[];
  onBack: () => void;
  onNext: () => void;
}

export default function StepDays({
  routineId,
  routineName,
  days,
  onBack,
  onNext,
}: StepDaysProps) {
  const [newDayName, setNewDayName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: createDay,
    isPending: isCreating,
    error: createError,
  } = useCreateRoutineDays(routineId);
  // `variables` es el id que se pasó a deleteDay: sirve para saber qué fila se está borrando.
  const {
    mutate: deleteDay,
    isPending: isDeleting,
    variables: deletingDayId,
    error: deleteError,
  } = useDeleteRoutineDays(routineId);

  const canAdd = newDayName.trim().length > 0 && !isCreating;
  const error = createError ?? deleteError;

  const handleAdd = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canAdd) return;

    createDay(
      { name: newDayName.trim() },
      {
        onSuccess: () => {
          setNewDayName("");
          inputRef.current?.focus();
        },
      },
    );
  };

  return (
    <>
      <div className="grid gap-5.5 pt-3.5 lg:px-7 lg:pt-5.5">
        <StepIntro
          eyebrow={routineName}
          title="Días de entreno"
          subtitle="Añádelos en el orden en que los vas a hacer."
        />

        {days.length > 0 && (
          <ol className="grid gap-2">
            {days.map((day, index) => {
              const isRemoving = isDeleting && deletingDayId === day.id;

              return (
                <li
                  key={day.id}
                  className={`flex min-h-14 items-center gap-3 rounded-lg border border-line bg-surface py-2 pr-1.5 pl-3.5 transition duration-200 ease-out starting:-translate-y-1.5 starting:opacity-0 motion-reduce:transition-none lg:bg-canvas ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  <span className="w-12 shrink-0 text-xs font-bold tracking-wider text-fg-subtle uppercase">
                    Día {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold wrap-anywhere">
                    {day.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteDay(day.id)}
                    disabled={isRemoving}
                    aria-label={`Quitar ${day.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-red-500/10 hover:text-red-400 active:scale-94 disabled:cursor-wait"
                  >
                    <Trash2 className="size-4.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <form onSubmit={handleAdd} className="grid gap-2">
          <label htmlFor="new-day" className="font-semibold">
            {days.length > 0 ? "Otro día" : "Primer día"}
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="new-day"
              type="text"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              placeholder={days.length > 0 ? "Pull, Pierna, Torso…" : "Push"}
              autoComplete="off"
              autoFocus
              className={`${fieldClass} h-12 min-w-0 flex-1`}
            />
            <button
              type="submit"
              disabled={!canAdd}
              className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-lg bg-surface-hover px-4 font-semibold transition hover:bg-line-strong active:scale-97 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
            >
              <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
              {isCreating ? "Añadiendo…" : "Añadir"}
            </button>
          </div>
        </form>

        {days.length === 0 && (
          <p className="text-sm text-fg-subtle">
            Necesitas al menos un día para seguir.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
          >
            {error.message}
          </p>
        )}
      </div>

      <WizardActions
        onBack={onBack}
        onNext={onNext}
        nextLabel="Siguiente"
        nextDisabled={days.length === 0}
      />
    </>
  );
}
