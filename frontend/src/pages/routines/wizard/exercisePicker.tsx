import { useState } from "react";
import { Search } from "lucide-react";
import {
  useExercisesInfinite,
  useSearchExercises,
} from "../../../hooks/useExercises";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import type { Exercise, ExerciseFilters } from "../../../types/exercises";
import { composerFieldClass } from "./wizardUi";

// Fuera del componente para que sea siempre el mismo objeto:
// forma parte de la queryKey y un objeto nuevo en cada render la cambiaría.
const NO_FILTERS: ExerciseFilters = {
  muscle: null,
  secondaryMuscles: [],
  equipment: [],
};

interface ExercisePickerProps {
  onPick: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function ExercisePicker({
  onPick,
  onCancel,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const isSearching = debouncedSearch.length >= 2;

  // Sin búsqueda se muestra la primera página del catálogo; con 2 letras o más, los resultados.
  const initial = useExercisesInfinite(NO_FILTERS);
  const results = useSearchExercises(debouncedSearch, NO_FILTERS);

  const exercises: Exercise[] = isSearching
    ? (results.data?.results ?? [])
    : (initial.data?.pages[0]?.results ?? []);
  const isLoading = isSearching ? results.isLoading : initial.isLoading;

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

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-3.5 left-3.5 size-4.5 text-fg-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar ejercicio"
          autoComplete="off"
          autoFocus
          className={`${composerFieldClass} h-12 pr-3.5 pl-10`}
        />
      </div>

      <ul className="-mx-1.5 grid max-h-66 overflow-y-auto overscroll-contain">
        {isLoading && <li className="px-2.5 py-3 text-fg-subtle">Buscando…</li>}

        {!isLoading && exercises.length === 0 && (
          <li className="px-2.5 py-3 text-fg-subtle">
            {isSearching
              ? `Ningún ejercicio coincide con «${debouncedSearch}».`
              : "No hay ejercicios en el catálogo."}
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

      {!isSearching && (
        <p className="text-xs text-fg-subtle">
          Escribe al menos 2 letras para buscar en todo el catálogo.
        </p>
      )}
    </div>
  );
}
