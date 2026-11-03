export function formatKg(value: number, decimals = 1) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

export function greetingByHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 14) return "Buenos días";
  if (hour < 21) return "Buenas tardes";
  return "Buenas noches";
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatReps(min: number, max: number) {
  return min === max ? String(min) : `${min}–${max}`;
}

export const formatDecimal = (value: string | null) =>
  // "80.00" → "80", "77.50" → "77,5"
  value === null
    ? ""
    : Number(value).toLocaleString("es-ES", {
        maximumFractionDigits: 2,
        useGrouping: false,
      });

export const formatRest = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) return `${secs} s`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} s`;
};

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = String(totalSeconds % 60).padStart(2, "0");

  return hours > 0
    ? `${hours}:${String(mins).padStart(2, "0")}:${secs}`
    : `${mins}:${secs}`;
}

// 82.3 → "82,3" · con 2 decimales, 1.78 → "1,78"
export const formatNumber = (value: number, maxDecimals = 1) =>
  value.toLocaleString("es-ES", { maximumFractionDigits: maxDecimals });

// "82,5" o "82.5" → 82.5 · vacío o no numérico → null
export const parseDecimal = (text: string) => {
  const clean = text.trim().replace(",", ".");
  if (clean === "") return null;
  const value = Number(clean);
  return Number.isNaN(value) ? null : value;
};

// "2026-10-14" → "14 oct"
export const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
