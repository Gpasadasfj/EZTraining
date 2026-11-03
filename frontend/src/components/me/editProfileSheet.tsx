import React, { useState } from "react";
import Sheet from "../ui/sheet";
import { useUpdateMe } from "../../hooks/me/useMe";
import type { User } from "../../types/users";
import { formatNumber, parseDecimal } from "../../utils/format";

interface EditProfileSheetProps {
  me: User;
  onClose: () => void;
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  unit?: string;
  error?: string | null;
}

function Field({ id, label, unit, error, ...props }: FieldProps) {
  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          className={`h-11.5 w-full min-w-0 rounded-button border border-line-strong bg-canvas px-3 text-base outline-none placeholder:text-fg-subtle focus:border-primary focus:ring-3 focus:ring-primary/20 aria-invalid:border-danger ${unit ? "pr-10" : ""}`}
        />
        {unit && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-fg-subtle">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// Vacío es válido (= sin dato); si hay texto, tiene que ser un número dentro del rango
const isOutOfRange = (text: string, min: number, max: number) => {
  if (text.trim() === "") return false;
  const value = parseDecimal(text);
  return value === null || value < min || value > max;
};

export default function EditProfileSheet({
  me,
  onClose,
}: EditProfileSheetProps) {
  const [firstName, setFirstName] = useState(me.first_name);
  const [lastName, setLastName] = useState(me.last_name);
  const [height, setHeight] = useState(
    me.height ? formatNumber(Number(me.height), 2) : "",
  );
  const [target, setTarget] = useState(
    me.target_weight ? formatNumber(Number(me.target_weight)) : "",
  );
  const update = useUpdateMe();

  // La altura va en metros: escribir 175 es el error típico
  const heightError = isOutOfRange(height, 1, 2.5)
    ? "En metros, por ejemplo 1,75."
    : null;
  const targetError = isOutOfRange(target, 20, 400)
    ? "Entre 20 y 400 kg."
    : null;
  const canSubmit = !heightError && !targetError && !update.isPending;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    update.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        height: parseDecimal(height)?.toFixed(2) ?? null,
        target_weight: parseDecimal(target)?.toFixed(1) ?? null,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Sheet title="Tus datos" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-2 gap-2.5">
          <Field
            id="first-name"
            label="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
          <Field
            id="last-name"
            label="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field
            id="height"
            label="Altura"
            unit="m"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            inputMode="decimal"
            placeholder="1,75"
            error={heightError}
          />
          <Field
            id="target-weight"
            label="Peso objetivo"
            unit="kg"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputMode="decimal"
            placeholder="75"
            error={targetError}
          />
        </div>

        <p className="text-sm text-fg-subtle">
          Tu peso actual no se edita aquí: sale del último registro.
        </p>

        {update.isError && (
          <p role="alert" className="text-sm text-danger">
            No se pudieron guardar tus datos. Inténtalo de nuevo.
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
            disabled={!canSubmit}
            className="h-12 flex-1 rounded-button bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            {update.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
