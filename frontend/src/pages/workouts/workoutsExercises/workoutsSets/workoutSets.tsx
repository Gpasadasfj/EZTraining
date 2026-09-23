import { useState } from "react";
import useWorkoutSets, {
  useUpdateWorkoutSet,
} from "../../../../hooks/workouts/useWorkoutSets";
import type { UpdateWorkoutSetPayload, WorkoutSet } from "../../../../types/workouts/workoutSets";

interface WorkoutSetsProps {
  workoutId: number;
  exerciseId: number;
}

export default function WorkoutSets({ workoutId, exerciseId }: WorkoutSetsProps) {
  const { data, isLoading, isError, error } = useWorkoutSets(workoutId, exerciseId);
  const {
    mutate,
    isPending,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateWorkoutSet(workoutId, exerciseId);
  const [setValues, setSetValues] = useState<Record<number, UpdateWorkoutSetPayload>>({});

  if (isLoading) return <p>Cargando series...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const handleChange = (
    setId: number,
    field: keyof UpdateWorkoutSetPayload,
    value: string,
  ) => {
    setSetValues((prev) => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: field === "weight" ? value : Number(value),
      },
    }));
  };

  const handleSave = (set: WorkoutSet) => {
    const edited = setValues[set.id];
    if (!edited) return;
    mutate({ setId: set.id, data: edited });
  };

  return (
    <div>
      {isUpdateError && <p>{updateError.message}</p>}
      <ul>
        {data.results.map((set: WorkoutSet) => (
          <li key={set.id}>
            <p>Serie {set.set_number}</p>
            <label>
              Peso (kg)
              <input
                type="text"
                value={setValues[set.id]?.weight ?? set.weight}
                onChange={(e) => handleChange(set.id, "weight", e.target.value)}
              />
            </label>
            <label>
              Reps
              <input
                type="number"
                value={setValues[set.id]?.reps ?? set.reps}
                onChange={(e) => handleChange(set.id, "reps", e.target.value)}
              />
            </label>
            <label>
              RIR
              <input
                type="number"
                value={setValues[set.id]?.rir ?? set.rir}
                onChange={(e) => handleChange(set.id, "rir", e.target.value)}
              />
            </label>
            <button disabled={isPending} onClick={() => handleSave(set)}>
              Guardar serie
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}