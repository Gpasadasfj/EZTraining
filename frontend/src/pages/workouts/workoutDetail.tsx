import { useNavigate, useParams } from "react-router-dom";
import {
  useFinishWorkout,
  useWorkoutsDetail,
} from "../../hooks/workouts/useWorkouts";
import WorkoutExercises from "./workoutsExercises/workoutExercises";

export default function WorkoutDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useWorkoutsDetail(Number(id));
  const {
    mutate,
    isPending,
    isError: isFinishError,
    error: finishError,
  } = useFinishWorkout();
  const navigate = useNavigate();

  const handleFinish = () => {
    mutate(Number(id), {
      onSuccess: () => navigate("/"),
    });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      {isFinishError && <p>{finishError.message}</p>}
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
      </ul>
      <WorkoutExercises workoutId={Number(id)} />
      {!data.completed && (
        <button disabled={isPending} onClick={handleFinish}>
          Terminar entreno
        </button>
      )}
    </div>
  );
}
