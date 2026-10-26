import { useEffect, useState } from "react";

// Hora actual que se refresca cada `interval` ms, para relojes y cuentas atrás
export default function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);

  return now;
}