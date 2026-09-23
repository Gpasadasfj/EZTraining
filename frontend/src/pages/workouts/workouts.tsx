import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoutines from "../../hooks/routines/useRoutines";
import useRoutineDays from "../../hooks/routines/useRoutineDays";
import { useWorkoutsCreate } from "../../hooks/workouts/useWorkouts";

export default function Workouts() {
  const {
    data: routines,
    isLoading: isLoadingRoutines,
    isError: isRoutinesError,
    error: routinesError,
  } = useRoutines();
  const [selectedRoutineId, setSelectedRoutineId] = useState<number>();
  const [selectedDayId, setSelectedDayId] = useState<number>();

  const {
    data: days,
    isLoading: isLoadingDays,
    isError: isDaysError,
    error: daysError,
  } = useRoutineDays(Number(selectedRoutineId));

  const {
    mutate,
    isPending,
    isError: isCreateError,
    error: createError,
  } = useWorkoutsCreate();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!selectedDayId) return;

    mutate(
      { routine_day: selectedDayId },
      {
        onSuccess: (workout) => navigate(`/workouts/${workout.id}`),
      },
    );
  };

  if (isLoadingRoutines) return <p>Cargando...</p>;
  if (isRoutinesError) return <p>Error: {routinesError.message}</p>;
  if (!routines) return null;

  return (
    <div>
      <p>Elige una rutina</p>
      <select
        value={selectedRoutineId ?? ""}
        onChange={(e) => {
          setSelectedRoutineId(Number(e.target.value));
          setSelectedDayId(undefined);
        }}
      >
        <option value="">-- Selecciona --</option>
        {routines.results.map((routine) => (
          <option key={routine.id} value={routine.id}>
            {routine.name}
          </option>
        ))}
      </select>

      {selectedRoutineId && (
        <>
          <p>Elige un día</p>
          {isLoadingDays && <p>Cargando días...</p>}
          {isDaysError && <p>Error: {daysError.message}</p>}
          {days && (
            <select
              value={selectedDayId ?? ""}
              onChange={(e) => setSelectedDayId(Number(e.target.value))}
            >
              <option value="">-- Selecciona --</option>
              {days.results.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.name}
                </option>
              ))}
            </select>
          )}
        </>
      )}

      {isCreateError && <p>Error: {createError.message}</p>}

      <button disabled={!selectedDayId || isPending} onClick={handleStart}>
        Empezar entreno
      </button>
    </div>
  );
}
