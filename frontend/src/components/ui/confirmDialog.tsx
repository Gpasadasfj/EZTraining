import { useEffect, useId, useRef, type ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "primary" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const confirmClass = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25",
};

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  isPending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // El foco empieza en la opción segura, para no confirmar por un toque sin querer
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // Escape: que cierre el estado de React, no el navegador por su cuenta
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      // Clic fuera de la caja (en el fondo oscuro)
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-line-strong bg-surface p-0 text-fg shadow-2xl transition-[opacity,scale] duration-200 backdrop:bg-black/60 starting:open:scale-95 starting:open:opacity-0 motion-reduce:transition-none"
    >
      <div className="grid gap-3.5 p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div id={descriptionId} className="text-fg-muted">
          {children}
        </div>

        {/* Si los textos no caben en una fila, se apilan con la acción principal arriba */}
        <div className="mt-1 flex flex-wrap-reverse gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-11 flex-auto rounded-button bg-surface-hover px-4 font-semibold whitespace-nowrap transition-colors hover:bg-line-strong"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`h-11 flex-auto rounded-button px-4 font-semibold whitespace-nowrap transition-colors disabled:opacity-60 ${confirmClass[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}