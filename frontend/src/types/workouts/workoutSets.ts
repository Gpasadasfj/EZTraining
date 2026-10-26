// DRF devuelve los DecimalField como texto
export interface WorkoutSet {
  id: number;
  workout_exercise: number;
  set_number: number;
  weight: string | null;
  reps: string | null;
  rir: number | null;
  completed: boolean;
}

export interface UpdateWorkoutSetPayload {
  weight?: string | null;
  reps?: number | null;
  rir?: number | null;
  completed?: boolean;
}

export interface UpdateWorkoutSetVariables {
  setId: number;
  data: UpdateWorkoutSetPayload;
}

export type PreviousSet = Pick<WorkoutSet, "set_number" | "weight" | "reps" | "rir">;

export interface PreviousSets {
  finished_at: string | null;
  sets: PreviousSet[];
}

export type SetStatus = "done" | "current" | "pending";
export type SetField = "weight" | "reps" | "rir";