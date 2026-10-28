// DRF devuelve los DecimalField como texto: "80.00", "8.00"
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

// Solo los valores de una serie: para el último entreno y el resumen
export type SetValues = Pick<WorkoutSet, "set_number" | "weight" | "reps" | "rir">;

export interface PreviousSets {
  finished_at: string | null;
  sets: SetValues[];
}

export type SetStatus = "done" | "current" | "pending";
export type SetField = "weight" | "reps" | "rir";

// Lo que hay escrito en los inputs de una serie
export type SetForm = Record<SetField, string>;

// Una serie escrita y sin guardar; exerciseId hace falta para la URL de la petición
export interface SetDraft {
  exerciseId: number;
  form: SetForm;
}