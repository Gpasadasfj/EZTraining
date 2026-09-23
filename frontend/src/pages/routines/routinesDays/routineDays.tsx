import { Link } from "react-router-dom";
import useRoutineDays from "../../../hooks/routines/useRoutineDays";
import type { RoutineDay } from "../../../types/routines/routineDays";

interface RoutineDaysProps {
  routineId: number;
}

export default function RoutineDays({ routineId }: RoutineDaysProps) {
  const { data, isLoading, isError, error } = useRoutineDays(routineId);

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <ul>
        {data.results.map((day: RoutineDay) => (
          <li key={day.id}>
            <p>orden: {day.order}</p>
            <p>{day.name}</p>
            <Link to={`/routines/${routineId}/days/${day.id}`}>Detalle de dia</Link>
            <Link to={`/routines/${routineId}/days/${day.id}/update`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
