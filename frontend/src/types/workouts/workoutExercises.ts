export interface WorkoutExercise {
  id: number;
  workout: number;
  exercise: number | null; // null si el ejercicio se ha borrado
  exercise_name: string; // copia guardada en el entreno: siempre existe
  exercise_slug: string | null;
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