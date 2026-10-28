import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { Play } from "lucide-react";
import ConfirmDialog from "../../components/ui/confirmDialog";
import DayRow from "../../components/workout/dayRow";
import useDashboard from "../../hooks/useDashboard";
import useRoutines from "../../hooks/routines/useRoutines";
import useRoutineDays from "../../hooks/routines/useRoutineDays";
import {
  useActiveWorkout,
  useWorkoutsCreate,
} from "../../hooks/workouts/useWorkouts";
import WorkoutHeroCard from "../../components/workout/workoutHeroCard";

interface PendingStart {
  dayId: number;
  dayName: string;
}

const primaryButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[background-color,scale] duration-150 hover:bg-primary-hover active:scale-97 disabled:opacity-60 lg:w-auto";

const chipClass =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium whitespace-nowrap text-fg-muted transition-colors hover:border-line-strong hover:text-fg aria-pressed:border-primary/60 aria-pressed:bg-primary-soft aria-pressed:text-accent";

// El backend explica el motivo en routine_day (día vacío, día de otro usuario…)
const getCreateError = (error: unknown) => {
  if (isAxiosError<{ routine_day?: string[] }>(error)) {
    const message = error.response?.data?.routine_day?.[0];
    if (message) return message;
  }
  return "No se pudo empezar el entreno. Inténtalo de nuevo.";
};

export default function Workouts() {
  const navigate = useNavigate();
  const { data: routines, isLoading, isError, error } = useRoutines();
  const { data: dashboard } = useDashboard();
  const { data: active } = useActiveWorkout();
  const {
    mutate,
    isPending,
    variables,
    isError: isCreateError,
    error: createError,
  } = useWorkoutsCreate();

  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(
    null,
  );
  const [pendingStart, setPendingStart] = useState<PendingStart | null>(null);

  const routineList = routines?.results ?? [];
  // Hasta que elijas un chip, se muestra la rutina activa (o la primera)
  const routineId =
    selectedRoutineId ??
    routineList.find((routine) => routine.is_active)?.id ??
    routineList[0]?.id ??
    0;

  const { data: days, isLoading: isLoadingDays } = useRoutineDays(routineId);
  const sortedDays = [...(days?.results ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const next = dashboard?.next_workout ?? null;
  const startingDayId = isPending ? variables?.routine_day : undefined;

  const createWorkout = (dayId: number) => {
    mutate(
      { routine_day: dayId },
      { onSuccess: (workout) => navigate(`/workouts/${workout.id}`) },
    );
  };

  // Con series hechas se avisa antes. Si no tiene ninguna, el backend lo descarta sin preguntar
  const startDay = (dayId: number, dayName: string) => {
    if (active && active.completed_sets > 0)
      setPendingStart({ dayId, dayName });
    else createWorkout(dayId);
  };

  const confirmStart = () => {
    if (!pendingStart) return;
    createWorkout(pendingStart.dayId);
    setPendingStart(null);
  };

  if (isLoading) return <p className="text-fg-muted">Cargando…</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="mx-auto grid max-w-2xl gap-6 lg:gap-8">
      <header className="grid gap-2">
        <span className="text-xs font-semibold tracking-widest text-accent uppercase">
          Entrenar
        </span>
        <h1 className="font-display text-4xl leading-none font-bold italic uppercase lg:text-5xl">
          ¿Qué toca hoy?
        </h1>
      </header>

      {active ? (
        <WorkoutHeroCard
          eyebrow="Entreno en curso"
          eyebrowClass="text-success"
          title={active.routine_day_name}
          meta={
            <>
              {active.routine_name} ·{" "}
              <b className="font-semibold text-fg">{active.completed_sets}</b>/
              {active.total_sets} series hechas
            </>
          }
          action={
            <Link to={`/workouts/${active.id}`} className={primaryButton}>
              <Play className="size-4 fill-current" aria-hidden="true" />
              Continuar entreno
            </Link>
          }
        />
      ) : next ? (
        <WorkoutHeroCard
          eyebrow="Siguiente"
          eyebrowClass="text-accent"
          title={next.name}
          meta={
            <>
              {next.routine_name} ·{" "}
              <b className="font-semibold text-fg">{next.exercises_count}</b>{" "}
              ejercicios ·{" "}
              <b className="font-semibold text-fg">{next.sets_count}</b> series
            </>
          }
          action={
            <button
              type="button"
              onClick={() => startDay(next.routine_day, next.name)}
              disabled={isPending}
              className={primaryButton}
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              {startingDayId === next.routine_day
                ? "Empezando…"
                : "Empezar entreno"}
            </button>
          }
        />
      ) : null}

      {isCreateError && (
        <p role="alert" className="text-sm text-red-400">
          {getCreateError(createError)}
        </p>
      )}

      {routineList.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-line-strong p-6">
          <p className="text-lg font-semibold">Aún no tienes rutinas</p>
          <p className="text-fg-muted">
            Crea una para poder empezar a entrenar.
          </p>
          <Link to="/routines/new" className={primaryButton}>
            Crear rutina
          </Link>
        </div>
      ) : (
        <section className="grid gap-3" aria-labelledby="choose-day">
          <h2 id="choose-day" className="text-lg font-semibold">
            {active || next ? "O elige otro día" : "Elige un día"}
          </h2>

          <div
            role="group"
            aria-label="Rutina"
            className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
          >
            {routineList.map((routine) => (
              <button
                key={routine.id}
                type="button"
                aria-pressed={routine.id === routineId}
                onClick={() => setSelectedRoutineId(routine.id)}
                className={chipClass}
              >
                {routine.is_active && (
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-success"
                  />
                )}
                {routine.name}
              </button>
            ))}
          </div>

          {isLoadingDays && <p className="text-fg-muted">Cargando días…</p>}

          {!isLoadingDays && sortedDays.length === 0 && (
            <p className="text-fg-muted">
              Esta rutina aún no tiene días.{" "}
              <Link
                to={`/routines/${routineId}`}
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Añádelos
              </Link>
            </p>
          )}

          <ol className="grid gap-2">
            {sortedDays.map((day, index) => {
              const currentWorkoutId =
                active?.routine_day === day.id ? active.id : null;

              return (
                <DayRow
                  key={day.id}
                  position={index + 1}
                  name={day.name}
                  isNext={
                    currentWorkoutId === null && next?.routine_day === day.id
                  }
                  currentWorkoutId={currentWorkoutId}
                  isStarting={startingDayId === day.id}
                  disabled={isPending}
                  onStart={() => startDay(day.id, day.name)}
                />
              );
            })}
          </ol>
        </section>
      )}

      <ConfirmDialog
        open={pendingStart !== null}
        title={`¿Empezar ${pendingStart?.dayName ?? ""}?`}
        confirmLabel={`Empezar ${pendingStart?.dayName ?? ""}`}
        cancelLabel={`Seguir con ${active?.routine_day_name ?? "el actual"}`}
        isPending={isPending}
        onCancel={() => setPendingStart(null)}
        onConfirm={confirmStart}
      >
        Tienes <b className="text-fg">{active?.routine_day_name}</b> a medias (
        {active?.completed_sets}/{active?.total_sets} series). Se guardará como
        terminado con lo que llevas; las series sin hacer no contarán.
      </ConfirmDialog>
    </div>
  );
}
