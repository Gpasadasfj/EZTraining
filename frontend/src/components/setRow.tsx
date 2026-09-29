import { Check } from "lucide-react";
import type { SetField, SetStatus } from "../types/workouts/workoutSets";

interface SetRowProps {
  setNumber: number;
  weight: string;
  reps: string;
  rir: string;
  status: SetStatus;
  repsPlaceholder: string; // "8–12"
  rirPlaceholder: string; // "2"
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

const inputClass =
  "w-full min-w-0 rounded-md border border-line-strong bg-canvas px-2 py-2 text-center tabular-nums placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  status,
  repsPlaceholder,
  rirPlaceholder,
  isSaving,
  onChange,
  onSave,
}: SetRowProps) {
  // 1. ¿Se puede guardar? → peso y reps no vacíos
  const canSave = weight !== "" && reps !== "";

  return (
    <li
      className={`${SET_GRID} rounded-lg border px-2 py-1.5 ${rowStyles[status]}`}
    >
      <span
        className={`text-center text-sm tabular-nums ${
          status === "current" ? "text-accent" : "text-fg-subtle"
        }`}
      >
        {setNumber}
      </span>

      <input
        value={weight}
        type="text"
        inputMode="decimal"
        onChange={(e) => onChange?.("weight", e.target.value)}
        placeholder="kg"
        className={inputClass}
      />
      <input
        value={reps}
        type="text"
        inputMode="numeric"
        onChange={(e) => onChange?.("reps", e.target.value)}
        placeholder={repsPlaceholder}
        className={inputClass}
      />
      <input
        value={rir}
        type="text"
        inputMode="numeric"
        onChange={(e) => onChange?.("rir", e.target.value)}
        placeholder={rirPlaceholder}
        className={inputClass}
      />

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || !canSave}
        className={`grid size-10 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 
            ${status === "done" ? "bg-success/10 text-success" : "bg-primary text-on-primary hover:bg-primary-hover"}`}
      >
        <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </li>
  );
}
