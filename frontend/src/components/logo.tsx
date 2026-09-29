interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ showWordmark = true, className = "text-2xl" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 120 48"
        className="h-[0.8em] w-auto text-brand"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M4 24 H36 L44 17 L52 31 L60 24 L68 31 L76 17 L84 24 H116"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="21" y="8" width="7" height="32" rx="2" />
        <rect x="14" y="13" width="5" height="22" rx="1.5" />
        <rect x="92" y="8" width="7" height="32" rx="2" />
        <rect x="101" y="13" width="5" height="22" rx="1.5" />
      </svg>
      {showWordmark && (
        <span className="font-display font-extrabold italic leading-none text-fg">
          <span className="text-brand">EZ</span>Training
        </span>
      )}
    </span>
  );
}