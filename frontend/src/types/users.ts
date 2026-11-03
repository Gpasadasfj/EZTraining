export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  height: string | null; // metros, "1.78"
  current_weight: string | null; // sale del último registro de peso
  target_weight: string | null;
}

// avatar y current_weight no van: son de solo lectura en el backend
export type UpdateUserPayload = Partial<
  Pick<User, "first_name" | "last_name" | "height" | "target_weight">
>;

export interface WeightLog {
  id: number;
  weight: string;
  recorded_at: string;
}

export interface CreateWeightLogPayload {
  weight: string;
}
