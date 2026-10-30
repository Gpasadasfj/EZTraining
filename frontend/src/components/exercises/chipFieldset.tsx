import OptionChip from "./optionChip";
import { cardClass } from "./formStyles";

interface ChipOption {
  id: number;
  name: string;
}

interface ChipFieldsetProps {
  legend: string;
  optional?: boolean;
  options?: ChipOption[];
  isSelected: (id: number) => boolean;
  isDisabled?: (id: number) => boolean;
  onToggle: (id: number) => void;
}

export default function ChipFieldset({
  legend,
  optional = false,
  options = [],
  isSelected,
  isDisabled,
  onToggle,
}: ChipFieldsetProps) {
  return (
    <fieldset className={cardClass}>
      <legend className="sr-only">
        {optional ? `${legend} (opcional)` : legend}
      </legend>
      <p aria-hidden="true" className="font-semibold">
        {legend}
        {optional && (
          <span className="ml-2 text-sm font-medium text-fg-subtle">
            Opcional
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <OptionChip
            key={option.id}
            selected={isSelected(option.id)}
            disabled={isDisabled?.(option.id)}
            onClick={() => onToggle(option.id)}
          >
            {option.name}
          </OptionChip>
        ))}
      </div>
    </fieldset>
  );
}
