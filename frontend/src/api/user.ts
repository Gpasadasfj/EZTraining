import { type PaginatedResponse } from "../types/paginated";
import {
  type WeightLog,
  type UpdateUserPayload,
  type User,
  type CreateWeightLogPayload,
} from "../types/users";
import api from "./axios";

export default function meRequest() {
  return api.get<User>("users/me/");
}

export function updateMeRequest(data: UpdateUserPayload) {
  return api.patch<User>("users/me/", data);
}

export function weightLogRequest() {
  return api.get<PaginatedResponse<WeightLog>>("users/weight-logs/");
}

export function createWeightLogRequest(data: CreateWeightLogPayload) {
  return api.post<WeightLog>("users/weight-logs/", data);
}

export function deleteWeightLogRequest(id: number) {
  return api.delete(`users/weight-logs/${id}/`);
}
