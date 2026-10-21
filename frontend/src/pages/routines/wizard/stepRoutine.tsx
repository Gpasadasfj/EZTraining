import React from "react";
import {
  useCreateRoutine,
  useUpdateRoutine,
} from "../../../hooks/routines/useRoutines";
import { StepIntro, WizardActions, fieldClass } from "./wizardUi";
import type { RoutineValues } from "../../../types/routines/wizard";

// Los valores los guarda el asistente: este paso se desmonta al avanzar
// y así el texto sigue escrito si el usuario vuelve atrás.
interface StepRoutineProps {
  routineId: number | null;
  values: RoutineValues;
  onChange: (values: RoutineValues) => void;
  onSaved: (routineId: number) => void;
}

// El botón «Siguiente» se pinta en un portal, fuera de este <form>.
// Lo enlaza con el atributo `form`, que necesita el id del formulario.
const FORM_ID = "wizard-routine-form";

export default function StepRoutine({
  routineId,
  values,
  onChange,
  onSaved,
}: StepRoutineProps) {
  const {
    mutate: createRoutine,
    isPending: isCreating,
    error: createError,
  } = useCreateRoutine();
  const {
    mutate: updateRoutine,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateRoutine();

  const isSaving = isCreating || isUpdating;
  const saveError = createError ?? updateError;
  const canSubmit = values.name.trim().length > 0 && !isSaving;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
    };

    // Si el usuario ha vuelto atrás, la rutina ya existe: se actualiza en vez de crear otra.
    if (routineId) {
      updateRoutine(
        { id: routineId, data: payload },
        { onSuccess: () => onSaved(routineId) },
      );
    } else {
      createRoutine(payload, { onSuccess: (routine) => onSaved(routine.id) });
    }
  };

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="grid gap-5.5 pt-3.5 lg:px-7 lg:pt-5.5"
      >
        <StepIntro
          eyebrow="Nueva rutina"
          title="¿Cómo se llama?"
          subtitle="Después añadirás los días y los ejercicios de cada uno."
        />

        <div className="grid gap-2">
          <label htmlFor="routine-name" className="font-semibold">
            Nombre
          </label>
          <input
            id="routine-name"
            type="text"
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            placeholder="Push Pull Legs"
            autoComplete="off"
            autoFocus
            required
            className={`${fieldClass} h-12`}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="routine-description"
            className="flex items-baseline justify-between gap-3 font-semibold"
          >
            Descripción
            <span className="text-sm font-normal text-fg-subtle">Opcional</span>
          </label>
          <textarea
            id="routine-description"
            value={values.description}
            onChange={(e) =>
              onChange({ ...values, description: e.target.value })
            }
            placeholder="Empuje, tirón y pierna. Tres días para ganar fuerza."
            rows={3}
            className={`${fieldClass} resize-none py-3 leading-relaxed`}
          />
        </div>

        {saveError && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
          >
            No se pudo guardar la rutina: {saveError.message}
          </p>
        )}
      </form>

      <WizardActions
        form={FORM_ID}
        nextLabel="Siguiente"
        nextDisabled={!canSubmit}
        isPending={isSaving}
      />
    </>
  );
}
