export interface WorkoutSet {
  id: number;
  workout_exercise: number;
  set_number: number;
  weight: string;
  reps: number;
  rir: number;
}

export type UpdateWorkoutSetPayload = Partial<Pick<WorkoutSet, "weight" | "reps" | "rir">>;

export interface UpdateWorkoutSetVariables {
  setId: number;
  data: UpdateWorkoutSetPayload;
}