import { Plus, X } from "lucide-react";
import { cardClass, fieldClass } from "./formStyles";

interface StepsFieldProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export default function StepsField({ steps, onChange }: StepsFieldProps) {
  const setStep = (index: number, text: string) => {
    onChange(steps.map((step, i) => (i === index ? text : step)));
  };

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index);
    // Siempre queda al menos un hueco para escribir
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <section className={cardClass} aria-labelledby="steps-title">
      <div className="grid gap-0.5">
        <h2 id="steps-title" className="font-semibold">
          Cómo se hace{" "}
          <span className="ml-1 text-sm font-medium text-fg-subtle">
            Opcional
          </span>
        </h2>
        <p className="text-sm text-fg-subtle">
          Un paso en cada hueco. Saldrán numerados en la ficha.
        </p>
      </div>

      <ol className="grid gap-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-accent tabular-nums">
              {index + 1}
            </span>
            <textarea
              value={step}
              onChange={(e) => setStep(index, e.target.value)}
              rows={1}
              placeholder={`Describe el paso ${index + 1}`}
              aria-label={`Paso ${index + 1}`}
              className={`${fieldClass} field-sizing-content min-h-12 resize-none py-3 leading-snug`}
            />
            <button
              type="button"
              onClick={() => removeStep(index)}
              aria-label={`Quitar paso ${index + 1}`}
              className="mt-1.5 grid size-9 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <X className="size-4.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => onChange([...steps, ""])}
        className="inline-flex h-10 items-center gap-1.5 justify-self-start rounded-lg px-3 font-semibold text-accent transition-colors hover:bg-primary-soft"
      >
        <Plus className="size-4.5" aria-hidden="true" />
        Añadir paso
      </button>
    </section>
  );
}
