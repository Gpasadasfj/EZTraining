import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  useRoutineDetail,
  useUpdateRoutine,
} from "../../hooks/routines/useRoutines";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3.5 text-base text-fg placeholder:text-fg-subtle transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

interface RoutineEditFormProps {
  routineId: number;
  initialName: string;
  initialDescription: string;
}

// Se monta solo cuando la rutina ya está cargada: sus datos son el estado inicial
function RoutineEditForm({
  routineId,
  initialName,
  initialDescription,
}: RoutineEditFormProps) {
  const navigate = useNavigate();
  const {
    mutate: updateRoutine,
    isPending: isSaving,
    error: saveError,
  } = useUpdateRoutine();

  const [routineName, setRoutineName] = useState(initialName);
  const [routineDescription, setRoutineDescription] =
    useState(initialDescription);

  const canSubmit = routineName.trim().length > 0 && !isSaving;
  const backUrl = `/routines/${routineId}`;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    updateRoutine(
      {
        id: routineId,
        data: {
          name: routineName.trim(),
          description: routineDescription.trim(),
        },
      },
      { onSuccess: () => navigate(backUrl) },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-line bg-surface p-4.5 lg:p-6"
    >
      <div className="grid gap-2">
        <label htmlFor="routine-name" className="font-semibold">
          Nombre
        </label>
        <input
          id="routine-name"
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Push Pull Legs"
          autoComplete="off"
          required
          className={`${fieldClass} h-12`}
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="routine-description"
          className="flex items-baseline justify-between gap-3 font-semibold"
        >
          Descripción
          <span className="text-sm font-normal text-fg-subtle">Opcional</span>
        </label>
        <textarea
          id="routine-description"
          value={routineDescription}
          onChange={(e) => setRoutineDescription(e.target.value)}
          placeholder="Empuje, tirón y pierna. Tres días para ganar fuerza."
          rows={3}
          className={`${fieldClass} resize-none py-3 leading-relaxed`}
        />
      </div>

      {saveError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
        >
          No se pudo guardar la rutina: {saveError.message}
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
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

// Solo edita: la creación la hace el asistente (RoutineWizard).
export default function RoutineEdit() {
  const { id } = useParams();
  const routineId = Number(id);
  const { data, isLoading, isError, error } = useRoutineDetail(routineId);
  const backUrl = `/routines/${routineId}`;

  if (isLoading) {
    return (
      <div
        className="mx-auto grid w-full max-w-xl animate-pulse gap-4.5"
        aria-busy="true"
      >
        <div className="h-6 w-24 rounded-md bg-surface" />
        <div className="h-10 w-56 rounded-md bg-surface" />
        <div className="h-72 rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto grid w-full max-w-xl justify-items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="font-semibold">No se pudo cargar la rutina</p>
        {error && <p className="text-fg-muted">{error.message}</p>}
        <Link
          to="/routines"
          className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 font-semibold transition hover:bg-surface-hover"
        >
          Volver a rutinas
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
        {data.name}
      </Link>

      <header className="grid gap-1.5">
        <h1 className="font-display text-4xl leading-none font-extrabold italic lg:text-5xl">
          Editar rutina
        </h1>
        <p className="text-fg-muted">
          Cambia el nombre o la descripción. Los días y ejercicios se mantienen.
        </p>
      </header>

      {/* key: si cambias a otra rutina, el formulario empieza de cero con sus datos */}
      <RoutineEditForm
        key={data.id}
        routineId={routineId}
        initialName={data.name}
        initialDescription={data.description ?? ""}
      />
    </div>
  );
}
