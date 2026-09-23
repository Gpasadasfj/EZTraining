import { useEffect, useState } from "react";
import {
  useCreateRoutineDays,
  useRoutineDaysDetail,
  useUpdateRoutineDays,
} from "../../../hooks/routines/useRoutineDays";
import { useNavigate, useParams } from "react-router-dom";
import type { UpdateRoutineDayVariables } from "../../../types/routines/routineDays";

export default function RoutineDayForm() {
  const { id, dayId } = useParams();

  const {
    mutate: createMutate,
    isPending: isCreating,
    isError: isCreatingError,
    error: createError,
  } = useCreateRoutineDays(Number(id));
  const {
    mutate: updateMutate,
    isPending: isUpdating,
    isError: isUpdatingError,
    error: updateError,
  } = useUpdateRoutineDays(Number(id));
  const { data, isLoading, isError, error } = useRoutineDaysDetail(
    Number(id),
    Number(dayId),
  );

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [order, setOrder] = useState<number>();

  const updateDayPayload: UpdateRoutineDayVariables = {
    dayId: Number(dayId),
    data: { name: name, order: order },
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (dayId) {
      updateMutate(updateDayPayload, {
        onSuccess: () => navigate(`/routines/${id}`),
      });
    } else {
      createMutate(
        { name: name, order: order },
        { onSuccess: () => navigate(`/routines/${id}`) },
      );
    }
  };

  useEffect(() => {
    if (data) {
      setName(data.name);
      setOrder(data.order);
    }
  }, [data]);

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <p>Nombre</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Orden</p>
      <input
        type="number"
        value={order ?? ""}
        onChange={(e) => setOrder(Number(e.target.value))}
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
