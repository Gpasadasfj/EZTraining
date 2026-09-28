import { useState } from "react";
import useWorkoutExercises, {
  useUpdateWorkoutExercise,
} from "../../../hooks/workouts/useWorkoutExercises";
import type { WorkoutExercise } from "../../../types/workouts/workoutExercises";
import WorkoutSets from "./workoutsSets/workoutSets";

interface WorkoutExercisesProps {
  workoutId: number;
}

export default function WorkoutExercises({ workoutId }: WorkoutExercisesProps) {
  const { data, isLoading, isError, error } = useWorkoutExercises(workoutId);
  const {
    mutate,
    isPending,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateWorkoutExercise(workoutId);
  const [orderValues, setOrderValues] = useState<Record<number, number>>({});

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const handleUpdateOrder = (exerciseId: number) => {
    const newOrder = orderValues[exerciseId];
    if (newOrder === undefined) return;
    mutate(
      { exerciseId, data: { order: newOrder } },
      { onSuccess: () => setOrderValues({}) },
    );
  };

  return (
    <div>
      {isUpdateError && <p>{updateError.message}</p>}
      <ul>
        {data.results.map((exercise: WorkoutExercise) => (
          <li key={exercise.id}>
            <p>ejercicio: {exercise.exercise_name}</p>
            {exercise.exercise_image && (
              <img src={exercise.exercise_image} alt={exercise.exercise_name} />
            )}
            <p>series objetivo: {exercise.target_sets}</p>
            <p>
              reps: {exercise.min_reps}-{exercise.max_reps}
            </p>
            <p>RIR objetivo: {exercise.target_rir}</p>
            <p>descanso: {exercise.rest_time}s</p>
            <input
              type="number"
              value={orderValues[exercise.id] ?? exercise.order}
              onChange={(e) =>
                setOrderValues((prev) => ({
                  ...prev,
                  [exercise.id]: Number(e.target.value),
                }))
              }
            />
            <button
              disabled={isPending}
              onClick={() => handleUpdateOrder(exercise.id)}
            >
              Guardar orden
            </button>
            <WorkoutSets workoutId={workoutId} exerciseId={exercise.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
