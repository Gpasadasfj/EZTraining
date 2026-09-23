import useDashboard from "../hooks/useDashboard";

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <ul>
      {Object.entries(data).map(([key, value]) => (
        <li key={key}>
          {key}:{" "}
          {typeof value === "object" ? JSON.stringify(value) : String(value)}
        </li>
      ))}
    </ul>
  );
}
