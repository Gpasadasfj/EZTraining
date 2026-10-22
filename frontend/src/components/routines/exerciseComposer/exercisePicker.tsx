import { useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  useExercisesInfinite,
  useSearchExercises,
} from "../../../hooks/useExercises";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import type { Exercise, ExerciseFilters } from "../../../types/exercises";
import { composerFieldClass } from "./composerFieldClass";

type Source = "catalog" | "mine";

// Fuera del componente para que sean siempre los mismos objetos:
// forman parte de la queryKey y uno nuevo en cada render la cambiaría.
const FILTERS: Record<Source, ExerciseFilters> = {
  catalog: { muscle: null, secondaryMuscles: [], equipment: [], custom: false },
  mine: { muscle: null, secondaryMuscles: [], equipment: [], custom: true },
};

interface ExercisePickerProps {
  onPick: (exercise: Exercise) => void;
  onCreate: (name: string) => void;
  onCancel: () => void;
}

export default function ExercisePicker({
  onPick,
  onCreate,
  onCancel,
}: ExercisePickerProps) {
  const [source, setSource] = useState<Source>("catalog");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const isSearching = debouncedSearch.length >= 2;
  const filters = FILTERS[source];

  // Sin búsqueda se muestra la primera página; con 2 letras o más, los resultados.
  const initial = useExercisesInfinite(filters);
  const results = useSearchExercises(debouncedSearch, filters);
  // Solo para el contador de la pestaña. En «Mis ejercicios» es la misma consulta que `initial`.
  const mine = useExercisesInfinite(FILTERS.mine);

  const exercises: Exercise[] = isSearching
    ? (results.data?.results ?? [])
    : (initial.data?.pages[0]?.results ?? []);
  const isLoading = isSearching ? results.isLoading : initial.isLoading;
  const mineCount = mine.data?.pages[0]?.count ?? 0;
  const typedName = search.trim();

  return (
    <div className="grid animate-fade-in gap-3 rounded-xl border border-line-strong bg-surface p-3.5 shadow-xl shadow-black/40 lg:bg-canvas">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">Elige un ejercicio</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          Cancelar
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Origen de los ejercicios"
        className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-canvas p-1 lg:bg-surface"
      >
        <SourceTab
          active={source === "catalog"}
          onClick={() => setSource("catalog")}
        >
          Catálogo
        </SourceTab>
        <SourceTab active={source === "mine"} onClick={() => setSource("mine")}>
          Mis ejercicios
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary/15 px-1.5 text-xs font-bold text-orange-300 tabular-nums">
            {mineCount}
          </span>
        </SourceTab>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-3.5 left-3.5 size-4.5 text-fg-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            source === "mine" ? "Buscar en tus ejercicios" : "Buscar por nombre"
          }
          aria-label="Buscar ejercicio"
          autoComplete="off"
          autoFocus
          className={`${composerFieldClass} h-12 pr-3.5 pl-10`}
        />
      </div>

      <ul className="-mx-1.5 grid max-h-66 overflow-y-auto overscroll-contain">
        {isLoading && <li className="px-2.5 py-3 text-fg-subtle">Buscando…</li>}

        {!isLoading && exercises.length === 0 && (
          <li className="grid gap-0.5 px-2.5 py-3">
            {isSearching ? (
              <>
                <span className="text-fg-muted">
                  Ningún ejercicio coincide con «{debouncedSearch}».
                </span>
                <span className="text-sm text-fg-subtle">
                  {source === "catalog"
                    ? "Prueba en «Mis ejercicios» o créalo tú."
                    : "Prueba en el catálogo o créalo tú."}
                </span>
              </>
            ) : source === "mine" ? (
              <>
                <span className="text-fg-muted">
                  Todavía no has creado ningún ejercicio.
                </span>
                <span className="text-sm text-fg-subtle">
                  Créalo abajo y quedará guardado para tus próximas rutinas.
                </span>
              </>
            ) : (
              <span className="text-fg-muted">
                No hay ejercicios en el catálogo.
              </span>
            )}
          </li>
        )}

        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <button
              type="button"
              onClick={() => onPick(exercise)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-3 text-left transition hover:bg-surface-hover"
            >
              <span className="min-w-0 font-medium">{exercise.name_es}</span>
              <span className="shrink-0 text-xs font-semibold text-fg-subtle">
                {exercise.muscle}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onCreate(typedName)}
        className="flex h-11.5 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong px-3.5 font-semibold text-accent transition hover:border-primary/45 hover:bg-primary/15"
      >
        <Plus className="size-4.5 shrink-0" strokeWidth={2.4} aria-hidden />
        <span className="truncate">
          {typedName ? `Crear «${typedName}»` : "Crear ejercicio nuevo"}
        </span>
      </button>
    </div>
  );
}

interface SourceTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SourceTab({ active, onClick, children }: SourceTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition ${
        active
          ? "bg-surface-hover text-fg shadow-sm shadow-black/40"
          : "text-fg-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
