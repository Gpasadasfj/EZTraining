import { useState } from "react";
import ExerciseFiltersPanel from "../components/exerciseFiltersPanel";
import { useExercisesInfinite } from "../hooks/useExercises";
import type { ExerciseFilters } from "../types/exercises";

export default function Exercises() {
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscle: null,
    secondaryMuscles: [],
    equipment: [],
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useExercisesInfinite(filters);

  const exercises = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <div>
      <h1>Ejercicios</h1>

      <ExerciseFiltersPanel filters={filters} onChange={setFilters} />

      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && exercises.length === 0 && <p>No hay ejercicios con esos filtros</p>}

      {exercises.map((ex) => (
        <div key={ex.id}>{ex.name_es}</div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Cargar más
        </button>
      )}
    </div>
  );
}