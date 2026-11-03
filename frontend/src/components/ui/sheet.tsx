import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Se monta solo mientras está abierta, así cada vez empieza con el estado limpio
export default function Sheet({ title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Esc: avisa al padre en vez de cerrarse solo, para que React siga mandando
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // El <dialog> solo es el destino del clic cuando se pulsa el fondo, fuera del contenido
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-full overflow-y-auto rounded-t-2xl border border-b-0 border-line-strong bg-surface p-0 text-fg transition-[translate,opacity] duration-300 ease-out backdrop:bg-black/60 starting:open:translate-y-full lg:m-auto lg:max-w-110 lg:rounded-2xl lg:border-b lg:duration-200 lg:starting:open:translate-y-2 lg:starting:open:opacity-0"
    >
      <div className="grid gap-4 px-4.5 pt-2 pb-[calc(1.125rem+env(safe-area-inset-bottom))] lg:p-5">
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-line-strong lg:hidden"
        />
        <div className="flex items-center justify-between gap-2.5">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-9.5 place-items-center rounded-button text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
