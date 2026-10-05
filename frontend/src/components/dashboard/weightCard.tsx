// components/dashboard/weightCard.tsx
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatKg } from "../../utils/format";

const cardClass =
  "flex flex-col rounded-card border border-line bg-surface p-[18px] lg:p-[22px]";

const titleClass = "m-0 flex items-center gap-2 text-base font-semibold";

const footClass =
  "mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-[0.92rem] text-fg-muted";

interface WeightCardProps {
  current: number | null;
  target: number | null;
}

export default function WeightCard({ current, target }: WeightCardProps) {
  /* ---------- Sin peso registrado ---------- */
  if (current === null) {
    return (
      <section aria-labelledby="weight-title" className={cardClass}>
        <h2 id="weight-title" className={titleClass}>
          <span aria-hidden="true" className="text-[1.1rem] leading-none">
            ⚖️
          </span>
          Peso corporal
        </h2>

        <div className="my-auto grid justify-items-start gap-3 py-4">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-[14px] bg-surface-hover text-2xl"
          >
            📏
          </span>
          <p className="m-0 max-w-[34ch] text-fg-muted">
            Registra tu peso y fija un objetivo: aquí verás cuánto te falta para
            llegar.
          </p>
          <Link
            to="/me"
            className="inline-flex h-10.5 items-center gap-2 rounded-button border border-line-strong px-4 font-semibold text-fg transition-[background-color,scale] duration-150 hover:bg-surface-hover active:scale-[0.97]"
          >
            <Plus className="size-4.5" aria-hidden="true" />
            Registrar peso
          </Link>
        </div>
      </section>
    );
  }

  /* ---------- Con peso ---------- */
  const diff = target !== null ? current - target : null; // > 0: te sobra, < 0: te falta subir
  const gap = diff !== null ? Math.abs(diff) : 0;
  const reached = diff !== null && gap < 0.05;
  const showBar = target !== null && !reached;

  return (
    <section aria-labelledby="weight-title" className={cardClass}>
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <h2 id="weight-title" className={titleClass}>
          <span aria-hidden="true" className="text-[1.1rem] leading-none">
            ⚖️
          </span>
          Peso corporal
        </h2>
        <Link
          to="/me"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-hover px-3 text-sm font-semibold text-fg transition-[scale] duration-150 active:scale-[0.96]"
        >
          <Plus className="size-3.75" strokeWidth={2.5} aria-hidden="true" />
          Registrar
        </Link>
      </div>

      {/* Peso actual */}
      <p
        className={`m-0 mt-3 flex items-baseline gap-2 lg:mt-auto lg:pt-3 ${showBar ? "" : "mb-6"}`}
      >
        <span className="font-display text-[2.6rem] leading-none font-bold text-fg tabular-nums lg:text-[3.2rem]">
          {formatKg(current)}
        </span>
        <span className="font-medium text-fg-muted">kg</span>
      </p>

      {/* Barra hasta el objetivo */}
      {target !== null && !reached && (
        <div
          role="img"
          aria-label={`Peso actual ${formatKg(current)} kg, objetivo ${formatKg(target)} kg, diferencia ${formatKg(gap)} kg`}
          className="my-4 grid gap-2 lg:my-auto lg:py-3.5"
        >
          <div className="relative flex h-7 items-center">
            <span className="absolute top-1/2 right-3.5 left-1.5 h-1 -translate-y-1/2 rounded-full bg-linear-to-r from-blue-400 to-blue-400/25" />
            <span className="relative size-3.5 rounded-full bg-blue-400 ring-4 ring-blue-500/15" />
            <span className="relative mx-auto rounded-full border border-blue-400/35 bg-surface px-2.5 py-0.5 text-sm font-bold text-blue-400 tabular-nums">
              {diff! > 0 ? "−" : "+"}
              {formatKg(gap)} kg
            </span>
            <span className="relative grid size-7 place-items-center rounded-full bg-surface-hover text-[0.95rem]">
              🎯
            </span>
          </div>
          <div className="flex justify-between text-xs text-fg-subtle">
            <span>
              Actual{" "}
              <b className="font-semibold text-fg tabular-nums">
                {formatKg(current)}
              </b>
            </span>
            <span>
              Objetivo{" "}
              <b className="font-semibold text-fg tabular-nums">
                {formatKg(target)} kg
              </b>
            </span>
          </div>
        </div>
      )}

      {/* Pie */}
      <div
        className={`${footClass} ${target === null || reached ? "mt-4 lg:mt-auto" : ""}`}
      >
        {target === null ? (
          <Link to="/me" className="font-semibold text-accent">
            🎯 Fija un objetivo de peso
          </Link>
        ) : reached ? (
          <span className="font-semibold text-green-400">
            ¡Objetivo alcanzado!&nbsp;🎉
          </span>
        ) : (
          <>
            <span>
              Te faltan{" "}
              <strong className="font-bold text-fg tabular-nums">
                {formatKg(gap)} kg
              </strong>{" "}
              para tu objetivo
            </span>
            <span aria-hidden="true">👊</span>
          </>
        )}
      </div>
    </section>
  );
}
