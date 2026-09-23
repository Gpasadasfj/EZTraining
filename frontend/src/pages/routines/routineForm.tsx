import React, { useEffect, useState } from "react";
import {
  useCreateRoutine,
  useRoutineDetail,
  useUpdateRoutine,
} from "../../hooks/routines/useRoutines";
import { useNavigate, useParams } from "react-router-dom";
import type { UpdateRoutineVariables } from "../../types/routines/routines";

export default function RoutineForm() {
  const {
    mutate: createMutate,
    isPending: isCreating,
    isError: isCreatingError,
    error: createError,
  } = useCreateRoutine();
  const {
    mutate: updateMutate,
    isPending: isUpdating,
    isError: isUpdatingError,
    error: updateError,
  } = useUpdateRoutine();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useRoutineDetail(Number(id));
  const navigate = useNavigate();

  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const updatePayload: UpdateRoutineVariables = {
    id: Number(id),
    data: { name: routineName, description: routineDescription },
  };

  useEffect(() => {
    if (data) {
      setRoutineName(data.name);
      setRoutineDescription(data.description);
    }
  }, [data]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (id) {
      updateMutate(updatePayload, { onSuccess: () => navigate("/routines") });
    } else {
      createMutate(
        { name: routineName, description: routineDescription },
        { onSuccess: () => navigate("/routines") },
      );
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <p>Nombre de la rutina</p>
      <input
        type="text"
        value={routineName}
        onChange={(e) => setRoutineName(e.target.value)}
      />
      <p>Descripción</p>
      <input
        type="text"
        value={routineDescription}
        onChange={(e) => setRoutineDescription(e.target.value)}
      />
      {(isCreatingError || isUpdatingError) && (
        <p>Error: {(createError ?? updateError)?.message}</p>
      )}
      <button disabled={isCreating || isUpdating} type="submit">
        Enviar
      </button>
    </form>
  );
}
