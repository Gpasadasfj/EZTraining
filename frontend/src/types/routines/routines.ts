export interface Routine {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: number;
  routine_day: number;
  exercise: number;
  order: number;
  target_sets: number;
  min_reps: number;
  max_reps: number;
  target_rir: number;
  rest_time: number;
  created_at: string;
  updated_at: string;
}

export type CreateRoutinePayload = Pick<Routine, "name" | "description">;

export type UpdateRoutinePayload = Partial<CreateRoutinePayload>;

export type UpdateRoutineVariables = {
    id: number;
    data: UpdateRoutinePayload;
};

export type CreateRoutineExercisePayload = Pick<
  RoutineExercise,
  "exercise" | "target_sets" | "min_reps" | "max_reps" | "target_rir" | "rest_time"
> &
  Partial<Pick<RoutineExercise, "order">>;

export type UpdateRoutineExercisePayload = Partial<
  Pick<
    RoutineExercise,
    "exercise" | "order" | "target_sets" | "min_reps" | "max_reps" | "target_rir" | "rest_time"
  >
>;