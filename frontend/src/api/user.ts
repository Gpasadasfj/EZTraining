import { type PaginatedResponse } from "../types/paginated";
import {
  type CreateWeightLogPayload,
  type UpdateUserPayload,
  type User,
  type WeightLog,
} from "../types/users";
import api from "./axios";

export default function meRequest() {
  return api.get<User>("users/me/");
}

export function updateMeRequest(data: UpdateUserPayload) {
  return api.patch<User>("users/me/", data);
}

export function uploadAvatarRequest(file: File) {
  const data = new FormData();
  data.append("avatar", file);
  return api.put<User>("users/me/avatar/", data);
}

export function removeAvatarRequest() {
  return api.delete("users/me/avatar/");
}

// pageUrl: el "next" de la página anterior (null = la primera)
export function weightLogRequest(pageUrl: string | null = null) {
  return api.get<PaginatedResponse<WeightLog>>(pageUrl ?? "users/weight-logs/");
}

export function createWeightLogRequest(data: CreateWeightLogPayload) {
  return api.post<WeightLog>("users/weight-logs/", data);
}

export function deleteWeightLogRequest(id: number) {
  return api.delete(`users/weight-logs/${id}/`);
}
