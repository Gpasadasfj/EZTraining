import { useEquipment, useMuscles } from "../hooks/useExercises";
import type { ExerciseFilters } from "../types/exercises";

interface ExerciseFiltersPanelProps {
  filters: ExerciseFilters;
  onChange: (filters: ExerciseFilters) => void;
}

function toggleId(list: number[], id: number) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function ExerciseFiltersPanel({ filters, onChange }: ExerciseFiltersPanelProps) {
  const muscles = useMuscles();
  const equipment = useEquipment();

  if (muscles.isLoading || equipment.isLoading) return <p>Cargando filtros...</p>;
  if (muscles.isError || equipment.isError) return <p>No se pudieron cargar los filtros</p>;

  return (
    <div>
      <label>
        Músculo principal
        <select
          value={filters.muscle ?? ""}
          onChange={(e) =>
            onChange({ ...filters, muscle: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">Cualquiera</option>
          {muscles.data?.map((muscle) => (
            <option key={muscle.id} value={muscle.id}>
              {muscle.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Músculos secundarios</legend>
        {muscles.data?.map((muscle) => (
          <label key={muscle.id}>
            <input
              type="checkbox"
              checked={filters.secondaryMuscles.includes(muscle.id)}
              onChange={() =>
                onChange({
                  ...filters,
                  secondaryMuscles: toggleId(filters.secondaryMuscles, muscle.id),
                })
              }
            />
            {muscle.name}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Equipamiento</legend>
        {equipment.data?.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={filters.equipment.includes(item.id)}
              onChange={() =>
                onChange({ ...filters, equipment: toggleId(filters.equipment, item.id) })
              }
            />
            {item.name}
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={() => onChange({ muscle: null, secondaryMuscles: [], equipment: [] })}
      >
        Limpiar filtros
      </button>
    </div>
  );
}