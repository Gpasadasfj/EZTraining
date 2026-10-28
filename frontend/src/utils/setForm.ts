import type {
  SetForm,
  UpdateWorkoutSetPayload,
  WorkoutSet,
} from "../types/workouts/workoutSets";
import { formatDecimal } from "./format";

// Valores guardados en el backend → texto para los inputs
export const toForm = (set: WorkoutSet): SetForm => ({
  weight: formatDecimal(set.weight),
  reps: formatDecimal(set.reps),
  rir: set.rir?.toString() ?? "",
});

const toNumber = (value: string) =>
  value === "" ? null : Number(value.replace(",", "."));

// Texto de los inputs → valores para el backend ("77,5" → "77.5")
export const toSetValues = (form: SetForm): UpdateWorkoutSetPayload => ({
  weight: form.weight === "" ? null : form.weight.replace(",", "."),
  reps: toNumber(form.reps),
  rir: toNumber(form.rir),
});
