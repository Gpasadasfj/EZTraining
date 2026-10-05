import type { PersonalRecord, PersonalRecords } from "../../types/dashboard";
import { formatKg } from "../../utils/format";

/* Colores de los badges del design system: Push naranja, Pull azul, Legs verde */
const ZONES: { key: keyof PersonalRecords; label: string; color: string }[] = [
  { key: "chest", label: "Pecho", color: "text-orange-400" },
  { key: "back", label: "Espalda", color: "text-blue-400" },
  { key: "legs", label: "Pierna", color: "text-green-400" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

const rowBase =
  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-button border px-3.5 py-3";

const medalClass = "w-8 text-center text-[1.7rem] leading-none";

const zoneClass = "text-[0.72rem] font-bold tracking-[0.05em] uppercase";

function hasRecord(
  record: PersonalRecord | Record<string, never>,
): record is PersonalRecord {
  return "exercise" in record;
}

export default function RecordsCard({ records }: { records: PersonalRecords }) {
  // Zonas con récord, ordenadas de más a menos peso
  const ranked = ZONES.flatMap((zone) => {
    const record = records[zone.key];
    return hasRecord(record) ? [{ ...zone, record }] : [];
  }).sort(
    (a, b) =>
      Number(b.record.weight) - Number(a.record.weight) ||
      b.record.reps - a.record.reps,
  );

  // Zonas sin récord, al final del podio
  const missing = ZONES.filter((zone) => !hasRecord(records[zone.key]));

  return (
    <section
      aria-labelledby="records-title"
      className="flex flex-col rounded-card border border-line bg-surface p-4.5 lg:p-5.5"
    >
      {/* Cabecera */}
      <h2
        id="records-title"
        className="m-0 flex items-center gap-2 text-base font-semibold"
      >
        <span aria-hidden="true" className="text-[1.1rem] leading-none">
          🏆
        </span>
        Récords personales
      </h2>
      {ranked.length > 0 && (
        <p className="m-0 mt-1 text-[0.85rem] text-fg-subtle">
          Ordenados por peso levantado
        </p>
      )}

      {/* Podio */}
      <ol className="m-0 mt-3.5 grid list-none gap-2 p-0">
        {ranked.map(({ key, label, color, record }, i) => (
          <li
            key={key}
            className={`${rowBase} border-line ${
              i === 0
                ? "bg-[linear-gradient(90deg,rgb(249_115_22/0.12),rgb(249_115_22/0.02)_70%)] bg-canvas"
                : "bg-canvas"
            }`}
          >
            <span
              role="img"
              aria-label={`Puesto ${i + 1}`}
              className={medalClass}
            >
              {MEDALS[i]}
            </span>

            <span className="grid min-w-0 justify-items-start gap-1">
              <span className="line-clamp-2 leading-tight font-semibold text-fg">
                {record.exercise}
              </span>
              <span className={`${zoneClass} ${color}`}>{label}</span>
            </span>

            <span className="grid justify-items-end gap-0.5 text-right">
              <b className="font-display text-[1.6rem] leading-none font-bold whitespace-nowrap text-fg tabular-nums">
                {formatKg(Number(record.weight))} kg
              </b>
              <small className="text-[0.8rem] font-medium whitespace-nowrap text-fg-muted">
                × {record.reps} reps
              </small>
            </span>
          </li>
        ))}

        {missing.map(({ key, label, color }, i) => (
          <li
            key={key}
            className={`${rowBase} border-dashed border-line bg-transparent`}
          >
            <span
              aria-hidden="true"
              className={`${medalClass} opacity-35 grayscale`}
            >
              {MEDALS[ranked.length + i]}
            </span>

            <span className="grid min-w-0 justify-items-start gap-1">
              <span className="font-medium text-fg-subtle">
                Todavía sin récord
              </span>
              <span className={`${zoneClass} ${color}`}>{label}</span>
            </span>

            <span className="font-medium text-fg-subtle" aria-hidden="true">
              —
            </span>
          </li>
        ))}
      </ol>

      {ranked.length === 0 && (
        <p className="m-0 mt-auto pt-4 text-[0.92rem] text-fg-muted">
          Completa series y tus mejores marcas subirán al podio.&nbsp;💪
        </p>
      )}
    </section>
  );
}
