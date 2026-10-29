import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import OptionChip from "./optionChip";
import {
  useEquipment,
  useExercisesInfinite,
  useMuscles,
} from "../../hooks/useExercises";
import type { ExerciseFilters } from "../../types/exercises";

interface ExerciseFiltersSheetProps {
  filters: ExerciseFilters;
  custom: boolean;
  search: string;
  onApply: (filters: ExerciseFilters) => void;
  onClose: () => void;
}

const NO_FILTERS: ExerciseFilters = {
  muscle: null,
  secondaryMuscles: [],
  equipment: [],
};

const toggle = (list: number[], id: number) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export default function ExerciseFiltersSheet({
  filters,
  custom,
  search,
  onApply,
  onClose,
}: ExerciseFiltersSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [draft, setDraft] = useState(filters);

  const { data: muscles } = useMuscles();
  const { data: equipment } = useEquipment();
  // Cuántos resultados daría el borrador, antes de aplicarlo
  const preview = useExercisesInfinite({ ...draft, custom }, search);
  const count = preview.data?.pages[0]?.count;

  // Se monta al abrir y se desmonta al cerrar: el borrador siempre empieza con los filtros aplicados
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const pickMuscle = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      muscle: prev.muscle === id ? null : id,
      // Un músculo no puede ser principal y secundario a la vez
      secondaryMuscles: prev.secondaryMuscles.filter((item) => item !== id),
    }));
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl border border-b-0 border-line-strong bg-surface p-0 text-fg transition-[translate,opacity,scale] duration-300 ease-out backdrop:bg-black/60 starting:open:translate-y-full motion-reduce:transition-none lg:m-auto lg:max-w-lg lg:rounded-2xl lg:border-b lg:duration-200 lg:starting:open:translate-y-0 lg:starting:open:scale-95 lg:starting:open:opacity-0"
    >
      <div className="grid gap-5 px-4 pt-4 lg:px-5">
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-line-strong lg:hidden"
        />

        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-xl font-semibold">
            Filtros
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 grid size-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
            Músculo principal
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {muscles?.map((muscle) => (
              <OptionChip
                key={muscle.id}
                selected={draft.muscle === muscle.id}
                onClick={() => pickMuscle(muscle.id)}
              >
                {muscle.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
            Músculos secundarios{" "}
            <span className="font-medium tracking-normal normal-case">
              · todos los que marques
            </span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {muscles?.map((muscle) => (
              <OptionChip
                key={muscle.id}
                selected={draft.secondaryMuscles.includes(muscle.id)}
                disabled={draft.muscle === muscle.id}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    secondaryMuscles: toggle(prev.secondaryMuscles, muscle.id),
                  }))
                }
              >
                {muscle.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
            Material{" "}
            <span className="font-medium tracking-normal normal-case">
              · todos los que marques
            </span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {equipment?.map((item) => (
              <OptionChip
                key={item.id}
                selected={draft.equipment.includes(item.id)}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    equipment: toggle(prev.equipment, item.id),
                  }))
                }
              >
                {item.name}
              </OptionChip>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="sticky bottom-0 mt-5 flex gap-2 border-t border-line bg-surface px-4 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] lg:px-5 lg:pb-3.5">
        <button
          type="button"
          onClick={() => setDraft(NO_FILTERS)}
          className="h-11 flex-1 rounded-button bg-surface-hover font-semibold transition-colors hover:bg-line-strong"
        >
          Quitar todo
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="h-11 flex-1 rounded-button bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          {count === undefined
            ? "Ver ejercicios"
            : `Ver ${count} ${count === 1 ? "ejercicio" : "ejercicios"}`}
        </button>
      </div>
    </dialog>
  );
}
