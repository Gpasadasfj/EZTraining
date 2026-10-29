import type { ReactNode } from "react";

interface OptionChipProps {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function OptionChip({
  selected,
  disabled,
  onClick,
  children,
}: OptionChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className="h-9 rounded-full border border-line-strong px-3.5 text-sm font-medium text-fg-muted transition-colors hover:text-fg active:scale-96 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-fg-muted aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-accent"
    >
      {children}
    </button>
  );
}
