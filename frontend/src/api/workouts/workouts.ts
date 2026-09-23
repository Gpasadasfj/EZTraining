import { type PaginatedResponse } from "../../types/paginated";
import type { CreateWorkoutPayload, Workout } from "../../types/workouts/workouts";
import api from "../axios";

export default function workoutsRequest() {
    return api.get<PaginatedResponse<Workout>>("workouts/")
}

export function workoutsDetailRequest(id:number) {
    return api.get<Workout>(`workouts/${id}/`)
}

export function workoutsCreateRequest(data: CreateWorkoutPayload) {
    return api.post<Workout>("workouts/", data)
}

export function finishWorkoutRequest(id: number) {
  return api.post<Workout>(`workouts/${id}/finish/`);
}