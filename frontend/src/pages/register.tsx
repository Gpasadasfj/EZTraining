import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircleAlert, LoaderCircle, Lock, Mail, User } from "lucide-react";
import { registerRequest } from "../api/auth";
import loginAndStoreTokens from "../services/auth";
import Logo from "../components/logo";
import FormField from "../components/formField";

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Borra el error de un campo cuando el usuario vuelve a escribir en él
  function clearError(field: keyof RegisterErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    // 1. Validación en el cliente
    const errors: RegisterErrors = {};
    if (!username.trim()) errors.username = "Elige un nombre de usuario.";
    if (!email.trim()) errors.email = "Escribe tu email.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errors.email = "Este email no parece válido.";
    if (password.length < 8) errors.password = "Usa al menos 8 caracteres.";
    if (confirmPassword !== password)
      errors.confirmPassword = "Las contraseñas no coinciden.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    // 2. Crear la cuenta
    try {
      await registerRequest({
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        // DRF devuelve los errores por campo: { username: ["..."], email: ["..."] }
        const data = err.response.data as Record<string, string[] | undefined>;
        setFieldErrors({
          username: data.username?.[0],
          email: data.email?.[0],
          password: data.password?.[0],
        });
        if (data.non_field_errors) setError(data.non_field_errors[0]);
      } else if (axios.isAxiosError(err) && !err.response) {
        setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
      } else {
        setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
      }
      setIsSubmitting(false);
      return;
    }

    // 3. Iniciar sesión con la cuenta recién creada
    try {
      await loginAndStoreTokens(username.trim(), password);
      navigate("/");
    } catch {
      // La cuenta existe aunque el login automático falle: que entre a mano
      navigate("/login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 rounded-card border border-line bg-surface p-7 shadow-2xl shadow-black/40">
      <Logo className="text-3xl lg:hidden" />

      <div className="grid gap-1.5">
        <h1 className="font-display text-3xl leading-tight font-bold">
          Crea tu cuenta
        </h1>
        <p className="text-fg-muted">
          Empieza a registrar tus entrenos en un minuto.
        </p>
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
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          spellCheck={false}
          autoComplete="email"
          inputMode="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          error={fieldErrors.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={fieldErrors.password}
        />
        <FormField
          id="confirmPassword"
          label="Repite la contraseña"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Escríbela otra vez"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError("confirmPassword");
          }}
          error={fieldErrors.confirmPassword}
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-button border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm"
          >
            <CircleAlert
              className="mt-0.5 size-4.5 shrink-0 text-danger"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-5 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg active:bg-primary-active disabled:cursor-progress disabled:opacity-80"
        >
          {isSubmitting && (
            <LoaderCircle
              className="size-4.5 animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="border-t border-line pt-5 text-center text-fg-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-accent hover:underline hover:underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}