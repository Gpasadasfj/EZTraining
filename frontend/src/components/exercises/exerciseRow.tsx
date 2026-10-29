import { ChevronRight } from "lucide-react";
import ExerciseThumb from "./exerciseThumb";
import type { Exercise } from "../../types/exercises";
import { getSteps } from "../../utils/exercise";

interface ExerciseRowProps {
  exercise: Exercise;
  onOpen: (slug: string) => void;
}

export default function ExerciseRow({ exercise, onOpen }: ExerciseRowProps) {
  // En los tuyos se avisa de que faltan instrucciones, para que sepas cuáles completar
  const missingSteps =
    exercise.is_custom && getSteps(exercise.instructions_es).length === 0;

  const detail = missingSteps
    ? "Sin instrucciones"
    : exercise.equipment.join(", ");

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(exercise.slug)}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-card border border-line bg-surface py-2.5 pr-3 pl-2.5 text-left transition-colors hover:border-line-strong"
      >
        <ExerciseThumb src={exercise.image} />
        <span className="grid min-w-0 flex-1">
          <span className="truncate font-semibold">{exercise.name_es}</span>
          <span
            className={`truncate text-sm ${missingSteps ? "text-amber-400" : "text-fg-muted"}`}
          >
            {exercise.muscle}
            {detail && ` · ${detail}`}
          </span>
        </span>
        <ChevronRight
          className="size-4.5 shrink-0 text-fg-subtle"
          aria-hidden="true"
        />
      </button>
    </li>
  );
}
