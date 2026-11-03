import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";

// Lo usan el menú de usuario (escritorio) y la página de perfil (móvil)
export default function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    logout();
    // Vacía la caché para que el siguiente usuario no vea datos del anterior
    queryClient.clear();
    navigate("/login");
  };
}
