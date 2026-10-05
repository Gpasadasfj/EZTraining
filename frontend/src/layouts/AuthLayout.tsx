import { Outlet } from "react-router-dom";
import PulseBackground from "../components/pulseBackground";
import BrandPanel from "../components/brandPanel";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <PulseBackground />
      <main className="relative mx-auto grid min-h-screen max-w-6xl items-center justify-items-center gap-12 px-4 py-8 lg:grid-cols-[1.1fr_1fr] lg:justify-items-stretch lg:px-10">
        <section className="hidden lg:block">
          <BrandPanel />
        </section>
        <div className="w-full max-w-md lg:justify-self-end">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
