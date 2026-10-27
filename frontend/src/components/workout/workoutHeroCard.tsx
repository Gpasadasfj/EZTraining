import type { ReactNode } from "react";

interface WorkoutHeroCardProps {
  eyebrow: string;
  eyebrowClass: string;
  title: string;
  meta: ReactNode;
  action: ReactNode;
}

export default function WorkoutHeroCard({
  eyebrow,
  eyebrowClass,
  title,
  meta,
  action,
}: WorkoutHeroCardProps) {
  return (
    <section className="grid gap-5 rounded-card border border-primary/30 bg-linear-to-br from-primary/15 via-surface to-surface p-5 lg:flex lg:items-end lg:justify-between lg:p-7">
      <div className="grid min-w-0 gap-2">
        <span
          className={`text-xs font-semibold tracking-widest uppercase ${eyebrowClass}`}
        >
          {eyebrow}
        </span>
        <h2 className="font-display text-5xl leading-none font-bold wrap-break-word italic uppercase lg:text-6xl">
          {title}
        </h2>
        <p className="text-fg-muted tabular-nums">{meta}</p>
      </div>
      {action}
    </section>
  );
}
