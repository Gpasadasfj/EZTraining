import { Link } from "react-router-dom";
import { Play } from "lucide-react";

interface DayRowProps {
  position: number;
  name: string;
  isNext: boolean;
  // Id del entreno si este día es el que está en curso
  currentWorkoutId: number | null;
  isStarting: boolean;
  disabled: boolean;
  onStart: () => void;
}

const buttonClass =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-button bg-primary-soft px-4 text-sm font-semibold text-accent transition-[background-color,color,scale] duration-150 hover:bg-primary hover:text-on-primary active:scale-97 disabled:opacity-60";

export default function DayRow({
  position,
  name,
  isNext,
  currentWorkoutId,
  isStarting,
  disabled,
  onStart,
}: DayRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-surface py-3 pr-3 pl-4">
      <span className="w-12 shrink-0 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
        Día {position}
      </span>

      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-semibold">{name}</span>
        {currentWorkoutId !== null && (
          <span className="shrink-0 text-xs font-semibold tracking-wide text-success uppercase">
            En curso
          </span>
        )}
        {isNext && (
          <span className="shrink-0 text-xs font-semibold tracking-wide text-accent uppercase">
            Siguiente
          </span>
        )}
      </span>

      {currentWorkoutId !== null ? (
        <Link to={`/workouts/${currentWorkoutId}`} className={buttonClass}>
          <Play className="size-3.5 fill-current" aria-hidden="true" />
          Continuar
        </Link>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className={buttonClass}
        >
          <Play className="size-3.5 fill-current" aria-hidden="true" />
          {isStarting ? "Empezando…" : "Empezar"}
        </button>
      )}
    </li>
  );
}
