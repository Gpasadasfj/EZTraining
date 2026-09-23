import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteRoutineDays,
  useRoutineDaysDetail,
} from "../../../hooks/routines/useRoutineDays";
import RoutineExercises from "./routinesExercises/routineExercises";

export default function RoutineDaysDetail() {
  const { id, dayId } = useParams();
  const { data, isLoading, isError, error } = useRoutineDaysDetail(
    Number(id),
    Number(dayId),
  );
  const {
    mutate,
    isPending,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteRoutineDays(Number(id));
  const navigate = useNavigate();

  const handleDelete = () => {
    mutate(Number(dayId), { onSuccess: () => navigate(`/routines/${id}`) });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      {isDeleteError && <p>{deleteError.message}</p>}

      <ul>
        <Link to={`/routines/${id}/days/${dayId}/exercises/new`}>
          {" "}
          Añadir ejercicio
        </Link>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
        <RoutineExercises routineId={Number(id)} dayId={Number(dayId)} />
        <button disabled={isPending} onClick={() => handleDelete()}>
          Eliminar dia
        </button>
      </ul>
    </div>
  );
}
