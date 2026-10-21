import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import useRoutines from "../../hooks/routines/useRoutines";
import RoutineCard from "../../components/routines/routineCard";
import type { Routine } from "../../types/routines/routines";

const listClass =
  "m-0 grid list-none grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4";

const newButtonClass =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-button bg-primary px-4 font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97";

/* ---------- Cargando ---------- */

function RoutinesSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando rutinas" className="grid gap-5">
      <div className="grid gap-2">
        <div className="h-10 w-full max-w-60 animate-pulse rounded-lg bg-surface" />
        <div className="h-5 w-full max-w-80 animate-pulse rounded-md bg-surface" />
      </div>
      <div className={listClass}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    </div>
  );
}

/* ---------- Sin rutinas ---------- */

function EmptyRoutines() {
  const steps = [
    "Ponle nombre: «Push Pull Legs»",
    "Añade los días: Push, Pull, Legs",
    "Mete los ejercicios de cada día",
  ];

  return (
    <div className="grid justify-items-center gap-3.5 rounded-card border border-dashed border-line-strong bg-surface bg-[radial-gradient(60%_80%_at_50%_0%,rgb(249_115_22/0.10),transparent_70%)] px-5 py-9 text-center lg:py-14">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-[18px] bg-surface-hover text-3xl"
      >
        📋
      </span>
      <h2 className="m-0 font-display text-[1.8rem] leading-none font-extrabold uppercase italic">
        Crea tu primera rutina
      </h2>
      <p className="m-0 max-w-[38ch] text-fg-muted">
        Una rutina agrupa tus días de entreno. Cada día tiene sus ejercicios,
        series y repeticiones objetivo.
      </p>
      <ol className="m-0 mt-1 mb-1.5 grid w-full max-w-85 list-none gap-2 p-0 text-left">
        {steps.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 rounded-button border border-line bg-canvas px-3 py-2.5 text-zinc-300"
          >
            <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-accent">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <Link to="/routines/new" className={`${newButtonClass} h-12 px-5.5`}>
        <Plus className="size-4.5" strokeWidth={2.4} aria-hidden="true" />
        Crear rutina
      </Link>
    </div>
  );
}

/* ---------- Página ---------- */

export default function Routines() {
  const { data, isLoading, isError, refetch, isFetching } = useRoutines();

  if (isLoading) return <RoutinesSkeleton />;

  if (isError || !data) {
    return (
      <div
        role="alert"
        className="grid justify-items-start gap-3 rounded-card border border-danger/40 bg-surface p-6"
      >
        <p className="m-0 font-semibold text-fg">
          No hemos podido cargar tus rutinas 😕
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

  const routines: Routine[] = data.results;
  const isEmpty = routines.length === 0;

  return (
    <div className="grid gap-4.5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5">
        <h1 className="m-0 font-display text-4xl leading-none font-extrabold italic lg:text-[2.8rem]">
          Mis rutinas
        </h1>
        {!isEmpty && (
          <Link to="/routines/new" className={newButtonClass}>
            <Plus className="size-4.5" strokeWidth={2.4} aria-hidden="true" />
            <span className="lg:hidden">Nueva</span>
            <span className="hidden lg:inline">Nueva rutina</span>
          </Link>
        )}
        <p className="col-span-full m-0 text-fg-muted">
          {isEmpty ? (
            "Aquí organizas tus días de entreno."
          ) : (
            <>
              <strong className="font-semibold text-fg">
                {data.count} {data.count === 1 ? "rutina" : "rutinas"}
              </strong>
              . La que está en uso es la que sigues ahora.
            </>
          )}
        </p>
      </header>

      {isEmpty ? (
        <EmptyRoutines />
      ) : (
        <ul className={listClass}>
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </ul>
      )}
    </div>
  );
}
