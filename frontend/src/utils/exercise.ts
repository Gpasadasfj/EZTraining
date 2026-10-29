import type { Exercise } from "../types/exercises";

// Pasos de un ejercicio como lista, vengan como lista o como objeto
export function getSteps(
  instructions: Exercise["instructions_es"] | null | undefined,
) {
  if (!instructions) return [];
  return Array.isArray(instructions)
    ? instructions
    : Object.values(instructions);
}
