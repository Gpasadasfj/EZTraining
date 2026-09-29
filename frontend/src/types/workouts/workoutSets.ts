export interface WorkoutSet {
  id: number;
  workout_exercise: number;
  set_number: number;
  weight: string | null;
  reps: number | null;
  rir: number | null;
  completed: boolean;
}

export type UpdateWorkoutSetPayload = Partial<
  Pick<WorkoutSet, "weight" | "reps" | "rir" | "completed">
>;

export interface UpdateWorkoutSetVariables {
  setId: number;
  data: UpdateWorkoutSetPayload;
}

export type SetStatus = "done" | "current" | "pending";
export type SetField = "weight" | "reps" | "rir";
