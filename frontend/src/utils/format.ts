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
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatReps(min: number, max: number) {
  return min === max ? String(min) : `${min}–${max}`;
}