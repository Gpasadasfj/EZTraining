import type { SetValues } from "./workoutSets";

export interface SummaryExercise {
  id: number;
  exercise_name: string;
  target_sets: number;
  sets: SetValues[];
}

export interface WorkoutSummary {
  id: number;
  routine_name: string;
  routine_day_name: string;
  started_at: string;
  finished_at: string | null;
  completed: boolean;
  duration_seconds: number | null;
  total_sets: number;
  completed_sets: number;
  volume: string | null; // DecimalField: "9840.00"; null si no hay series hechas
  exercises: SummaryExercise[];
}
