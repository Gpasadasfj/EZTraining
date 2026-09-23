import type { PaginatedResponse } from "../../types/paginated";
import type {
  CreateRoutineDayPayload,
  RoutineDay,
  UpdateRoutineDayPayload,
} from "../../types/routines/routineDays";
import api from "../axios";

export default function routineDaysRequest(routineId: number) {
  return api.get<PaginatedResponse<RoutineDay>>(`routines/${routineId}/days/`);
}

export function routineDaysDetailRequest(routineId: number, dayId: number) {
  return api.get<RoutineDay>(`routines/${routineId}/days/${dayId}`);
}

export function createRoutineDaysRequest(
  routineId: number,
  data: CreateRoutineDayPayload,
) {
  return api.post<RoutineDay>(`routines/${routineId}/days/`, data);
}

export function updateRoutineDaysRequest(
  routineId: number,
  dayId: number,
  data: UpdateRoutineDayPayload,
) {
  return api.patch<RoutineDay>(`routines/${routineId}/days/${dayId}/`, data);
}

export function deleteRoutineDaysRequest(routineId: number, dayId: number) {
  return api.delete(`routines/${routineId}/days/${dayId}/`);
}
