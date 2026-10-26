import { Check } from "lucide-react";
import type { SetField, SetStatus } from "../../types/workouts/workoutSets";

interface SetRowProps {
  setNumber: number;
  weight: string;
  reps: string;
  rir: string;
  status: SetStatus;
  repsPlaceholder: string;
  rirPlaceholder: string;
  readOnly?: boolean;
  isSaving?: boolean;
  onChange?: (field: SetField, value: string) => void;
  onSave?: () => void;
}

const rowStyles: Record<SetStatus, string> = {
  done: "border-transparent bg-canvas",
  current: "border-primary/50 bg-primary/5",
  pending: "border-transparent",
};

export const SET_GRID =
  "grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] items-center gap-2";

const inputBase =
  "w-full min-w-0 rounded-md border px-2 py-2 text-center tabular-nums placeholder:text-fg-subtle focus:outline-none";

const editableClass =
  "border-line-strong bg-canvas focus:border-primary focus:ring-2 focus:ring-primary/20";
  
const readOnlyClass = "border-dashed border-line-strong bg-transparent";

export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  status,
  repsPlaceholder,
  rirPlaceholder,
  readOnly = false,
  isSaving,
  onChange,
  onSave,
}: SetRowProps) {
  const canSave = weight !== "" && reps !== "";
  const inputClass = `${inputBase} ${readOnly ? readOnlyClass : editableClass}`;

  return (
    <li
      className={`${SET_GRID} rounded-lg border px-2 py-1.5 ${
        readOnly ? rowStyles.pending : rowStyles[status]
      }`}
    >
      <span
        className={`text-center text-sm tabular-nums ${
          status === "current" && !readOnly ? "text-accent" : "text-fg-subtle"
        }`}
      >
        {setNumber}
      </span>

      <input
        value={weight}
        type="text"
        inputMode="decimal"
        readOnly={readOnly}
        onChange={(e) => onChange?.("weight", e.target.value)}
        placeholder={readOnly ? "–" : "kg"}
        aria-label={`Peso, serie ${setNumber}`}
        className={inputClass}
      />
      <input
        value={reps}
        type="text"
        inputMode="numeric"
        readOnly={readOnly}
        onChange={(e) => onChange?.("reps", e.target.value)}
        placeholder={readOnly ? "–" : repsPlaceholder}
        aria-label={`Repeticiones, serie ${setNumber}`}
        className={inputClass}
      />
      <input
        value={rir}
        type="text"
        inputMode="numeric"
        readOnly={readOnly}
        onChange={(e) => onChange?.("rir", e.target.value)}
        placeholder={readOnly ? "–" : rirPlaceholder}
        aria-label={`RIR, serie ${setNumber}`}
        className={inputClass}
      />

      {/* invisible: oculto pero conserva su hueco, así la fila no cambia de tamaño */}
      <button
        type="button"
        onClick={onSave}
        disabled={readOnly || isSaving || !canSave}
        aria-label={
          status === "done"
            ? `Serie ${setNumber} completada`
            : `Completar serie ${setNumber}`
        }
        className={`grid size-10 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          readOnly ? "invisible" : ""
        } ${
          status === "done"
            ? "bg-success/10 text-success"
            : "bg-primary text-on-primary hover:bg-primary-hover"
        }`}
      >
        <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </li>
  );
}
