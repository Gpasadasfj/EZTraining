import { useEffect, useState } from "react";
import useMe, { useUpdateMe } from "../hooks/useMe";
import WeightLog from "./weightLog";

export default function Me() {
  const { data, isLoading, isError, error } = useMe();
  const { mutate, isPending } = useUpdateMe();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.first_name);
      setLastName(data.last_name);
      setHeight(data.height);
    }
  }, [data]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutate({ first_name: name, last_name: lastName, height: height });
  };

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <p>Nombre</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p>Apellidos</p>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <p>Estatura</p>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <button type="submit" disabled={isPending}>
          Enviar
        </button>
      </form>

      <WeightLog />
    </div>
  );
}
