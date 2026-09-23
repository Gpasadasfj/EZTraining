import type React from "react";
import useWeightLog, {
  useCreateWeightLog,
  useDeleteWeightLog,
} from "../hooks/useWeightLog";
import { type WeightLogItemProps } from "../types/users";
import { useState } from "react";

export default function WeightLog() {
  const { data, isLoading, isError, error } = useWeightLog();
  const { mutate: createMutate, isPending: isCreating } = useCreateWeightLog();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteWeightLog();

  const [weightValue, setWeightValue] = useState("");

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const handleCreateMutate = (e: React.SubmitEvent) => {
    e.preventDefault();
    createMutate(
      { weight: weightValue },
      { onSuccess: () => setWeightValue("") },
    );
  };

  return (
    <div>
      <form onSubmit={handleCreateMutate}>
        <input
          type="number"
          value={weightValue}
          onChange={(e) => setWeightValue(e.target.value)}
        />
        <button type="submit" disabled={isCreating}>Registrar</button>
      </form>

      <ul>
        {data.results.map((log) => (
          <WeightLogItem
            key={log.id}
            log={log}
            isDeleting={isDeleting}
            onDelete={(id: number) => deleteMutate(id)}
          />
        ))}
      </ul>
    </div>
  );
}

function WeightLogItem({ log, onDelete, isDeleting }: WeightLogItemProps) {
  return (
    <li>
      {log.weight} kg - {log.recorded_at}
      <button disabled={isDeleting} onClick={() => onDelete(log.id)}>Borrar</button>
    </li>
  );
}
