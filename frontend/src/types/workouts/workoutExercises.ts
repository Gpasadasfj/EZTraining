export interface WorkoutExercise {
  id: number;
  workout: number;
  exercise: number;
  exercise_name: string;
  exercise_image: string | null;
  order: number;
  target_sets: number;
  min_reps: number;
  max_reps: number;
  target_rir: number;
  rest_time: number;
}

export type UpdateWorkoutExercisePayload = Partial<Pick<WorkoutExercise, "order">>;

export interface UpdateWorkoutExerciseVariables {
  exerciseId: number;
  data: UpdateWorkoutExercisePayload;
}