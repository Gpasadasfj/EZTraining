import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRoutineDetail } from "../../../hooks/routines/useRoutines";
import {
  useDeleteRoutineDays,
  useRoutineDaysDetail,
} from "../../../hooks/routines/useRoutineDays";
import ActionMenu from "../../../components/ui/actionMenu";
import DayExercisesEditor from "../../../components/routines/exerciseComposer/dayExercisesEditor";

export default function RoutineDayEdit() {
  const { id, dayId } = useParams();
  const routineId = Number(id);
  const routineDayId = Number(dayId);
  const navigate = useNavigate();

  const { data: routine } = useRoutineDetail(routineId);
  const {
    data: day,
    isLoading,
    isError,
    error,
    refetch,
  } = useRoutineDaysDetail(routineId, routineDayId);
  const {
    mutate: deleteDay,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteRoutineDays(routineId);

  const routineUrl = `/routines/${routineId}`;

  if (isLoading) {
    return (
      <div
        className="mx-auto grid w-full max-w-xl animate-pulse gap-4.5"
        aria-busy="true"
      >
        <div className="h-6 w-24 rounded-md bg-surface" />
        <div className="h-10 w-56 rounded-md bg-surface" />
        <div className="h-64 rounded-2xl bg-surface" />
      </div>
    );
  }

  if (isError || !day) {
    return (
      <div className="mx-auto grid w-full max-w-xl justify-items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="font-semibold">No se pudo cargar el día</p>
        {error && <p className="text-fg-muted">{error.message}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 rounded-lg border border-line-strong px-4 font-semibold transition hover:bg-surface-hover"
          >
            Reintentar
          </button>
          <Link
            to={routineUrl}
            className="inline-flex h-10 items-center rounded-lg px-4 font-semibold text-fg-muted transition hover:bg-surface-hover hover:text-fg"
          >
            Volver a la rutina
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-4.5">
      <Link
        to={routineUrl}
        className="-my-1.5 -ml-2 inline-flex h-8 items-center gap-1.5 justify-self-start rounded-lg pr-2.5 pl-1.5 font-medium text-fg-muted transition hover:bg-surface hover:text-fg"
      >
        <ArrowLeft className="size-4.5" aria-hidden />
        {routine?.name ?? "Rutina"}
      </Link>

      <header className="flex items-start gap-2.5">
        <div className="grid min-w-0 flex-1 gap-2">
          <span className="text-xs font-bold tracking-widest text-accent uppercase">
            Editar día
          </span>
          <h1 className="font-display text-4xl leading-none font-extrabold text-balance uppercase italic wrap-anywhere lg:text-5xl">
            {day.name}
          </h1>
        </div>
        <ActionMenu
          name={day.name}
          editTo={`${routineUrl}/days/${routineDayId}/update`}
          editLabel="Renombrar día"
          confirmMessage={
            <>
              ¿Eliminar <strong className="text-fg">{day.name}</strong>? Se
              borrarán sus ejercicios. Tus entrenos ya hechos se mantienen.
            </>
          }
          onDelete={() =>
            deleteDay(routineDayId, { onSuccess: () => navigate(routineUrl) })
          }
          isDeleting={isDeleting}
          error={deleteError}
        />
      </header>

      {/* Mismo esquema que el asistente: plano en móvil y tarjeta en escritorio,
          para que los colores del editor de ejercicios encajen igual. */}
      <section
        aria-labelledby="day-exercises-title"
        className="grid gap-4 lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-6"
      >
        <h2 id="day-exercises-title" className="text-lg font-semibold">
          Ejercicios
        </h2>
        <DayExercisesEditor
          routineId={routineId}
          dayId={routineDayId}
          emptyHint="Este día aún no tiene ejercicios. Añade el primero."
        />
      </section>
    </div>
  );
}
