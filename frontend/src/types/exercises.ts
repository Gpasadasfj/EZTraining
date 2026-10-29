export interface Exercise {
  id: number;
  slug: string;
  name_es: string;
  instructions_es: string[];
  image: string | null;
  body_part: string | null; // los ejercicios propios no tienen
  muscle: string;
  muscle_id: number;
  secondary_muscles: string[];
  secondary_muscle_ids: number[];
  equipment: string[];
  equipment_ids: number[];
  is_custom: boolean;
}

export interface FilterOption {
  id: number;
  name: string;
}

export interface ExerciseFilters {
  muscle: number | null;
  secondaryMuscles: number[];
  equipment: number[];
  // true: solo los míos · false: solo el catálogo · sin definir: todos
  custom?: boolean;
}

// Lo que se envía al crear: el selector de rutinas solo manda nombre y músculo
export interface CreateExercisePayload {
  name: string;
  muscle: number;
  secondary_muscles?: number[];
  equipment?: number[];
  instructions?: string[];
}

export type UpdateExercisePayload = Partial<CreateExercisePayload>;

export interface UpdateExerciseVariables {
  slug: string;
  data: UpdateExercisePayload;
}