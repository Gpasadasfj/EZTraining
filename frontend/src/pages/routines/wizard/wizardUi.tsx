import { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const fieldClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 text-base text-fg placeholder:text-fg-subtle outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20 lg:bg-canvas";


export const composerFieldClass =
  "w-full rounded-lg border border-line bg-canvas text-base text-fg placeholder:text-fg-subtle outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20 lg:bg-surface";

/* Hueco donde se pintan los botones de abajo, fuera de la animación */
export const WizardActionsSlot = createContext<HTMLElement | null>(null);

/* ---------- Cabecera: salir, paso actual y barra de progreso ---------- */

interface WizardHeaderProps {
  label: React.ReactNode;
  progress: number; // de 0 a 1
  onExit: () => void;
}

export function WizardHeader({ label, progress, onExit }: WizardHeaderProps) {
  return (
    <div className="grid gap-2.5 pb-3.5 lg:px-7 lg:pt-5">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onExit}
          aria-label="Salir del asistente"
          className="grid size-10 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-hover hover:text-fg active:scale-94"
        >
          <X className="size-5" aria-hidden />
        </button>
        <p
          className="flex-1 text-center text-sm font-semibold text-fg-muted"
          aria-live="polite"
        >
          {label}
        </p>
        <span className="size-10" aria-hidden />
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-surface-hover"
        aria-hidden
      >
        <div
          className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

/* ---------- Título de cada paso ---------- */

interface StepIntroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function StepIntro({ eyebrow, title, subtitle }: StepIntroProps) {
  return (
    <header className="grid gap-2">
      <span className="text-xs font-bold tracking-widest text-accent uppercase">
        {eyebrow}
      </span>
      <h1 className="font-display text-4xl leading-none font-extrabold text-balance uppercase italic wrap-anywhere lg:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="text-pretty text-fg-muted">{subtitle}</p>}
    </header>
  );
}

/* ---------- Botones de abajo: Atrás y Siguiente ---------- */

interface WizardActionsProps {
  nextLabel: string;
  onBack?: () => void;
  onNext?: () => void; // si no se pasa, el botón envía el formulario indicado en `form`
  form?: string;
  nextDisabled?: boolean;
  isPending?: boolean;
  showArrow?: boolean;
}

export function WizardActions({
  nextLabel,
  onBack,
  onNext,
  form,
  nextDisabled = false,
  isPending = false,
  showArrow = true,
}: WizardActionsProps) {
  const slot = useContext(WizardActionsSlot);
  if (!slot) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:mt-6 lg:bg-transparent lg:px-7 lg:py-4.5 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-xl gap-2.5 lg:max-w-none lg:justify-end">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center gap-2 rounded-lg px-5 font-semibold text-fg-muted transition hover:bg-surface-hover hover:text-fg active:scale-97 lg:mr-auto"
          >
            <ChevronLeft className="size-4.5" aria-hidden />
            Atrás
          </button>
        )}
        <button
          type={onNext ? "button" : "submit"}
          form={onNext ? undefined : form}
          onClick={onNext}
          disabled={nextDisabled || isPending}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:active:scale-100 lg:min-w-42 lg:flex-none"
        >
          {isPending ? (
            <>
              <span
                className="size-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary"
                aria-hidden
              />
              Guardando…
            </>
          ) : (
            <>
              {nextLabel}
              {showArrow && <ChevronRight className="size-4.5" aria-hidden />}
            </>
          )}
        </button>
      </div>
    </div>,
    slot,
  );
}
