import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateRoutineExercise,
  useRoutineExerciseDetail,
  useUpdateRoutineExercise,
} from "../../../../hooks/routines/useRoutineExercises";
import type { UpdateRoutineExerciseVariables } from "../../../../types/routines/routineExercises";
import ExercisePicker from "./exercisePicker";

export default function RoutineExerciseForm() {
  const { id, dayId, exerciseId } = useParams();
  const navigate = useNavigate();

  const {
    mutate: createMutate,
    isPending: isCreating,
    isError: isCreatingError,
    error: createError,
  } = useCreateRoutineExercise(Number(id), Number(dayId));
  const {
    mutate: updateMutate,
    isPending: isUpdating,
    isError: isUpdatingError,
    error: updateError,
  } = useUpdateRoutineExercise(Number(id), Number(dayId));
  const { data, isLoading, isError, error } = useRoutineExerciseDetail(
    Number(id),
    Number(dayId),
    Number(exerciseId),
  );

  const [exercise, setExercise] = useState<number>();
  const [order, setOrder] = useState<number>();
  const [targetSets, setTargetSets] = useState<number>();
  const [minReps, setMinReps] = useState<number>();
  const [maxReps, setMaxReps] = useState<number>();
  const [targetRir, setTargetRir] = useState<number>();
  const [restTime, setRestTime] = useState<number>();
  const [exerciseName, setExerciseName] = useState<string>();

  useEffect(() => {
    if (data) {
      setExercise(data.exercise);
      setOrder(data.order);
      setTargetSets(data.target_sets);
      setMinReps(data.min_reps);
      setMaxReps(data.max_reps);
      setTargetRir(data.target_rir);
      setRestTime(data.rest_time);
      setExerciseName(data.exercise_name);
    }
  }, [data]);

  const updatePayload: UpdateRoutineExerciseVariables = {
    exerciseId: Number(exerciseId),
    data: {
      exercise,
      order,
      target_sets: targetSets,
      min_reps: minReps,
      max_reps: maxReps,
      target_rir: targetRir,
      rest_time: restTime,
    },
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!exercise) return;

    if (exerciseId) {
      updateMutate(updatePayload, {
        onSuccess: () => navigate(`/routines/${id}/days/${dayId}`),
      });
    } else {
      createMutate(
        {
          exercise: Number(exercise),
          target_sets: Number(targetSets),
          min_reps: Number(minReps),
          max_reps: Number(maxReps),
          target_rir: Number(targetRir),
          rest_time: Number(restTime),
        },
        { onSuccess: () => navigate(`/routines/${id}/days/${dayId}`) },
      );
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <ExercisePicker
        selectedName={exerciseName}
        onSelect={(ex) => {
          setExercise(ex.id);
          setExerciseName(ex.name_es);
        }}
      />
      <p>Orden</p>
      <input
        type="number"
        value={order ?? ""}
        onChange={(e) => setOrder(Number(e.target.value))}
      />
      <p>Series objetivo</p>
      <input
        type="number"
        value={targetSets ?? ""}
        onChange={(e) => setTargetSets(Number(e.target.value))}
      />
      <p>Repeticiones mínimas</p>
      <input
        type="number"
        value={minReps ?? ""}
        onChange={(e) => setMinReps(Number(e.target.value))}
      />
      <p>Repeticiones máximas</p>
      <input
        type="number"
        value={maxReps ?? ""}
        onChange={(e) => setMaxReps(Number(e.target.value))}
      />
      <p>RIR objetivo</p>
      <input
        type="number"
        value={targetRir ?? ""}
        onChange={(e) => setTargetRir(Number(e.target.value))}
      />
      <p>Descanso (segundos)</p>
      <input
        type="number"
        value={restTime ?? ""}
        onChange={(e) => setRestTime(Number(e.target.value))}
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
