import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import Logo from "./logo";
import Nav from "./nav";
import UserMenu from "./userMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 lg:h-16 lg:px-10">
        <Link to="/" className="shrink-0">
          <Logo className="text-2xl" />
        </Link>

        <Nav />

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link
            to="/workouts"
            className="inline-flex h-10 items-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[background-color,scale] duration-150 hover:bg-primary-hover active:scale-[0.97]"
          >
            <Play className="size-4 fill-current" aria-hidden="true" />
            Empezar entreno
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
