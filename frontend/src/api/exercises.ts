import type { Exercise } from "../types/exercises";
import type { PaginatedResponse } from "../types/paginated";
import api from "./axios";

export default function exercisesRequest(pageUrl?: string | null) {
    const url = pageUrl ?? "exercises/";
    return api.get<PaginatedResponse<Exercise>>(url);
}