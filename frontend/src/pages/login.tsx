import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginAndStoreTokens from "../services/auth";
import axios from "axios";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()

        try {
            await loginAndStoreTokens(username, password);
            navigate("/");  
        } catch (e) {
            if (axios.isAxiosError(e)) {
                console.log(e.response)
            }
            setError("Usuario o contraseña incorrectos")
        };
        
    }

    return (
        <form onSubmit={handleSubmit}>
            <p>usuario</p>
            <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} />
            <p>contraseña</p>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit">enviar</button>
            <Link to="/register">Regístrate!</Link>
        </form>
    )
}

