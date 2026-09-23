export interface RoutineDay {
  id: number;
  routine: number;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
}
export type CreateRoutineDayPayload = Pick<RoutineDay, "name"> &
  Partial<Pick<RoutineDay, "order">>;

export type UpdateRoutineDayPayload = Partial<
  Pick<RoutineDay, "name" | "order">
>;

export interface UpdateRoutineDayVariables {
  dayId: number;
  data: UpdateRoutineDayPayload;
}