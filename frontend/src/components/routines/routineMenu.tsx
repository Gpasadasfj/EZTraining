import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useDeleteRoutine } from "../../hooks/routines/useRoutines";

interface RoutineMenuProps {
  routineId: number;
  routineName: string;
  onDeleted?: () => void;
}

const itemClass =
  "flex h-10.5 w-full items-center gap-2.5 rounded-lg px-3 text-left font-medium transition-colors hover:bg-surface-hover";

export default function RoutineMenu({
  routineId,
  routineName,
  onDeleted,
}: RoutineMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate, isPending, isError, error } = useDeleteRoutine();

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleDelete = () => {
    mutate(routineId, {
      onSuccess: () => {
        close();
        onDeleted?.();
      },
    });
  };

  return (
    <div ref={menuRef} className="relative z-2 -mt-2 -mr-2 shrink-0">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={`Más acciones para ${routineName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid size-10 place-items-center rounded-lg transition hover:bg-surface-hover hover:text-fg active:scale-94 ${
          open ? "bg-surface-hover text-fg" : "text-fg-subtle"
        }`}
      >
        <Ellipsis className="size-5" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Acciones de ${routineName}`}
          className="absolute top-full right-0 z-10 mt-1 w-56 origin-top-right rounded-xl border border-line-strong bg-zinc-900 p-1.5 shadow-2xl shadow-black/70"
        >
          {confirming ? (
            <div
              role="alertdialog"
              aria-label="Eliminar rutina"
              className="grid gap-2.5 px-2.5 pt-2.5 pb-2"
            >
              <p className="text-sm text-fg-muted">
                ¿Eliminar <strong className="text-fg">{routineName}</strong>? Se
                borrarán sus días y ejercicios. Tus entrenos ya hechos se
                mantienen.
              </p>
              {isError && (
                <p className="text-sm text-red-400">{error.message}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-9.5 flex-1 rounded-lg bg-surface-hover text-sm font-semibold transition-colors hover:bg-line-strong"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-9.5 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {isPending ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to={`/routines/update/${routineId}`}
                role="menuitem"
                className={itemClass}
              >
                <Pencil className="size-4.5 text-fg-subtle" aria-hidden />
                Editar rutina
              </Link>
              <div role="separator" className="mx-1 my-1.5 h-px bg-line" />
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className={`${itemClass} text-red-400 hover:bg-red-500/12`}
              >
                <Trash2 className="size-4.5" aria-hidden />
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}