import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, House } from "lucide-react";
import type { NavItem } from "../../types/nav";

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio", icon: House, end: true },
  { to: "/routines", label: "Rutinas", icon: ClipboardList },
  { to: "/exercises", label: "Ejercicios", icon: BookOpen },
];

export default function Nav() {
  return (
    <nav aria-label="Navegación principal" className="hidden h-full lg:flex">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `relative flex items-center gap-2 px-3.5 text-sm font-medium transition-colors duration-150
            after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary
            after:transition-transform after:duration-200 after:ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isActive
                ? "text-fg after:scale-x-100"
                : "text-fg-muted hover:text-fg after:scale-x-0"
            }`
          }
        >
          <Icon className="size-4.5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
