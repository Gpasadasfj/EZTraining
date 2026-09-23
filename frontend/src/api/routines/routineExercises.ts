import type { PaginatedResponse } from "../../types/paginated";
import type {
  CreateRoutineExercisePayload,
  RoutineExercise,
  UpdateRoutineExercisePayload,
} from "../../types/routines/routineExercises";
import api from "../axios";

export default function routineExercisesRequest(routineId: number, dayId: number) {
  return api.get<PaginatedResponse<RoutineExercise>>(
    `routines/${routineId}/days/${dayId}/exercises/`,
  );
}

export function routineExercisesDetailRequest(
  routineId: number,
  dayId: number,
  exerciseId: number,
) {
  return api.get<RoutineExercise>(
    `routines/${routineId}/days/${dayId}/exercises/${exerciseId}/`,
  );
}

export function createRoutineExercisesRequest(
  routineId: number,
  dayId: number,
  data: CreateRoutineExercisePayload,
) {
  return api.post<RoutineExercise>(
    `routines/${routineId}/days/${dayId}/exercises/`,
    data,
  );
}

export function updateRoutineExercisesRequest(
  routineId: number,
  dayId: number,
  exerciseId: number,
  data: UpdateRoutineExercisePayload,
) {
  return api.patch<RoutineExercise>(
    `routines/${routineId}/days/${dayId}/exercises/${exerciseId}/`,
    data,
  );
}

export function deleteRoutineExercisesRequest(
  routineId: number,
  dayId: number,
  exerciseId: number,
) {
  return api.delete(`routines/${routineId}/days/${dayId}/exercises/${exerciseId}/`);
}