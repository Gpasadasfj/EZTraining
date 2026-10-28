import { isAxiosError } from "axios";

// El backend explica el motivo en routine_day (día vacío, día de otro usuario…)
export function getStartWorkoutError(error: unknown) {
  if (isAxiosError<{ routine_day?: string[] }>(error)) {
    const message = error.response?.data?.routine_day?.[0];
    if (message) return message;
  }
  return "No se pudo empezar el entreno. Inténtalo de nuevo.";
}
