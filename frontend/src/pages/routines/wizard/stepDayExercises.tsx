import { useState } from "react";
import DayExercisesEditor from "../../../components/routines/exerciseComposer/dayExercisesEditor";
import type { RoutineDay } from "../../../types/routines/routineDays";
import { StepIntro, WizardActions } from "./wizardUi";

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
  // Con un panel abierto no se puede avanzar, para no perder lo que se está configurando.
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <div className="grid gap-5.5 pt-3.5 lg:px-7 lg:pt-5.5">
        <StepIntro
          eyebrow={routineName}
          title={day.name}
          subtitle="Añade los ejercicios en el orden en que los harás."
        />
        <DayExercisesEditor
          routineId={routineId}
          dayId={day.id}
          emptyHint="Si aún no lo tienes claro, sigue sin ejercicios y complétalo luego desde la rutina."
          onPanelOpenChange={setIsPanelOpen}
        />
      </div>

      <WizardActions
        onBack={onBack}
        onNext={onNext}
        nextLabel={isLastDay ? "Terminar" : "Siguiente día"}
        nextDisabled={isPanelOpen}
      />
    </>
  );
}
