import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  useCreateRoutineDays,
  useRoutineDaysDetail,
  useUpdateRoutineDays,
} from "../../../hooks/routines/useRoutineDays";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3.5 text-base text-fg placeholder:text-fg-subtle transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

interface DayFormProps {
  routineId: number;
  dayId: number | null; // null = crear un día nuevo
  initialName: string;
}

function DayForm({ routineId, dayId, initialName }: DayFormProps) {
  const navigate = useNavigate();
  const isEdit = dayId !== null;

  const {
    mutate: createDay,
    isPending: isCreating,
    error: createError,
  } = useCreateRoutineDays(routineId);
  const {
    mutate: updateDay,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateRoutineDays(routineId);

  const [name, setName] = useState(initialName);

  const isSaving = isCreating || isUpdating;
  const saveError = createError ?? updateError;
  const canSubmit = name.trim().length > 0 && !isSaving;
  const backUrl = `/routines/${routineId}`;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const goBack = { onSuccess: () => navigate(backUrl) };

    if (isEdit) {
      updateDay({ dayId, data: { name: name.trim() } }, goBack);
    } else {
      createDay({ name: name.trim() }, goBack);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-line bg-surface p-4.5 lg:p-6"
    >
      <div className="grid gap-2">
        <label htmlFor="day-name" className="font-semibold">
          Nombre
        </label>
        <input
          id="day-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Push, Pierna, Torso…"
          autoComplete="off"
          autoFocus={!isEdit}
          required
          className={`${fieldClass} h-12`}
        />
      </div>

      {saveError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
        >
          No se pudo guardar el día: {saveError.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Link
          to={backUrl}
          className="inline-flex h-12 items-center justify-center rounded-lg px-5 font-semibold text-fg-muted transition hover:bg-surface-hover hover:text-fg"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-primary/40 transition hover:bg-primary-hover active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
        >
          {isSaving ? "Guardando…" : isEdit ? "Guardar cambios" : "Añadir día"}
        </button>
      </div>
    </form>
  );
}

// Crea un día en una rutina existente o edita su nombre.
// El orden no se edita aquí: el backend lo asigna al crear.
export default function RoutineDayForm() {
  const { id, dayId } = useParams();
  const routineId = Number(id);
  const editDayId = dayId ? Number(dayId) : null;
  const isEdit = editDayId !== null;
  const backUrl = `/routines/${routineId}`;

  const { data, isLoading, isError, error } = useRoutineDaysDetail(
    routineId,
    Number(dayId),
  );

  if (isEdit && isLoading) {
    return (
      <div
        className="mx-auto grid w-full max-w-xl animate-pulse gap-4.5"
        aria-busy="true"
      >
        <div className="h-6 w-24 rounded-md bg-surface" />
        <div className="h-10 w-48 rounded-md bg-surface" />
        <div className="h-44 rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  if (isEdit && (isError || !data)) {
    return (
      <div className="mx-auto grid w-full max-w-xl justify-items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="font-semibold">No se pudo cargar el día</p>
        {error && <p className="text-fg-muted">{error.message}</p>}
        <Link
          to={backUrl}
          className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 font-semibold transition hover:bg-surface-hover"
        >
          Volver a la rutina
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-4.5">
      <Link
        to={backUrl}
        className="-my-1.5 -ml-2 inline-flex h-8 items-center gap-1.5 justify-self-start rounded-lg pr-2.5 pl-1.5 font-medium text-fg-muted transition hover:bg-surface hover:text-fg"
      >
        <ArrowLeft className="size-4.5" aria-hidden />
        Volver a la rutina
      </Link>

      <header className="grid gap-1.5">
        <h1 className="font-display text-4xl leading-none font-extrabold italic lg:text-5xl">
          {isEdit ? "Editar día" : "Nuevo día"}
        </h1>
        <p className="text-fg-muted">
          {isEdit
            ? "Cambia el nombre del día. Sus ejercicios se mantienen."
            : "Se añadirá al final de la rutina. Después podrás meterle ejercicios."}
        </p>
      </header>

      {/* key: crear y editar (o editar otro día) son formularios distintos que empiezan de cero */}
      <DayForm
        key={editDayId ?? "new"}
        routineId={routineId}
        dayId={editDayId}
        initialName={data?.name ?? ""}
      />
    </div>
  );
}
