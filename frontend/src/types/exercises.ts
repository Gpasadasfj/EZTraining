export interface Exercise {
  id: number;
  slug: string;
  name_es: string;
  instructions_es: Record<string, string>;
  image: string;
  body_part: string;
  muscle: string;
  secondary_muscles: string[];
  equipment: string[];
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

export interface CreateExercisePayload {
  name: string;
  muscle: number;
}
