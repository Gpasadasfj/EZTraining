import { useState } from "react";
import useWorkoutSets, {
  useUpdateWorkoutSet,
} from "../../../../hooks/workouts/useWorkoutSets";
import type {
  WorkoutSet,
} from "../../../../types/workouts/workoutSets";

interface WorkoutSetsProps {
  workoutId: number;
  exerciseId: number;
}

interface SetForm {
  weight: string;
  reps: string;
  rir: string;
}

// Valores guardados en el backend → texto para los inputs
const toForm = (set: WorkoutSet): SetForm => ({
  weight: set.weight ?? "",
  reps: set.reps?.toString() ?? "",
  rir: set.rir?.toString() ?? "",
});

// Texto del input → número o null para el backend
const toNumber = (value: string) => (value === "" ? null : Number(value));

export default function WorkoutSets({ workoutId, exerciseId }: WorkoutSetsProps) {
  const { data, isLoading, isError, error } = useWorkoutSets(workoutId, exerciseId);
  const { mutate, isPending, isError: isUpdateError, error: updateError } =
    useUpdateWorkoutSet(workoutId, exerciseId);
  const [forms, setForms] = useState<Record<number, SetForm>>({});

  if (isLoading) return <p>Cargando series...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const getForm = (set: WorkoutSet) => forms[set.id] ?? toForm(set);

  const handleChange = (set: WorkoutSet, field: keyof SetForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [set.id]: { ...(prev[set.id] ?? toForm(set)), [field]: value },
    }));
  };

  const handleSave = (set: WorkoutSet) => {
    const form = getForm(set);
    mutate({
      setId: set.id,
      data: {
        weight: form.weight === "" ? null : form.weight.replace(",", "."),
        reps: toNumber(form.reps),
        rir: toNumber(form.rir),
        completed: true,
      },
    });
  };

  return (
    <div>
      {isUpdateError && <p>{updateError.message}</p>}
      <ul>
        {data.results.map((set: WorkoutSet) => {
          const form = getForm(set);
          return (
            <li key={set.id}>
              <p>Serie {set.set_number}</p>
              <label>
                Peso (kg)
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.weight}
                  onChange={(e) => handleChange(set, "weight", e.target.value)}
                />
              </label>
              <label>
                Reps
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.reps}
                  onChange={(e) => handleChange(set, "reps", e.target.value)}
                />
              </label>
              <label>
                RIR
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.rir}
                  onChange={(e) => handleChange(set, "rir", e.target.value)}
                />
              </label>
              <button disabled={isPending} onClick={() => handleSave(set)}>
                {set.completed ? "✓ Completada" : "Guardar serie"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}