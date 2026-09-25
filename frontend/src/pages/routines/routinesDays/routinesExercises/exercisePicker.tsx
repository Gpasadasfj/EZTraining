import { useEffect, useState } from "react";
import { useSearchExercises } from "../../../../hooks/useExercises";
import type { Exercise, ExerciseFilters } from "../../../../types/exercises";
import ExerciseFiltersPanel from "../../../../components/exerciseFiltersPanel";

interface ExercisePickerProps {
  selectedName?: string;
  onSelect: (exercise: Exercise) => void;
}

export default function ExercisePicker({ selectedName, onSelect }: ExercisePickerProps) {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ExerciseFilters>({
  muscle: null,
  secondaryMuscles: [],
  equipment: [],
});

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(text.trim()), 300);
    return () => clearTimeout(timeout);
  }, [text]);

  const { data, isFetching, isError, error } = useSearchExercises(search, filters);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setText("");
    setSearch("");
  };

  return (
    <div>
      <p>Ejercicio: {selectedName ?? "ninguno seleccionado"}</p>
      <input
        type="text"
        placeholder="Buscar ejercicio..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ExerciseFiltersPanel filters={filters} onChange={setFilters} />
      {isFetching && <p>Buscando...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && data.results.length === 0 && <p>No hay resultados</p>}
      <ul>
        {data?.results.map((exercise) => (
          <li key={exercise.id}>
            <button type="button" onClick={() => handleSelect(exercise)}>
              {exercise.name_es}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}