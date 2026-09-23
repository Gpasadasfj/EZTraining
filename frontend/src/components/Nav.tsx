import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Nav() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/exercises">Ejercicios</Link>{" "}
      <Link to="/me">Mi perfil</Link>
      <Link to="/routines">Rutinas</Link>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </nav>
  );
}
