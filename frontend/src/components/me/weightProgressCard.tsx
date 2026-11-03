import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Scale, Trash2 } from "lucide-react";
import WeightChart from "./weightChart";
import useWeightLog, { useDeleteWeightLog } from "../../hooks/me/useWeightLog";
import type { WeightLog } from "../../types/users";
import { formatNumber, formatShortDate } from "../../utils/format";

const VISIBLE_LOGS = 4;
const CHART_POINTS = 12;

interface WeightProgressCardProps {
  targetWeight: number | null;
  onRegister: () => void;
  onSetGoal: () => void;
}

interface WeightSummaryProps {
  logs: WeightLog[]; // del más reciente al más antiguo, al menos uno
  targetWeight: number | null;
  onSetGoal: () => void;
}

const round = (value: number) => Math.round(value * 10) / 10;

function WeightSummary({ logs, targetWeight, onSetGoal }: WeightSummaryProps) {
  const current = Number(logs[0].weight);
  const chartLogs = logs.slice(0, CHART_POINTS).reverse();
  const since = chartLogs[0];
  const change = round(current - Number(since.weight));

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-2">
        <strong className="font-display text-5xl leading-none font-bold tabular-nums">
          {formatNumber(current)}
        </strong>
        <span className="font-medium text-fg-muted">kg</span>
        {chartLogs.length > 1 && (
          <span className="ml-auto inline-flex h-7 items-center gap-1 self-center rounded-full bg-blue-400/15 px-2.5 text-sm font-bold text-blue-400 tabular-nums">
            {change < 0 && (
              <ArrowDown className="size-3.5" aria-hidden="true" />
            )}
            {change > 0 && <ArrowUp className="size-3.5" aria-hidden="true" />}
            {change === 0
              ? "Sin cambios"
              : `${change < 0 ? "Bajas" : "Subes"} ${formatNumber(Math.abs(change))} kg`}{" "}
            desde el {formatShortDate(since.recorded_at)}
          </span>
        )}
      </div>

      {targetWeight === null ? (
        <button
          type="button"
          onClick={onSetGoal}
          className="justify-self-start text-sm font-semibold text-accent hover:underline hover:underline-offset-4"
        >
          Fija un objetivo de peso
        </button>
      ) : Math.abs(current - targetWeight) < 0.1 ? (
        <p className="text-sm text-fg-muted">
          Estás en tu objetivo de{" "}
          <b className="text-fg tabular-nums">
            {formatNumber(targetWeight)} kg
          </b>
          .
        </p>
      ) : (
        <p className="text-sm text-fg-muted">
          Te faltan{" "}
          <b className="text-fg tabular-nums">
            {formatNumber(round(Math.abs(current - targetWeight)))} kg
          </b>{" "}
          para tu objetivo de {formatNumber(targetWeight)} kg
        </p>
      )}

      {chartLogs.length > 1 && (
        <WeightChart logs={chartLogs} target={targetWeight} />
      )}
    </>
  );
}

export default function WeightProgressCard({
  targetWeight,
  onRegister,
  onSetGoal,
}: WeightProgressCardProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWeightLog();
  const remove = useDeleteWeightLog();
  const [showAll, setShowAll] = useState(false);

  // Del más reciente al más antiguo, como los ordena el backend
  const logs = data?.pages.flatMap((page) => page.results) ?? [];
  const total = data?.pages[0]?.count ?? 0;
  const visibleLogs = showAll ? logs : logs.slice(0, VISIBLE_LOGS);

  return (
    <section
      aria-labelledby="weight-title"
      className="grid gap-3.5 rounded-card border border-line bg-surface p-4 lg:p-5"
    >
      <div className="flex items-center justify-between gap-2.5">
        <h2 id="weight-title" className="flex items-center gap-2 font-semibold">
          <Scale className="size-5" aria-hidden="true" />
          Peso
        </h2>
        <button
          type="button"
          onClick={onRegister}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-hover px-3 text-sm font-semibold transition-colors hover:bg-line-strong"
        >
          <Plus className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          Registrar
        </button>
      </div>

      {isLoading && <p className="text-fg-muted">Cargando tus registros…</p>}
      {isError && (
        <p className="text-fg-muted">
          No se pudieron cargar tus registros de peso.
        </p>
      )}

      {data && logs.length === 0 && (
        <div className="grid justify-items-start gap-2.5 rounded-xl border border-dashed border-line-strong p-4.5">
          <strong>Aún no has registrado tu peso</strong>
          <p className="text-fg-muted">
            Regístralo de vez en cuando y aquí verás cómo evoluciona y cuánto te
            falta para tu objetivo.
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="inline-flex h-11 items-center gap-2 rounded-button bg-primary px-4.5 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <Plus className="size-4.5" aria-hidden="true" />
            Registrar peso
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <>
          <WeightSummary
            logs={logs}
            targetWeight={targetWeight}
            onSetGoal={onSetGoal}
          />

          <ul className="grid">
            {visibleLogs.map((log, index) => {
              const older = logs[index + 1];
              const delta = older
                ? round(Number(log.weight) - Number(older.weight))
                : null;
              const date = formatShortDate(log.recorded_at);
              const isDeleting =
                remove.isPending && remove.variables === log.id;

              return (
                <li
                  key={log.id}
                  className="flex min-h-12 items-center gap-2.5 border-t border-line"
                >
                  <span className="w-16 shrink-0 text-sm text-fg-muted">
                    {date}
                  </span>
                  <span className="flex-1 font-semibold tabular-nums">
                    {formatNumber(Number(log.weight))} kg
                  </span>
                  {delta !== null && (
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        delta < 0
                          ? "text-blue-400"
                          : delta > 0
                            ? "text-accent"
                            : "text-fg-subtle"
                      }`}
                    >
                      {delta > 0 ? "+" : delta < 0 ? "−" : ""}
                      {formatNumber(Math.abs(delta))}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove.mutate(log.id)}
                    disabled={isDeleting}
                    aria-label={`Borrar el registro del ${date}`}
                    className="grid size-9.5 shrink-0 place-items-center rounded-button text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40"
                  >
                    <Trash2 className="size-4.5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          {remove.isError && (
            <p role="alert" className="text-sm text-danger">
              No se pudo borrar el registro. Inténtalo de nuevo.
            </p>
          )}

          {!showAll && total > VISIBLE_LOGS && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="justify-self-start text-sm font-semibold text-accent hover:underline hover:underline-offset-4"
            >
              Ver los {total} registros
            </button>
          )}

          {showAll && (
            <div className="flex gap-4">
              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-sm font-semibold text-accent hover:underline hover:underline-offset-4 disabled:opacity-60"
                >
                  {isFetchingNextPage ? "Cargando…" : "Cargar más"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-sm font-semibold text-fg-muted hover:text-fg"
              >
                Ver menos
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
