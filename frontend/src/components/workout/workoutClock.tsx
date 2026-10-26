import useNow from "../../hooks/useNow";
import { formatDuration } from "../../utils/format";

export default function WorkoutClock({ startedAt }: { startedAt: string }) {
  const now = useNow(1000);
  const seconds = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));

  return (
    <span
      role="timer"
      aria-label="Tiempo de entreno"
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 text-lg font-bold tabular-nums"
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full bg-success ring-3 ring-success/20"
      />
      {formatDuration(seconds)}
    </span>
  );
}
