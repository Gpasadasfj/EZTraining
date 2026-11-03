import { Link } from "react-router-dom";
import { ChevronRight, History, Play } from "lucide-react";
import { useWorkoutHistory } from "../../hooks/workouts/useWorkouts";
import type { WorkoutHistoryItem } from "../../types/workouts/workouts";
import { capitalize, formatNumber } from "../../utils/format";

interface MonthGroup {
  key: string;
  label: string;
  workouts: WorkoutHistoryItem[];
}

const monthLabel = (date: Date) => {
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return capitalize(
    date.toLocaleDateString(
      "es-ES",
      sameYear ? { month: "long" } : { month: "long", year: "numeric" },
    ),
  );
};

// Vienen ordenados del más reciente al más antiguo: basta con mirar el último grupo
function groupByMonth(workouts: WorkoutHistoryItem[]) {
  const groups: MonthGroup[] = [];
  for (const workout of workouts) {
    const date = new Date(workout.started_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last?.key === key) last.workouts.push(workout);
    else groups.push({ key, label: monthLabel(date), workouts: [workout] });
  }
  return groups;
}

function HistoryRow({ workout }: { workout: WorkoutHistoryItem }) {
  const date = new Date(workout.started_at);
  const minutes = Math.max(1, Math.round((workout.duration_seconds ?? 0) / 60));
  const volume = Number(workout.volume ?? 0);

  return (
    <li>
      <Link
        to={`/workouts/${workout.id}`}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-canvas py-2.5 pr-3 pl-2.5 transition-colors hover:border-line-strong"
      >
        <span className="grid w-11.5 shrink-0 justify-items-center rounded-lg bg-surface-hover py-1 leading-tight">
          <b className="font-display text-2xl font-bold tabular-nums">
            {date.getDate()}
          </b>
          <small className="text-xs font-bold text-fg-muted uppercase">
            {date.toLocaleDateString("es-ES", { month: "short" })}
          </small>
        </span>

        <span className="grid min-w-0 flex-1">
          <strong className="truncate font-semibold">
            {workout.routine_day_name ?? "Entreno"}{" "}
            <span className="font-medium text-fg-subtle">
              · {workout.routine_name}
            </span>
          </strong>
          {workout.completed_sets > 0 ? (
            // Si no cabe, salta de línea entre datos, nunca en mitad de uno
            <small className="text-sm text-fg-muted tabular-nums">
              <span className="whitespace-nowrap">{minutes} min</span> ·{" "}
              <span className="whitespace-nowrap">
                {workout.completed_sets}/{workout.total_sets} series
              </span>{" "}
              ·{" "}
              <span className="whitespace-nowrap">
                {formatNumber(volume, 0)} kg
              </span>
            </small>
          ) : (
            <small className="text-sm text-amber-400 tabular-nums">
              {minutes} min · Sin series completadas
            </small>
          )}
        </span>

        <ChevronRight
          className="size-4.5 shrink-0 text-fg-subtle"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export default function WorkoutHistoryCard() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkoutHistory();

  const workouts = data?.pages.flatMap((page) => page.results) ?? [];
  const total = data?.pages[0]?.count ?? 0;

  return (
    <section
      aria-labelledby="history-title"
      className="grid gap-3.5 rounded-card border border-line bg-surface p-4 lg:p-5"
    >
      <h2 id="history-title" className="flex items-center gap-2 font-semibold">
        <History className="size-5" aria-hidden="true" />
        Entrenos
        {total > 0 && (
          <small className="text-sm font-medium text-fg-subtle tabular-nums">
            · {total} en total
          </small>
        )}
      </h2>

      {isLoading && <p className="text-fg-muted">Cargando tus entrenos…</p>}
      {isError && (
        <p className="text-fg-muted">No se pudo cargar tu historial.</p>
      )}

      {data && workouts.length === 0 && (
        <div className="grid justify-items-start gap-2.5 rounded-xl border border-dashed border-line-strong p-4.5">
          <strong>Todavía no has terminado ningún entreno</strong>
          <p className="text-fg-muted">
            Cada entreno que termines aparecerá aquí, con su resumen.
          </p>
          <Link
            to="/workouts"
            className="inline-flex h-11 items-center gap-2 rounded-button bg-surface-hover px-4.5 font-semibold transition-colors hover:bg-line-strong"
          >
            <Play className="size-4" aria-hidden="true" />
            Empezar a entrenar
          </Link>
        </div>
      )}

      {groupByMonth(workouts).map((group) => (
        <div key={group.key} className="grid gap-2">
          <h3 className="mt-1.5 text-xs font-bold tracking-wider text-fg-subtle uppercase">
            {group.label}
          </h3>
          <ul className="grid gap-2">
            {group.workouts.map((workout) => (
              <HistoryRow key={workout.id} workout={workout} />
            ))}
          </ul>
        </div>
      ))}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="inline-flex h-11 items-center justify-self-center rounded-button bg-surface-hover px-4.5 font-semibold transition-colors hover:bg-line-strong disabled:opacity-60"
        >
          {isFetchingNextPage ? "Cargando…" : "Ver más entrenos"}
        </button>
      )}
    </section>
  );
}
