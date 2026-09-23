import { Link } from "react-router-dom";
import useRoutineExercises from "../../../../hooks/routines/useRoutineExercises";
import type { RoutineExercise } from "../../../../types/routines/routineExercises";

interface RoutineExercisesProps {
  routineId: number;
  dayId: number;
}

export default function RoutineExercises({ routineId, dayId }: RoutineExercisesProps) {
  const { data, isLoading, isError, error } = useRoutineExercises(routineId, dayId);

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <ul>
        {data.results.map((exercise: RoutineExercise) => (
          <li key={exercise.id}>
            <p>orden: {exercise.order}</p>
            <p>ejercicio id: {exercise.exercise}</p>
            <p>series: {exercise.target_sets}</p>
            <p>reps: {exercise.min_reps}-{exercise.max_reps}</p>
            <p>RIR objetivo: {exercise.target_rir}</p>
            <p>descanso: {exercise.rest_time}s</p>
            <Link to={`/routines/${routineId}/days/${dayId}/exercises/${exercise.id}`}>
              Detalle
            </Link>
            <Link to={`/routines/${routineId}/days/${dayId}/exercises/${exercise.id}/update`}>
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}