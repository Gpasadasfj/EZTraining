import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../ui/confirmDialog";
import { useDeleteExercise } from "../../hooks/useExercises";
import type { Exercise } from "../../types/exercises";

interface DeleteExerciseSectionProps {
  exercise: Exercise;
  onDeleted: () => void;
}

export default function DeleteExerciseSection({
  exercise,
  onDeleted,
}: DeleteExerciseSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const remove = useDeleteExercise();

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-card border border-red-500/25 p-4">
        <p className="text-sm text-fg-muted">
          <span className="block font-semibold text-fg">Borrar ejercicio</span>
          Se quitará de tus rutinas. Tus entrenos pasados lo conservarán.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-button bg-red-500/10 px-3.5 font-semibold text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Borrar
        </button>
      </div>

      <ConfirmDialog
        open={isOpen}
        title={`¿Borrar «${exercise.name_es}»?`}
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        tone="danger"
        isPending={remove.isPending}
        onCancel={() => setIsOpen(false)}
        onConfirm={() => remove.mutate(exercise.slug, { onSuccess: onDeleted })}
      >
        Se quitará de las rutinas que lo usen. Tus entrenos pasados lo seguirán
        mostrando.
        {remove.isError && (
          <span role="alert" className="mt-2 block text-red-400">
            No se pudo borrar. Inténtalo de nuevo.
          </span>
        )}
      </ConfirmDialog>
    </>
  );
}
