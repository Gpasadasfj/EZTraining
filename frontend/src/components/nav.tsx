import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import Logo from "./logo";

export default function Nav() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="">
      <Logo />
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "text-accent" : "text-fg-muted hover:text-fg"
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/exercises"
        className={({ isActive }) =>
          isActive ? "text-accent" : "text-fg-muted hover:text-fg"
        }
      >
        Ejercicios
      </NavLink>
      <NavLink
        to="/me"
        className={({ isActive }) =>
          isActive ? "text-accent" : "text-fg-muted hover:text-fg"
        }
      >
        Mi perfil
      </NavLink>
      <NavLink
        to="/routines"
        className={({ isActive }) =>
          isActive ? "text-accent" : "text-fg-muted hover:text-fg"
        }
      >
        Rutinas
      </NavLink>
      <NavLink
        to="/workouts"
        className={({ isActive }) =>
          isActive ? "text-accent" : "text-fg-muted hover:text-fg"
        }
      >
        Entrenamiento
      </NavLink>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </nav>
  );
}
