export interface Workout {
  id: number;
  routine_day: number;
  routine_name: string;
  routine_day_name: string;
  started_at: string;
  finished_at: string | null;
  duration: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActiveWorkout extends Workout {
  total_sets: number;
  completed_sets: number;
}

export type CreateWorkoutPayload = Pick<Workout, "routine_day">;