import type {
  CreateExercisePayload,
  Exercise,
  ExerciseFilters,
  FilterOption,
} from "../types/exercises";
import type { PaginatedResponse } from "../types/paginated";
import api from "./axios";

export function exercisesRequest(
  pageUrl: string | null,
  filters: ExerciseFilters,
) {
  if (pageUrl) return api.get<PaginatedResponse<Exercise>>(pageUrl);
  return api.get<PaginatedResponse<Exercise>>("exercises/", {
    params: buildExerciseParams("", filters),
  });
}

export function createExerciseRequest(data: CreateExercisePayload) {
  return api.post<Exercise>("exercises/", data);
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
