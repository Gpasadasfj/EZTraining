import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteRoutine,
  useRoutineDetail,
} from "../../hooks/routines/useRoutines";
import RoutineDays from "./routinesDays/routineDays";

export default function RoutineDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useRoutineDetail(Number(id));
  const {
    mutate,
    isPending,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteRoutine();
  const navigate = useNavigate();

  const handleDelete = () => {
    mutate(Number(id), { onSuccess: () => navigate("/routines") });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      {isDeleteError && <p>{deleteError.message}</p>}
      <Link to={`/routines/${id}/days/new`}>Añadir dia de rutina</Link>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
        <RoutineDays routineId={Number(id)}/>
        <button disabled={isPending} onClick={() => handleDelete()}>
          Eliminar rutina
        </button>
      </ul>
    </div>
  );
}
