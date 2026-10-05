import { Link } from "react-router-dom";
import useRoutines from "../../hooks/routines/useRoutines";
import type { Routine } from "../../types/routines/routines";

export default function Routines() {
  const { data, isLoading, isError, error } = useRoutines();

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <Link to="/routines/new">Crear rutina</Link>
      <ul>
        {data.results.map((routine: Routine) => (
          <li key={routine.id}>
            <p>{routine.name}</p>
            <p>{routine.description}</p>

            <Link to={`/routines/${routine.id}`}>Detalle de rutina</Link>
            <Link to={`/routines/update/${routine.id}`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
