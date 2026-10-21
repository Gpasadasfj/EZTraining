import type { RoutineDay } from "./routineDays";

export interface RoutineValues {
  name: string;
  description: string;
}

export type WizardStep =
  | { kind: "routine" }
  | { kind: "days" }
  | { kind: "day"; day: RoutineDay; index: number }
  | { kind: "done" };