import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth"

export default function Nav() {
    const navigate = useNavigate()

    function handleLogout() {
        logout();
        navigate("/login")
    };

    return (
        <button onClick={handleLogout}>Cerrar sesión</button>
    )
}