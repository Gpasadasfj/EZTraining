import type { PaginatedResponse } from "../../types/paginated";
import type { UpdateWorkoutSetPayload, WorkoutSet } from "../../types/workouts/workoutSets";
import api from "../axios";

export default function workoutSetsRequest(workoutId: number, exerciseId: number) {
  return api.get<PaginatedResponse<WorkoutSet>>(
    `workouts/${workoutId}/exercises/${exerciseId}/sets/`,
  );
}

export function workoutSetDetailRequest(workoutId: number, exerciseId: number, setId: number) {
  return api.get<WorkoutSet>(`workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}/`);
}

export function updateWorkoutSetRequest(
  workoutId: number,
  exerciseId: number,
  setId: number,
  data: UpdateWorkoutSetPayload,
) {
  return api.patch<WorkoutSet>(
    `workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}/`,
    data,
  );
}