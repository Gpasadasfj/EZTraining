import { Outlet } from "react-router-dom";
import Header from "../components/header";
import MobileNav from "../components/mobileNav";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 lg:px-10 lg:pb-10">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
