// components/mobileDock.tsx
import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Dumbbell, House, User } from "lucide-react";
import type { NavItem } from "../../types/nav";

const LEFT_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio", icon: House, end: true },
  { to: "/routines", label: "Rutinas", icon: ClipboardList },
];

const RIGHT_ITEMS: NavItem[] = [
  { to: "/exercises", label: "Ejercicios", icon: BookOpen },
  { to: "/me", label: "Mi perfil", icon: User },
];

const pressable =
  "transition-[color,background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 [-webkit-tap-highlight-color:transparent]";

function MobileLink({ to, label, icon: Icon, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        `grid h-11 w-14 place-items-center rounded-full ${pressable} ${
          isActive
            ? "bg-primary-soft text-accent"
            : "text-fg-subtle hover:text-fg"
        }`
      }
    >
      <Icon className="size-5.5" aria-hidden="true" />
    </NavLink>
  );
}

export default function MobileNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-[calc(14px+env(safe-area-inset-bottom))] z-30 mx-auto w-[calc(100%-28px)] max-w-95 lg:hidden"
    >
      <div className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-center justify-items-center rounded-full border border-line bg-surface/85 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {LEFT_ITEMS.map((item) => (
          <MobileLink key={item.to} {...item} />
        ))}

        <NavLink
          to="/workouts"
          aria-label="Entrenar"
          className={({ isActive }) =>
            `mx-1.5 grid size-13 place-items-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/40 hover:bg-primary-hover ${pressable} ${
              isActive
                ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-surface"
                : ""
            }`
          }
        >
          <Dumbbell className="size-6.5" strokeWidth={2} aria-hidden="true" />
        </NavLink>

        {RIGHT_ITEMS.map((item) => (
          <MobileLink key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
