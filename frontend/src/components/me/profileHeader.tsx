import { Camera, Pencil } from "lucide-react";
import Avatar from "./avatar";
import type { User } from "../../types/users";
import { formatNumber } from "../../utils/format";

interface ProfileHeaderProps {
  me: User;
  onEditPhoto: () => void;
  onEdit: () => void;
}

interface FactProps {
  label: string;
  value: string | null;
  unit: string;
}

function Fact({ label, value, unit }: FactProps) {
  return (
    <div className="grid gap-0.5 rounded-xl border border-line bg-surface px-3.5 py-3">
      <dt className="text-xs font-bold tracking-wider text-fg-subtle uppercase">
        {label}
      </dt>
      <dd className="font-display text-2xl leading-tight font-bold tabular-nums">
        {value ? (
          <>
            {value}
            <span className="ml-1 font-sans text-sm font-medium text-fg-muted">
              {unit}
            </span>
          </>
        ) : (
          <span className="text-fg-subtle">–</span>
        )}
      </dd>
    </div>
  );
}

export default function ProfileHeader({
  me,
  onEditPhoto,
  onEdit,
}: ProfileHeaderProps) {
  const fullName = `${me.first_name} ${me.last_name}`.trim() || me.username;
  const toFact = (value: string | null, decimals = 1) =>
    value ? formatNumber(Number(value), decimals) : null;

  return (
    <header className="grid gap-5 lg:flex lg:items-end lg:justify-between lg:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <button
          type="button"
          onClick={onEditPhoto}
          aria-label="Cambiar foto de perfil"
          className="relative shrink-0 rounded-full"
        >
          <Avatar
            user={me}
            className="size-16 font-display text-3xl font-extrabold italic lg:size-19 lg:text-4xl"
          />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -bottom-0.5 grid size-6.5 place-items-center rounded-full border-2 border-canvas bg-surface-hover text-fg"
          >
            <Camera className="size-3.5" />
          </span>
        </button>

        <div className="grid min-w-0 flex-1">
          <h1 className="font-display text-4xl leading-none font-extrabold text-balance wrap-anywhere italic uppercase lg:text-5xl">
            {fullName}
          </h1>
          <p className="truncate text-fg-muted">
            @{me.username} · {me.email}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar tus datos"
          className="grid size-10 shrink-0 place-items-center rounded-button bg-surface-hover transition-colors hover:bg-line-strong"
        >
          <Pencil className="size-4.5" aria-hidden="true" />
        </button>
      </div>

      <dl className="grid grid-cols-3 gap-2 lg:w-full lg:max-w-130">
        <Fact label="Altura" value={toFact(me.height, 2)} unit="m" />
        <Fact label="Peso" value={toFact(me.current_weight)} unit="kg" />
        <Fact label="Objetivo" value={toFact(me.target_weight)} unit="kg" />
      </dl>
    </header>
  );
}
