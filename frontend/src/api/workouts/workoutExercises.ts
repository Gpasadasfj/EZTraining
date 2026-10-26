import type { PaginatedResponse } from "../../types/paginated";
import type {
  UpdateWorkoutExercisePayload,
  WorkoutExercise,
} from "../../types/workouts/workoutExercises";
import type { PreviousSets } from "../../types/workouts/workoutSets";
import api from "../axios";

export default function workoutExercisesRequest(workoutId: number) {
  return api.get<PaginatedResponse<WorkoutExercise>>(`workouts/${workoutId}/exercises/`);
}

export function workoutExerciseDetailRequest(workoutId: number, exerciseId: number) {
  return api.get<WorkoutExercise>(`workouts/${workoutId}/exercises/${exerciseId}/`);
}

export function previousWorkoutExerciseRequest(workoutId: number, exerciseId: number) {
  return api.get<PreviousSets>(`workouts/${workoutId}/exercises/${exerciseId}/previous/`);
}

export function updateWorkoutExerciseRequest(
  workoutId: number,
  exerciseId: number,
  data: UpdateWorkoutExercisePayload,
) {
  return api.patch<WorkoutExercise>(`workouts/${workoutId}/exercises/${exerciseId}/`, data);
}