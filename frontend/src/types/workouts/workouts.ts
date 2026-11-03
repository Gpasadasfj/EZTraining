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

export interface WorkoutHistoryItem {
  id: number;
  routine_name: string;
  routine_day_name: string | null;
  started_at: string;
  finished_at: string;
  duration_seconds: number | null;
  total_sets: number;
  completed_sets: number;
  volume: string | null; // null si no hay series completadas (Sum de nada)
}
