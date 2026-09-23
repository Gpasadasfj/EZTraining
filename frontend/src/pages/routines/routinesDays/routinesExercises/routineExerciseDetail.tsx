import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteRoutineExercise,
  useRoutineExerciseDetail,
} from "../../../../hooks/routines/useRoutineExercises";

export default function RoutineExerciseDetail() {
  const { id, dayId, exerciseId } = useParams();
  const { data, isLoading, isError, error } = useRoutineExerciseDetail(
    Number(id),
    Number(dayId),
    Number(exerciseId),
  );
  const {
    mutate,
    isPending,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteRoutineExercise(Number(id), Number(dayId));
  const navigate = useNavigate();

  const handleDelete = () => {
    mutate(Number(exerciseId), {
      onSuccess: () => navigate(`/routines/${id}/days/${dayId}`),
    });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      {isDeleteError && <p>{deleteError.message}</p>}
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
        <button disabled={isPending} onClick={() => handleDelete()}>
          Eliminar ejercicio
        </button>
      </ul>
    </div>
  );
}
