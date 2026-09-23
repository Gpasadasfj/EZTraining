import useExercisesInfinite from "../hooks/useExercises";

export default function Exercises() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useExercisesInfinite();

  const exercises = data?.pages.flatMap((page) => page.results) ?? [];

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h1>Ejercicios</h1>
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
