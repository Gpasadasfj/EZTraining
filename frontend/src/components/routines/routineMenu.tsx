import ActionMenu from "../ui/actionMenu";
import { useDeleteRoutine } from "../../hooks/routines/useRoutines";

interface RoutineMenuProps {
  routineId: number;
  routineName: string;
  onDeleted?: () => void;
}

export default function RoutineMenu({
  routineId,
  routineName,
  onDeleted,
}: RoutineMenuProps) {
  const { mutate, isPending, error } = useDeleteRoutine();

  return (
    <ActionMenu
      name={routineName}
      editTo={`/routines/update/${routineId}`}
      editLabel="Editar rutina"
      confirmMessage={
        <>
          ¿Eliminar <strong className="text-fg">{routineName}</strong>? Se
          borrarán sus días y ejercicios. Tus entrenos ya hechos se mantienen.
        </>
      }
      onDelete={() => mutate(routineId, { onSuccess: () => onDeleted?.() })}
      isDeleting={isPending}
      error={error}
    />
  );
}
