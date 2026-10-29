import { Outlet, useLocation, useMatch } from "react-router-dom";
import Header from "../components/layout/header";
import MobileNav from "../components/layout/mobileNav";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isWizard = pathname === "/routines/new";
  // Durante un entreno, el hueco de abajo es para el descanso y "Terminar entreno"
  const isWorkout = useMatch("/workouts/:id") !== null;
  // En el formulario de ejercicio, para "Cancelar" y "Guardar"
  const isNewExercise = useMatch("/exercises/new") !== null;
  const isEditExercise = useMatch("/exercises/:slug/edit") !== null;
  const hideNav = isWizard || isWorkout || isNewExercise || isEditExercise;

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-canvas">
      {/* Resplandor naranja de fondo, común a todas las páginas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-105 bg-[radial-gradient(40%_60%_at_65%_0%,rgb(249_115_22/0.12),transparent_100%)]"
      />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 lg:px-10 lg:pb-10">
        <Outlet />
      </main>

      {!hideNav && <MobileNav />}
    </div>
  );
}