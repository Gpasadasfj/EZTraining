import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircleAlert, LoaderCircle, Lock, User } from "lucide-react";
import loginAndStoreTokens from "../services/auth";
import Logo from "../components/logo";
import FormField from "../components/formField";

interface LoginErrors {
  username?: string;
  password?: string;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Borra el error de un campo cuando el usuario vuelve a escribir en él
  function clearError(field: keyof LoginErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    // 1. Validación en el cliente
    const errors: LoginErrors = {};
    if (!username.trim()) errors.username = "Escribe tu nombre de usuario.";
    if (!password) errors.password = "Escribe tu contraseña.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // 2. Petición al backend
    setIsSubmitting(true);
    try {
      await loginAndStoreTokens(username.trim(), password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (axios.isAxiosError(err) && !err.response) {
        setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
      } else {
        setError("Algo ha fallado. Inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 rounded-card border border-line bg-surface p-7 shadow-2xl shadow-black/40">
      <Logo className="text-3xl lg:hidden" />

      <div className="grid gap-1.5">
        <h1 className="font-display text-3xl leading-tight font-bold">Bienvenido de nuevo</h1>
        <p className="text-fg-muted">Inicia sesión para seguir con tu entreno.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
        <FormField
          id="username"
          label="Nombre de usuario"
          icon={User}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          placeholder="tu_usuario"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearError("username");
          }}
          error={fieldErrors.username}
        />
        <FormField
          id="password"
          label="Contraseña"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={fieldErrors.password}
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-button border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm"
          >
            <CircleAlert className="mt-0.5 size-4.5 shrink-0 text-danger" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-5 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg active:bg-primary-active disabled:cursor-progress disabled:opacity-80"
        >
          {isSubmitting && <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="border-t border-line pt-5 text-center text-fg-muted">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-semibold text-accent hover:underline hover:underline-offset-4"
        >
          Regístrate
        </Link>
      </p>
    </section>
  );
}