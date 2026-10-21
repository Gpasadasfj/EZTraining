import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  List,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import { useRoutineDetail } from "../../hooks/routines/useRoutines";
import PulseLine from "../../components/pulseLine";
import RoutineMenu from "../../components/routines/routineMenu";
import RoutineDays from "./routinesDays/routineDays";

export default function RoutineDetail() {
  const { id } = useParams();
  const routineId = Number(id);
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useRoutineDetail(routineId);

  if (isLoading) return <RoutineDetailSkeleton />;

  if (isError) {
    return (
      <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="font-semibold">No se pudo cargar la rutina</p>
        <p className="text-fg-muted">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-10 rounded-lg border border-line-strong px-4 font-semibold transition hover:bg-surface-hover"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isActive = data.is_active;

  return (
    <div className="grid gap-4.5">
      <Link
        to="/routines"
        className="-my-1.5 -ml-2 inline-flex h-8 items-center gap-1.5 justify-self-start rounded-lg pr-2.5 pl-1.5 font-medium text-fg-muted transition hover:bg-surface hover:text-fg"
      >
        <ArrowLeft className="size-4.5" aria-hidden />
        Rutinas
      </Link>

      <section
        aria-labelledby="routine-name"
        className={`relative grid gap-3 rounded-2xl border px-4.5 pt-19 pb-4.5 lg:gap-3.5 lg:px-7 lg:pt-21 lg:pb-6.5 ${
          isActive
            ? "border-primary/30 bg-surface bg-radial-[at_100%_0%] from-primary/18 to-transparent to-60%"
            : "border-line bg-surface"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-3 h-14 overflow-hidden lg:top-3.5 lg:h-15"
          aria-hidden
        >
          <PulseLine
            beats={[0.7]}
            beatWidth={110}
            amplitude={24}
            animated={isActive}
            baseClassName={
              isActive ? "stroke-primary/50" : "stroke-line-strong"
            }
            className="size-full"
          />
        </div>

        <div className="flex items-start gap-2.5">
          <div className="grid min-w-0 flex-1 gap-2">
            {isActive && (
              <span className="inline-flex h-5.5 items-center gap-1.5 justify-self-start rounded-full bg-green-500/15 px-2.5 text-xs font-bold tracking-wide text-green-400 uppercase">
                <span
                  className="size-2 rounded-full bg-green-500"
                  aria-hidden
                />
                En uso
              </span>
            )}
            <h1
              id="routine-name"
              className="font-display text-4xl leading-none font-extrabold text-balance uppercase italic wrap-anywhere lg:text-5xl"
            >
              {data.name}
            </h1>
          </div>
          <RoutineMenu
            routineId={data.id}
            routineName={data.name}
            onDeleted={() => navigate("/routines")}
          />
        </div>

        {data.description && (
          <p className="max-w-prose text-pretty text-fg-muted">
            {data.description}
          </p>
        )}

        <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm text-fg-muted lg:text-base">
          <Stat
            icon={Calendar}
            value={data.n_days}
            singular="día"
            plural="días"
            active={isActive}
          />
          <Stat
            icon={List}
            value={data.n_exercises}
            singular="ejercicio"
            plural="ejercicios"
            active={isActive}
          />
          <Stat
            icon={Repeat}
            value={data.n_sets}
            singular="serie"
            plural="series"
            active={isActive}
          />
        </p>
      </section>

      <RoutineDays routineId={routineId} />
    </div>
  );
}

interface StatProps {
  icon: LucideIcon;
  value: number;
  singular: string;
  plural: string;
  active: boolean;
}

function Stat({ icon: Icon, value, singular, plural, active }: StatProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon
        className={`size-4 ${active ? "text-accent" : "text-fg-subtle"}`}
        aria-hidden
      />
      <b className="font-bold text-fg tabular-nums">{value}</b>
      {value === 1 ? singular : plural}
    </span>
  );
}

function RoutineDetailSkeleton() {
  return (
    <div
      className="grid animate-pulse gap-4.5"
      aria-busy="true"
      aria-label="Cargando rutina"
    >
      <div className="h-6 w-24 rounded-md bg-surface" />
      <div className="h-56 rounded-2xl border border-line bg-surface" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="h-72 rounded-xl border border-line bg-surface" />
        <div className="h-72 rounded-xl border border-line bg-surface" />
      </div>
    </div>
  );
}
