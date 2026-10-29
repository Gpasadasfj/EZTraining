import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import ConfirmDialog from "../../components/ui/confirmDialog";
import ExerciseFiltersSheet from "../../components/exercises/exerciseFiltersSheet";
import ExerciseRow from "../../components/exercises/exerciseRow";
import ExerciseInfoSheet from "../../components/workout/exerciseInfoSheet";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  useDeleteExercise,
  useEquipment,
  useExercisesInfinite,
  useMuscles,
} from "../../hooks/useExercises";
import type { Exercise, ExerciseFilters, FilterOption } from "../../types/exercises";

type Source = "catalog" | "mine";

const NO_FILTERS: ExerciseFilters = { muscle: null, secondaryMuscles: [], equipment: [] };

const nameOf = (options: FilterOption[] | undefined, id: number) =>
  options?.find((option) => option.id === id)?.name ?? "…";

const tabClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-fg aria-selected:bg-surface-hover aria-selected:text-fg";

export default function Exercises() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // La pestaña va en la URL para volver a ella al guardar un ejercicio
  const source: Source = searchParams.get("tab") === "mine" ? "mine" : "catalog";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ExerciseFilters>(NO_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [infoSlug, setInfoSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Exercise | null>(null);

  // Se busca a partir de 2 letras, igual que en el selector de rutinas
  const debounced = useDebouncedValue(search.trim());
  const searchTerm = debounced.length >= 2 ? debounced : "";
  const custom = source === "mine";

  const list = useExercisesInfinite({ ...filters, custom }, searchTerm);
  const catalogTotal = useExercisesInfinite({ ...NO_FILTERS, custom: false });
  const mineTotal = useExercisesInfinite({ ...NO_FILTERS, custom: true });
  const { data: muscles } = useMuscles();
  const { data: equipment } = useEquipment();
  const deleteExercise = useDeleteExercise();

  const exercises = list.data?.pages.flatMap((page) => page.results) ?? [];
  const resultCount = list.data?.pages[0]?.count ?? 0;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = list;

  // Carga infinita: cuando el final de la lista se acerca a la pantalla, se pide la siguiente página
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activeFilters = [
    ...(filters.muscle !== null
      ? [{ key: `m-${filters.muscle}`, label: nameOf(muscles, filters.muscle), remove: () => setFilters({ ...filters, muscle: null }) }]
      : []),
    ...filters.secondaryMuscles.map((id) => ({
      key: `s-${id}`,
      label: nameOf(muscles, id),
      remove: () => setFilters({ ...filters, secondaryMuscles: filters.secondaryMuscles.filter((item) => item !== id) }),
    })),
    ...filters.equipment.map((id) => ({
      key: `e-${id}`,
      label: nameOf(equipment, id),
      remove: () => setFilters({ ...filters, equipment: filters.equipment.filter((item) => item !== id) }),
    })),
  ];

  const selectTab = (next: Source) => {
    setSearchParams(next === "mine" ? { tab: "mine" } : {}, { replace: true });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteExercise.mutate(deleting.slug, {
      onSuccess: () => {
        setDeleting(null);
        setInfoSlug(null);
      },
    });
  };

  const typedName = search.trim();

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:gap-5">
      <header className="flex items-end gap-3">
        <div className="grid min-w-0 flex-1 gap-2">
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">Biblioteca</span>
          <h1 className="font-display text-4xl leading-none font-bold italic uppercase lg:text-5xl">
            Ejercicios
          </h1>
        </div>
        <Link
          to="/exercises/new"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-button bg-primary px-3.5 font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[background-color,scale] duration-150 hover:bg-primary-hover active:scale-97 lg:h-11 lg:px-4.5"
        >
          <Plus className="size-4.5" aria-hidden="true" />
          Nuevo
        </Link>
      </header>

      <div
        role="tablist"
        aria-label="Origen de los ejercicios"
        className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 lg:max-w-md"
      >
        <button type="button" role="tab" aria-selected={source === "catalog"} onClick={() => selectTab("catalog")} className={tabClass}>
          Catálogo
          <span className="text-xs font-semibold text-fg-subtle tabular-nums">
            {catalogTotal.data?.pages[0]?.count.toLocaleString("es-ES")}
          </span>
        </button>
        <button type="button" role="tab" aria-selected={source === "mine"} onClick={() => selectTab("mine")} className={tabClass}>
          Mis ejercicios
          <span className="text-xs font-semibold text-fg-subtle tabular-nums">
            {mineTotal.data?.pages[0]?.count}
          </span>
        </button>
      </div>

      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={source === "mine" ? "Buscar en tus ejercicios" : "Buscar ejercicio"}
            aria-label="Buscar ejercicio"
            autoComplete="off"
            className="h-11 w-full rounded-button border border-line-strong bg-surface pr-3.5 pl-10 text-base placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          aria-haspopup="dialog"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-button border border-line-strong bg-surface px-3.5 font-semibold transition-colors hover:bg-surface-hover"
        >
          <SlidersHorizontal className="size-4.5" aria-hidden="true" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-on-primary tabular-nums">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div aria-label="Filtros activos" className="-mx-4 flex scrollbar-none gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.remove}
              aria-label={`Quitar filtro ${filter.label}`}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-primary-soft pr-2 pl-3 text-sm font-semibold text-accent transition-colors hover:bg-primary/25"
            >
              {filter.label}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {list.isLoading && (
        <ul aria-busy="true" aria-label="Cargando ejercicios" className="grid gap-2 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="h-17 animate-pulse rounded-card bg-surface" />
          ))}
        </ul>
      )}

      {list.isError && <p className="text-fg-muted">No se pudieron cargar los ejercicios.</p>}

      {list.data && exercises.length === 0 && (
        <div className="grid justify-items-start gap-2.5 rounded-card border border-dashed border-line-strong p-5">
          {source === "mine" && typedName ? (
            <>
              <p className="font-semibold">No tienes ningún ejercicio llamado así</p>
              <p className="text-fg-muted">Créalo y podrás añadirlo a tus rutinas.</p>
              <button
                type="button"
                onClick={() => navigate(`/exercises/new?name=${encodeURIComponent(typedName)}`)}
                className="mt-1 inline-flex h-11 max-w-full items-center gap-2 rounded-button bg-primary px-4 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
              >
                <Plus className="size-4.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Crear «{typedName}»</span>
              </button>
            </>
          ) : source === "mine" && activeFilters.length === 0 ? (
            <>
              <p className="font-semibold">Aún no has creado ningún ejercicio</p>
              <p className="text-fg-muted">Los que crees solo los verás tú y podrás usarlos en tus rutinas.</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Ningún ejercicio coincide</p>
              <p className="text-fg-muted">Prueba con otra búsqueda o quita algún filtro.</p>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="mt-1 h-10 rounded-button bg-surface-hover px-4 font-semibold transition-colors hover:bg-line-strong"
                >
                  Quitar filtros
                </button>
              )}
            </>
          )}
        </div>
      )}

      {exercises.length > 0 && (
        <>
          <p className="text-sm text-fg-subtle tabular-nums">
            {resultCount.toLocaleString("es-ES")} {resultCount === 1 ? "ejercicio" : "ejercicios"}
          </p>
          <ul className="grid gap-2 lg:grid-cols-2">
            {exercises.map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} onOpen={setInfoSlug} />
            ))}
          </ul>
        </>
      )}

      {/* Marca el final de la lista para la carga infinita */}
      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <p className="flex items-center justify-center gap-2 text-sm text-fg-subtle">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Cargando más…
        </p>
      )}

      {isFiltersOpen && (
        <ExerciseFiltersSheet
          filters={filters}
          custom={custom}
          search={searchTerm}
          onApply={(next) => {
            setFilters(next);
            setIsFiltersOpen(false);
          }}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}

      <ExerciseInfoSheet
        slug={infoSlug}
        onClose={() => setInfoSlug(null)}
        onEdit={(exercise) => navigate(`/exercises/${exercise.slug}/edit`)}
        onDelete={setDeleting}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={`¿Borrar «${deleting?.name_es ?? ""}»?`}
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        tone="danger"
        isPending={deleteExercise.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        Se quitará de las rutinas que lo usen. Tus entrenos pasados lo seguirán mostrando.
        {deleteExercise.isError && (
          <span role="alert" className="mt-2 block text-red-400">
            No se pudo borrar. Inténtalo de nuevo.
          </span>
        )}
      </ConfirmDialog>
    </div>
  );
}