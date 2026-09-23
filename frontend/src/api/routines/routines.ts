import type { PaginatedResponse } from "../../types/paginated";
import type {
  CreateRoutinePayload,
  Routine,
  UpdateRoutinePayload,
} from "../../types/routines/routines";
import api from "../axios";

export default function routinesRequest() {
  return api.get<PaginatedResponse<Routine>>("routines/");
}

export function routineDetailRequest(id: number) {
  return api.get<Routine>(`routines/${id}/`);
}

export function createRoutineRequest(data: CreateRoutinePayload) {
  return api.post<Routine>("routines/", data);
}

export function updateRoutineRequest(id: number, data: UpdateRoutinePayload) {
  return api.patch<Routine>(`routines/${id}/`, data);
}

export function deleteRoutineRequest(id: number) {
  return api.delete(`routines/${id}/`);
}
