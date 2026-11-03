import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, House } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  // "default" = es la primera página de la pestaña: "atrás" sacaría al usuario de la app
  const canGoBack = location.key !== "default";

  return (
    <section className="mx-auto grid max-w-md justify-items-center gap-5 py-16 text-center lg:py-24">
      {/* Un latido y después la línea plana: aquí no hay pulso */}
      <svg
        viewBox="0 0 240 48"
        aria-hidden="true"
        className="h-12 w-full max-w-60"
      >
        <defs>
          <linearGradient id="lost-pulse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.3" stopColor="var(--color-primary)" />
            <stop offset="1" stopColor="var(--color-line-strong)" />
          </linearGradient>
        </defs>
        <path
          d="M4 24 H44 L52 14 L62 34 L70 24 H236"
          fill="none"
          stroke="url(#lost-pulse)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="grid gap-2">
        <p className="font-display text-8xl leading-none font-extrabold text-primary italic tabular-nums">
          404
        </p>
        <h1 className="font-display text-3xl leading-tight font-bold uppercase italic">
          Esta página no existe
        </h1>
        <p className="text-balance text-fg-muted">
          Puede que el enlace esté mal escrito o que lo que buscabas ya se haya
          borrado.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 rounded-button bg-primary px-4.5 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          <House className="size-4.5" aria-hidden="true" />
          Ir al inicio
        </Link>
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center gap-2 rounded-button bg-surface-hover px-4.5 font-semibold transition-colors hover:bg-line-strong"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
            Volver atrás
          </button>
        )}
      </div>
    </section>
  );
}
