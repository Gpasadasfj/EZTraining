import type {
  CreateExercisePayload,
  Exercise,
  ExerciseFilters,
  FilterOption,
  UpdateExercisePayload,
} from "../types/exercises";
import type { PaginatedResponse } from "../types/paginated";
import api from "./axios";

// pageUrl: la URL "next" que devuelve DRF, que ya incluye filtros y búsqueda
export function exercisesRequest(
  pageUrl: string | null,
  filters: ExerciseFilters,
  search = "",
) {
  if (pageUrl) return api.get<PaginatedResponse<Exercise>>(pageUrl);
  return api.get<PaginatedResponse<Exercise>>("exercises/", {
    params: buildExerciseParams(search, filters),
  });
}

export function exerciseDetailRequest(slug: string) {
  return api.get<Exercise>(`exercises/${slug}/`);
}

export function createExerciseRequest(data: CreateExercisePayload) {
  return api.post<Exercise>("exercises/", data);
}

export function updateExerciseRequest(slug: string, data: UpdateExercisePayload) {
  return api.patch<Exercise>(`exercises/${slug}/`, data);
}

export function deleteExerciseRequest(slug: string) {
  return api.delete(`exercises/${slug}/`);
}

function buildExerciseParams(search: string, filters: ExerciseFilters) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (filters.muscle !== null) params.append("muscle", String(filters.muscle));
  filters.secondaryMuscles.forEach((id) =>
    params.append("secondary_muscles", String(id)),
  );
  filters.equipment.forEach((id) => params.append("equipment", String(id)));
  if (filters.custom !== undefined)
    params.append("custom", String(filters.custom));

  return params;
}

export function searchExercisesRequest(
  search: string,
  filters: ExerciseFilters,
) {
  return api.get<PaginatedResponse<Exercise>>("exercises/", {
    params: buildExerciseParams(search, filters),
  });
}

export function musclesRequest() {
  return api.get<FilterOption[]>("exercises/muscles/");
}

export function equipmentRequest() {
  return api.get<FilterOption[]>("exercises/equipment/");
}