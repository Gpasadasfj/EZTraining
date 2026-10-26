import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, X } from "lucide-react";
import { useExerciseDetail } from "../../hooks/useExercises";

interface ExerciseInfoSheetProps {
  slug: string | null;
  onClose: () => void;
}

function SheetImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="grid aspect-video place-items-center rounded-xl bg-surface-hover">
        <Dumbbell className="size-12 text-fg-subtle" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="mx-auto block h-auto max-h-80 w-auto max-w-full rounded-xl"
    />
  );
}

export default function ExerciseInfoSheet({
  slug,
  onClose,
}: ExerciseInfoSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { data: exercise, isLoading, isError } = useExerciseDetail(slug);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (slug && !dialog.open) dialog.showModal();
    if (!slug && dialog.open) dialog.close();
  }, [slug]);

  // Sirve tanto si llegan como lista como si llegan como objeto {"1": "...", "2": "..."}
  const steps = exercise ? Object.values(exercise.instructions_es ?? {}) : [];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-b-0 border-line-strong bg-surface p-0 text-fg transition-[translate,opacity,scale] duration-300 ease-out backdrop:bg-black/60 starting:open:translate-y-full motion-reduce:transition-none lg:m-auto lg:max-w-lg lg:rounded-2xl lg:border-b lg:duration-200 lg:starting:open:translate-y-0 lg:starting:open:scale-95 lg:starting:open:opacity-0"
    >
      <div className="grid gap-4 p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:p-5">
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-line-strong lg:hidden"
        />

        {isLoading && (
          <p className="py-10 text-center text-fg-muted">Cargando ejercicio…</p>
        )}
        {isError && (
          <p className="py-10 text-center text-fg-muted">
            No se pudo cargar el ejercicio.
          </p>
        )}

        {exercise && (
          <>
            <SheetImage
              key={exercise.slug}
              src={exercise.image}
              alt={exercise.name_es}
            />

            <div className="flex items-start gap-3">
              <h2
                id={titleId}
                className="min-w-0 flex-1 font-display text-3xl leading-tight font-bold"
              >
                {exercise.name_es}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent">
                {exercise.muscle}
              </span>
              {exercise.secondary_muscles.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full bg-surface-hover px-2.5 py-1 text-xs font-medium text-fg-muted"
                >
                  {muscle}
                </span>
              ))}
            </div>

            {exercise.equipment.length > 0 && (
              <p className="text-sm text-fg-muted">
                Material:{" "}
                <span className="font-semibold text-fg">
                  {exercise.equipment.join(", ")}
                </span>
              </p>
            )}

            <section className="grid gap-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
                Cómo se hace
              </h3>

              {steps.length > 0 ? (
                <ol className="grid gap-2.5">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-accent tabular-nums">
                        {index + 1}
                      </span>
                      <span className="text-fg-muted">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-fg-muted">
                  {exercise.is_custom ? (
                    <>
                      Este ejercicio es tuyo y aún no tiene instrucciones.{" "}
                      <Link
                        to="/exercises"
                        className="font-semibold text-accent underline-offset-4 hover:underline"
                      >
                        Añádelas desde Ejercicios
                      </Link>
                      .
                    </>
                  ) : (
                    "Este ejercicio no tiene instrucciones."
                  )}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </dialog>
  );
}
