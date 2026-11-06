import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Flag } from "lucide-react";
import { saveSetDraftsRequest } from "../../api/workouts/workoutSets";
import ConfirmDialog from "../../components/ui/confirmDialog";
import useWorkoutExercises from "../../hooks/workouts/useWorkoutExercises";
import { useSaveSetDrafts } from "../../hooks/workouts/useWorkoutSets";
import {
  useActiveWorkout,
  useFinishWorkout,
  useWorkoutsDetail,
} from "../../hooks/workouts/useWorkouts";
import type { Rest } from "../../types/workouts/rest";
import type { WorkoutExercise } from "../../types/workouts/workoutExercises";
import type { SetDraft } from "../../types/workouts/workoutSets";
import WorkoutSummary from "../../components/workout/workoutSummary";
import WorkoutClock from "../../components/workout/workoutClock";
import WorkoutExerciseItem from "../../components/workout/workoutExerciseItem";
import RestTimer from "../../components/workout/restTimer";
import ExerciseInfoSheet from "../../components/workout/exerciseInfoSheet";

export default function WorkoutDetail() {
  const { id } = useParams();
  const workoutId = Number(id);
  const queryClient = useQueryClient();

  const {
    data: workout,
    isLoading,
    isError,
    error,
  } = useWorkoutsDetail(workoutId);
  const { data: exercises } = useWorkoutExercises(workoutId);
  const { data: active } = useActiveWorkout();
  const finish = useFinishWorkout();
  const saveDrafts = useSaveSetDrafts(workoutId);

  const [rest, setRest] = useState<Rest | null>(null);
  const [infoSlug, setInfoSlug] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // Series escritas y sin guardar de todas las tarjetas, por id de serie
  const [drafts, setDrafts] = useState<Record<number, SetDraft>>({});

  const changeDraft = (setId: number, draft: SetDraft) => {
    setDrafts((prev) => ({ ...prev, [setId]: draft }));
  };

  const removeDraft = (setId: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });
  };

  // Al salir de la página se guardan las series escritas. El cleanup lee la ref
  // porque necesita los borradores del último render, no los del primero
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      const pending = draftsRef.current;
      if (Object.keys(pending).length === 0) return;

      // Ya no hay pantalla donde mostrar un error, así que solo se intenta
      saveSetDraftsRequest(workoutId, pending)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: ["workoutSet", workoutId],
          }),
        )
        .catch(() => {});
    };
  }, [workoutId, queryClient]);

  // Al cerrar la pestaña o recargar no se pueden guardar los borradores: el navegador avisa
  useEffect(() => {
    if (Object.keys(drafts).length === 0) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [drafts]);

  // Se guarda cuándo acaba, no cuántos segundos quedan: así no se desajusta
  // aunque el navegador ralentice los intervalos con la pestaña en segundo plano
  const startRest = (exercise: WorkoutExercise) => {
    setRest({
      exerciseName: exercise.exercise_name,
      total: exercise.rest_time,
      endsAt: Date.now() + exercise.rest_time * 1000,
    });
  };

  const addRest = () => {
    setRest((current) => {
      if (!current) return current;
      const endsAt = Math.max(current.endsAt, Date.now()) + 15_000;
      return {
        ...current,
        endsAt,
        total: Math.max(current.total, (endsAt - Date.now()) / 1000),
      };
    });
  };

  const closeRest = useCallback(() => setRest(null), []);

  // Los contadores vienen de /workouts/active/, que se refresca al guardar cada serie
  const progress = active?.id === workoutId ? active : null;
  const pendingSets = progress
    ? progress.total_sets - progress.completed_sets
    : 0;
  const allDone =
    progress !== null && progress.total_sets > 0 && pendingSets === 0;
  const isFinishing = saveDrafts.isPending || finish.isPending;

  // Primero se guardan los borradores; después, finish marca como hechas
  // las series con peso y reps y la caché ya pasa al resumen
  const finishWorkout = () => {
    saveDrafts.mutate(drafts, {
      onSuccess: () => {
        setDrafts({});
        finish.mutate(workoutId, { onSuccess: () => window.scrollTo(0, 0) });
      },
    });
  };

  const handleFinishClick = () => {
    if (pendingSets > 0) setIsConfirmOpen(true);
    else finishWorkout();
  };

  if (isLoading) return <p className="text-fg-muted">Cargando entreno…</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!workout) return null;

  if (workout.completed) return <WorkoutSummary workoutId={workoutId} />;

  return (
    <div className="mx-auto grid max-w-2xl gap-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-44">
      {/* Pegada justo debajo del Header (h-14 en móvil, h-16 en escritorio) */}
      <div className="sticky top-14 z-10 -mx-4 -mt-6 grid gap-2.5 border-b border-line bg-canvas/90 px-4 pt-3 pb-3.5 backdrop-blur-md lg:top-16 lg:mx-0 lg:px-4 lg:pt-4">
        <div className="flex items-center gap-3">
          <Link
            to="/workouts"
            aria-label="Volver (el entreno sigue en curso)"
            className="-ml-2 grid size-10 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </Link>

          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-xs text-fg-muted">
              {workout.routine_name}
            </span>
            <h1 className="truncate font-display text-2xl font-bold">
              {workout.routine_day_name}
            </h1>
          </div>

          <WorkoutClock startedAt={workout.started_at} />
        </div>

        <div className="flex items-center gap-2.5 text-sm text-fg-muted">
          <span className="tabular-nums">
            <b className="font-semibold text-fg">
              {progress?.completed_sets ?? "–"}
            </b>
            /{progress?.total_sets ?? "–"} series
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{
                transform: `scaleX(${progress && progress.total_sets > 0 ? progress.completed_sets / progress.total_sets : 0})`,
              }}
            />
          </div>
        </div>
      </div>

      {exercises?.results.map((exercise) => (
        <WorkoutExerciseItem
          key={exercise.id}
          workoutId={workoutId}
          exercise={exercise}
          drafts={drafts}
          onDraftChange={changeDraft}
          onDraftSaved={removeDraft}
          onSetCompleted={startRest}
          onShowInfo={setInfoSlug}
        />
      ))}

      {/* Barra fija: abajo en móvil, flotante a la derecha en escritorio */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-90 lg:rounded-2xl lg:border lg:border-line-strong lg:p-3 lg:shadow-2xl">
        <div className="mx-auto grid max-w-2xl gap-2.5">
          {rest && (
            <RestTimer
              rest={rest}
              onAdd={addRest}
              onSkip={closeRest}
              onExpire={closeRest}
            />
          )}

          {(saveDrafts.isError || finish.isError) && (
            <p role="alert" className="text-center text-sm text-red-400">
              No se pudo terminar el entreno. Inténtalo de nuevo.
            </p>
          )}

          <button
            type="button"
            onClick={handleFinishClick}
            disabled={isFinishing}
            className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-button font-semibold transition-colors disabled:opacity-60 ${
              allDone
                ? "bg-primary text-on-primary hover:bg-primary-hover"
                : "border border-line-strong bg-surface hover:bg-surface-hover"
            }`}
          >
            <Flag className="size-5" aria-hidden="true" />
            {isFinishing ? "Terminando…" : "Terminar entreno"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="¿Terminar el entreno?"
        confirmLabel="Terminar"
        cancelLabel="Seguir"
        isPending={isFinishing}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={finishWorkout}
      >
        Te quedan <b className="text-fg">{pendingSets} series</b> sin marcar.
        Las que tengan peso y repeticiones se guardarán como hechas; las vacías
        no contarán.
      </ConfirmDialog>

      <ExerciseInfoSheet slug={infoSlug} onClose={() => setInfoSlug(null)} />
    </div>
  );
}
