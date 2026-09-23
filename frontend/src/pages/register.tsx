import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import loginAndStoreTokens from "../services/auth";
import axios from "axios";
import type { RegisterPayload } from "../types/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const payload: RegisterPayload = { username, email, password };

    try {
      await api.post("users/register/", payload);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response);
      }
      setError("No se pudo completar el registro. Comprueba los datos.");
      return; // no seguimos si el registro falló
    }

    try {
      await loginAndStoreTokens(username, password);
      navigate("/");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response);
      }
      setError(
        "Te registraste, pero no se pudo iniciar sesión automáticamente",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Nombre de usuario</p>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <p>Email</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <p>Contraseña</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">enviar</button>
      <Link to="/login">Volver al login</Link>
    </form>
  );
}
