import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/header";
import MobileNav from "../components/layout/mobileNav";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isWizard = pathname === "/routines/new";

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

      {/* Si no estamos en el formulario de creación de rutina, 
      mostramos el nav */}
      {!isWizard && <MobileNav />}
    </div>
  );
}
