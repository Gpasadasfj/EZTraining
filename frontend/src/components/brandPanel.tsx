import Logo from "./layout/logo";
import WorkoutExerciseCard from "./workoutExerciseCard";
import SetRow from "./setRow";
import type { SetStatus } from "../types/workouts/workoutSets";

const DEMO_EXERCISE = {
  exercise_name: "Press banca",
  target_sets: 4,
  min_reps: 8,
  max_reps: 12,
  target_rir: 2,
  rest_time: 180,
};

const DEMO_SETS: {
  setNumber: number;
  weight: string;
  reps: string;
  rir: string;
  status: SetStatus;
}[] = [
  { setNumber: 1, weight: "80", reps: "8", rir: "2", status: "done" },
  { setNumber: 2, weight: "80", reps: "7", rir: "1", status: "done" },
  { setNumber: 3, weight: "82.5", reps: "", rir: "", status: "current" },
  { setNumber: 4, weight: "", reps: "", rir: "", status: "pending" },
];

export default function BrandPanel() {
  return (
    <div className="grid max-w-lg gap-7">
      <Logo className="text-4xl" />

      <h2 className="font-display text-6xl leading-[0.92] font-extrabold text-balance uppercase italic xl:text-7xl">
        Cada serie <span className="text-accent">cuenta.</span>
      </h2>

      <p className="max-w-[44ch] text-lg text-fg-muted">
        Planifica tus rutinas, registra el peso, las repeticiones y el RIR de
        cada serie, y mira cómo progresas semana a semana.
      </p>

      <div className="pointer-events-none">
        <WorkoutExerciseCard dayName="Push · Día 1" exercise={DEMO_EXERCISE}>
          {DEMO_SETS.map((set) => (
            <SetRow
              key={set.setNumber}
              {...set}
              repsPlaceholder={`${DEMO_EXERCISE.min_reps}–${DEMO_EXERCISE.max_reps}`}
              rirPlaceholder={String(DEMO_EXERCISE.target_rir)}
            />
          ))}
        </WorkoutExerciseCard>
      </div>
    </div>
  );
}
