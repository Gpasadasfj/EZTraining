import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoutineDays from "../../../hooks/routines/useRoutineDays";
import type { RoutineDay } from "../../../types/routines/routineDays";

import { WizardActionsSlot, WizardHeader } from "./wizardUi";
import type { RoutineValues, WizardStep } from "../../../types/routines/wizard";
import StepRoutine from "./stepRoutine";
import StepDays from "./stepDays";
import StepDayExercises from "./stepDayExercises";
import StepDone from "./stepDone";

type Direction = "forward" | "back";

function stepKey(step: WizardStep) {
  return step.kind === "day" ? `day-${step.day.id}` : step.kind;
}

function stepLabel(step: WizardStep, dayCount: number) {
  if (step.kind === "routine") return <b className="text-fg">Rutina</b>;
  if (step.kind === "days") return <b className="text-fg">Días</b>;
  if (step.kind === "done") return <b className="text-fg">¡Hecho!</b>;
  return (
    <>
      Ejercicios · día <b className="text-fg">{step.index + 1}</b> de {dayCount}
    </>
  );
}

export default function RoutineWizard() {
  const navigate = useNavigate();

  const [routineId, setRoutineId] = useState<number | null>(null);
  // Vive aquí y no en StepRoutine para conservar el texto al volver atrás.
  const [routineValues, setRoutineValues] = useState<RoutineValues>({
    name: "",
    description: "",
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("forward");
  // Estado y no useRef: hace falta un render más cuando el div ya existe.
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);

  const { data: daysData } = useRoutineDays(routineId ?? 0);
  const days: RoutineDay[] = daysData?.results ?? [];

  const steps: WizardStep[] = [
    { kind: "routine" },
    { kind: "days" },
    ...days.map((day, index) => ({ kind: "day" as const, day, index })),
    { kind: "done" },
  ];
  // Si se borra un día, el índice puede quedar fuera de la lista.
  const currentIndex = Math.min(stepIndex, steps.length - 1);
  const step = steps[currentIndex];
  const progress = step.kind === "done" ? 1 : (currentIndex + 1) / steps.length;

  const goTo = (delta: number) => {
    setDirection(delta > 0 ? "forward" : "back");
    setStepIndex((index) => Math.max(0, index + delta));
    window.scrollTo({ top: 0 });
  };
  const goNext = () => goTo(1);
  const goBack = () => goTo(-1);

  const exit = () =>
    navigate(routineId ? `/routines/${routineId}` : "/routines");

  const animationClass =
    direction === "forward" ? "animate-step-in-right" : "animate-step-in-left";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col lg:mt-4 lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:shadow-2xl lg:shadow-black/60">
      <WizardHeader
        label={stepLabel(step, days.length)}
        progress={progress}
        onExit={exit}
      />

      <WizardActionsSlot.Provider value={actionsSlot}>
        {/* Al cambiar la key se monta de nuevo y se repite la animación de entrada */}
        <div
          key={stepKey(step)}
          className={`${animationClass} motion-reduce:animate-fade-in`}
        >
          {step.kind === "routine" && (
            <StepRoutine
              routineId={routineId}
              values={routineValues}
              onChange={setRoutineValues}
              onSaved={(id) => {
                setRoutineId(id);
                goNext();
              }}
            />
          )}

          {step.kind === "days" && routineId !== null && (
            <StepDays
              routineId={routineId}
              routineName={routineValues.name}
              days={days}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {step.kind === "day" && routineId !== null && (
            <StepDayExercises
              routineId={routineId}
              routineName={routineValues.name}
              day={step.day}
              isLastDay={step.index === days.length - 1}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {step.kind === "done" && routineId !== null && (
            <StepDone
              routineId={routineId}
              routineValues={routineValues}
              days={days}
              onFinish={() => navigate(`/routines/${routineId}`)}
            />
          )}
        </div>
      </WizardActionsSlot.Provider>

      {/* Fuera del div animado: su transform rompe el `fixed` de la barra en móvil */}
      <div ref={setActionsSlot} />
    </div>
  );
}