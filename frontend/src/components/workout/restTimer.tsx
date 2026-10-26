import { useEffect } from "react";
import useNow from "../../hooks/useNow";
import { formatDuration } from "../../utils/format";
import type { Rest } from "../../types/workouts/rest";

interface RestTimerProps {
  rest: Rest;
  onAdd: () => void;
  onSkip: () => void;
  onExpire: () => void;
}

const buttonClass =
  "h-9 shrink-0 rounded-lg bg-surface-hover px-3 text-sm font-semibold transition-colors hover:bg-line-strong";

export default function RestTimer({
  rest,
  onAdd,
  onSkip,
  onExpire,
}: RestTimerProps) {
  const now = useNow(250);
  const left = Math.min(
    Math.ceil((rest.endsAt - now) / 1000),
    Math.ceil(rest.total),
  );
  const isOver = left <= 0;

  // Al llegar a 0 se queda unos segundos en verde y se cierra solo
  useEffect(() => {
    if (left <= -4) onExpire();
  }, [left, onExpire]);

  return (
    <div
      role="timer"
      className={`grid gap-2 rounded-xl border bg-surface px-3 py-2.5 transition-[opacity,translate] duration-200 starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none ${
        isOver ? "border-success/45" : "border-line-strong"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-xs text-fg-muted">
            {isOver
              ? "¡A por la siguiente serie!"
              : `Descanso · ${rest.exerciseName}`}
          </span>
          <strong
            className={`text-2xl font-bold tabular-nums ${isOver ? "text-success" : ""}`}
          >
            {formatDuration(Math.max(0, left))}
          </strong>
        </div>
        <button type="button" onClick={onAdd} className={buttonClass}>
          +15 s
        </button>
        <button type="button" onClick={onSkip} className={buttonClass}>
          {isOver ? "Cerrar" : "Saltar"}
        </button>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-linear motion-reduce:transition-none"
          style={{ transform: `scaleX(${Math.max(0, left / rest.total)})` }}
        />
      </div>
    </div>
  );
}
