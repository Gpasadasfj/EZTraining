// pages/dashboard.tsx
import Greeting from "../components/dashboard/greetings";
import NextWorkoutCard from "../components/dashboard/nextWorkoutCard";
import RecordsCard from "../components/dashboard/recordsCard";
import WeekCard from "../components/dashboard/weekWorkoutsCard";
import WeightCard from "../components/dashboard/weightCard";
import useDashboard from "../hooks/useDashboard";
import useMe from "../hooks/useMe";
import { useActiveWorkout } from "../hooks/workouts/useWorkouts";

const gridClass =
  "grid grid-cols-[minmax(0,1fr)] gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-4";

/* ---------- Cargando ---------- */

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando inicio" className="grid gap-5">
      <div className="grid gap-2">
        <div className="h-10 w-full max-w-72 animate-pulse rounded-lg bg-surface" />
        <div className="h-5 w-full max-w-96 animate-pulse rounded-md bg-surface" />
      </div>
      <div className={gridClass}>
        <div className="h-72 animate-pulse rounded-card bg-surface" />
        <div className="h-72 animate-pulse rounded-card bg-surface" />
        <div className="h-64 animate-pulse rounded-card bg-surface" />
        <div className="h-64 animate-pulse rounded-card bg-surface" />
      </div>
    </div>
  );
}

/* ---------- Página ---------- */

export default function Dashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { data: me } = useMe();
  const { data: activeWorkout, isLoading: isLoadingActive } =
    useActiveWorkout();

  // Se espera también al entreno activo para que la tarjeta no salte de "Próximo" a "En curso"
  if (isLoading || isLoadingActive) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div
        role="alert"
        className="grid justify-items-start gap-3 rounded-card border border-danger/40 bg-surface p-6"
      >
        <p className="m-0 font-semibold text-fg">
          No hemos podido cargar tu resumen 😕
        </p>
        <p className="m-0 text-fg-muted">
          Comprueba tu conexión e inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 rounded-button border border-line-strong px-4 font-semibold text-fg transition-[background-color,scale] duration-150 hover:bg-surface-hover active:scale-[0.97] disabled:opacity-60"
        >
          {isFetching ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative isolate grid gap-5">
      <Greeting
        username={me?.username}
        done={data.workouts_this_week}
        target={data.target_workouts}
        hasRoutine={data.next_workout !== null}
      />

      <div className={gridClass}>
        <NextWorkoutCard
          nextWorkout={data.next_workout}
          activeWorkout={activeWorkout ?? null}
        />

        <WeekCard
          done={data.workouts_this_week}
          target={data.target_workouts}
          daysTrained={data.workout_days}
          volume={data.volume_this_week}
        />

        {/* Móvil: peso antes que récords · Escritorio: peso abajo a la derecha */}
        <div className="grid lg:col-start-2 lg:row-start-2">
          <WeightCard
            current={data.current_weight}
            target={data.target_weight}
          />
        </div>

        <div className="grid lg:col-start-1 lg:row-start-2">
          <RecordsCard records={data.personal_records} />
        </div>
      </div>
    </div>
  );
}
