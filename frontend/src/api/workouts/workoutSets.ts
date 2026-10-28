import type { PaginatedResponse } from "../../types/paginated";
import type {
  SetDraft,
  UpdateWorkoutSetPayload,
  WorkoutSet,
} from "../../types/workouts/workoutSets";
import { toSetValues } from "../../utils/setForm";
import api from "../axios";

export default function workoutSetsRequest(
  workoutId: number,
  exerciseId: number,
) {
  return api.get<PaginatedResponse<WorkoutSet>>(
    `workouts/${workoutId}/exercises/${exerciseId}/sets/`,
  );
}

export function workoutSetDetailRequest(
  workoutId: number,
  exerciseId: number,
  setId: number,
) {
  return api.get<WorkoutSet>(
    `workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}/`,
  );
}

export function updateWorkoutSetRequest(
  workoutId: number,
  exerciseId: number,
  setId: number,
  data: UpdateWorkoutSetPayload,
) {
  return api.patch<WorkoutSet>(
    `workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}/`,
    data,
  );
}

// Guarda los valores escritos sin tocar "completed": las peticiones salen a la vez
export function saveSetDraftsRequest(
  workoutId: number,
  drafts: Record<number, SetDraft>,
) {
  return Promise.all(
    Object.entries(drafts).map(([setId, draft]) =>
      updateWorkoutSetRequest(
        workoutId,
        draft.exerciseId,
        Number(setId),
        toSetValues(draft.form),
      ),
    ),
  );
}
