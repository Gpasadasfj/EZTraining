// components/dashboard/nextWorkoutCard.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  ListChecks,
  LoaderCircle,
  Play,
  Plus,
  Repeat,
} from "lucide-react";
import type { NextWorkout } from "../../types/dashboard";
import PulseLine from "../pulseLine";
import { useWorkoutsCreate } from "../../hooks/workouts/useWorkouts";

/* ---------- Estilos compartidos ---------- */

const primaryButton =
  "inline-flex h-12 items-center gap-2 rounded-button bg-primary px-[22px] font-semibold text-on-primary shadow-[0_10px_24px_-10px_rgb(249_115_22/0.8)] transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

const linkInline =
  "font-semibold text-accent underline-offset-4 hover:underline";

const titleClass =
  "m-0 font-display text-[2.5rem] leading-[0.95] font-extrabold tracking-[0.005em] uppercase italic text-balance lg:text-[3.2rem]";

const eyebrowClass =
  "mb-1 block text-[0.5em] tracking-[0.02em] text-orange-300";

const chipBase =
  "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold tracking-[0.04em] uppercase";

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/* ---------- Contenido: hay próximo entreno ---------- */

function NextWorkoutContent({
  routine_day,
  routine_name,
  name,
  exercises_count,
  sets_count,
}: NextWorkout) {
  const hasExercises = exercises_count > 0;
  const { mutate: startWorkout, isPending } = useWorkoutsCreate();
  const navigate = useNavigate();

  function handleStart() {
    startWorkout(
      { routine_day },
      { onSuccess: (workout) => navigate(`/workouts/${workout.id}`) },
    );
  }

  return (
    <div className="relative grid gap-2">
      <h2 id="next-workout-title" className={titleClass}>
        <span className={eyebrowClass}>Próximo entreno</span>
        {name}
      </h2>

      <ul className="m-0 flex list-none flex-wrap items-center gap-x-3.5 gap-y-1.5 p-0 text-zinc-300">
        <li className="inline-flex items-center gap-1.5">
          <Layers className="size-4 text-orange-300" aria-hidden="true" />
          {routine_name}
        </li>
        {hasExercises && (
          <>
            <li className="inline-flex items-center gap-1.5">
              <ListChecks
                className="size-4 text-orange-300"
                aria-hidden="true"
              />
              {plural(exercises_count, "ejercicio", "ejercicios")}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Repeat className="size-4 text-orange-300" aria-hidden="true" />
              {plural(sets_count, "serie", "series")}
            </li>
          </>
        )}
      </ul>

      {!hasExercises && (
        <p className="m-0 text-zinc-300">
          Este día todavía no tiene ejercicios.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4.5">
        {hasExercises ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={isPending}
            className={primaryButton}
          >
            {isPending ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Play
                className="size-3.75 fill-current stroke-none"
                aria-hidden="true"
              />
            )}
            {isPending ? "Empezando…" : "Empezar entreno"}
          </button>
        ) : (
          <Link to="/routines" className={primaryButton}>
            <Plus className="size-4.5" aria-hidden="true" />
            Añadir ejercicios
          </Link>
        )}
        <Link to="/workouts" className={linkInline}>
          Elegir otro día
        </Link>
      </div>
    </div>
  );
}

/* ---------- Contenido: usuario sin rutina ---------- */

function EmptyContent() {
  return (
    <div className="relative grid gap-2">
      <h2 id="next-workout-title" className={titleClass}>
        <span className={eyebrowClass}>Bienvenido 👋</span>
        Crea tu primera rutina
      </h2>
      <p className="m-0 max-w-[48ch] text-zinc-300">
        Organiza tus días de entreno y cada vez que abras la app verás cuál te
        toca.
      </p>
      <div className="mt-4">
        <Link to="/routines" className={primaryButton}>
          <Plus className="size-4.5" aria-hidden="true" />
          Crear rutina
        </Link>
      </div>
    </div>
  );
}

/* ---------- Tarjeta ---------- */

interface NextWorkoutCardProps {
  nextWorkout: NextWorkout | null;
}

export default function NextWorkoutCard({ nextWorkout }: NextWorkoutCardProps) {
  return (
    <section
      aria-labelledby="next-workout-title"
      className={`relative grid content-end overflow-hidden rounded-card border border-line px-5 pt-21.5 pb-5 lg:px-7 lg:pt-27.5 lg:pb-7 ${
        nextWorkout
          ? "bg-[radial-gradient(90%_120%_at_100%_0%,rgb(249_115_22/0.30),transparent_62%),linear-gradient(180deg,rgb(249_115_22/0.07),transparent_70%)] bg-surface"
          : "bg-[radial-gradient(90%_120%_at_100%_0%,rgb(249_115_22/0.16),transparent_62%)] bg-surface"
      }`}
    >
      <PulseLine
        beats={[0.6]}
        beatWidth={100}
        amplitude={34}
        baseClassName="stroke-primary/35 stroke-[2.5]"
        className="absolute inset-x-0 top-2 h-19 lg:top-6 lg:h-20"
      />

      <div className="absolute top-4.5 left-5 lg:top-6 lg:left-7">
        {nextWorkout && (
          <span className={`${chipBase} bg-orange-500/15 text-orange-400`}>
            Primer paso
          </span>
        )}
      </div>

      {nextWorkout ? <NextWorkoutContent {...nextWorkout} /> : <EmptyContent />}
    </section>
  );
}
