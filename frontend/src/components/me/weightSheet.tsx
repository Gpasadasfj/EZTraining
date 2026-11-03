import React, { useState } from "react";
import Sheet from "../ui/sheet";
import { useCreateWeightLog } from "../../hooks/me/useWeightLog";
import { formatNumber, parseDecimal } from "../../utils/format";

const STEPS = [-0.5, -0.1, 0.1, 0.5];
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 400;

interface WeightSheetProps {
  lastWeight: number | null;
  onClose: () => void;
}

export default function WeightSheet({ lastWeight, onClose }: WeightSheetProps) {
  // Empieza con el último peso: lo normal es que cambie poco
  const [value, setValue] = useState(
    lastWeight !== null ? formatNumber(lastWeight) : "",
  );
  const create = useCreateWeightLog();

  const weight = parseDecimal(value);
  const isValid =
    weight !== null && weight >= MIN_WEIGHT && weight <= MAX_WEIGHT;

  const step = (delta: number) => {
    const base = weight ?? lastWeight ?? 70;
    setValue(formatNumber(Math.max(0, Math.round((base + delta) * 10) / 10)));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isValid || weight === null) return;
    create.mutate({ weight: weight.toFixed(1) }, { onSuccess: onClose });
  };

  return (
    <Sheet title="Registrar peso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="flex items-baseline justify-center gap-2 rounded-2xl border border-line-strong bg-canvas px-3 py-4.5 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/20">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            inputMode="decimal"
            autoFocus
            aria-label="Peso en kilos"
            aria-invalid={value !== "" && !isValid}
            className="w-36 bg-transparent text-right font-display text-6xl leading-none font-bold tabular-nums outline-none"
          />
          <span className="text-xl font-semibold text-fg-muted">kg</span>
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {STEPS.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => step(delta)}
              className="h-10 rounded-button bg-surface-hover font-semibold tabular-nums transition-colors hover:bg-line-strong"
            >
              {delta > 0 ? "+" : "−"}
              {formatNumber(Math.abs(delta))}
            </button>
          ))}
        </div>

        {value !== "" && !isValid ? (
          <p role="alert" className="text-center text-sm text-danger">
            Escribe un peso entre {MIN_WEIGHT} y {MAX_WEIGHT} kg.
          </p>
        ) : (
          <p className="text-center text-sm text-fg-subtle">
            Se guarda con la fecha de hoy y pasa a ser tu peso actual.
          </p>
        )}

        {create.isError && (
          <p role="alert" className="text-center text-sm text-danger">
            No se pudo guardar. Inténtalo de nuevo.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-button bg-surface-hover font-semibold transition-colors hover:bg-line-strong"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid || create.isPending}
            className="h-12 flex-1 rounded-button bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            {create.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
