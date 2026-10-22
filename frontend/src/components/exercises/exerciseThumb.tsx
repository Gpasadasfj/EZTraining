import { useState } from "react";
import { Dumbbell } from "lucide-react";

const SIZES = {
  sm: "size-10",
  md: "size-12",
} as const;

interface ExerciseThumbProps {
  src: string | null | undefined;
  size?: keyof typeof SIZES;
}

// Miniatura del ejercicio. Si no tiene imagen o falla al cargar, muestra un icono.
// Es decorativa: el nombre del ejercicio siempre va al lado.
export default function ExerciseThumb({ src, size = "md" }: ExerciseThumbProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      aria-hidden
      className={`grid ${SIZES[size]} shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface-hover`}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <Dumbbell className="size-1/2 text-fg-subtle" />
      )}
    </span>
  );
}