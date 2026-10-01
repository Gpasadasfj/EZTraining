import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { logout } from "../services/auth";
import useMe from "../hooks/useMe";
import { useQueryClient } from "@tanstack/react-query";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const initial = me?.username.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleLogout() {
    logout();
    queryClient.clear();
    navigate("/login");
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de usuario"
        className="flex items-center gap-1.5 rounded-full border border-line py-1 pr-2.5 pl-1 text-fg-muted transition-colors duration-150 hover:border-line-strong hover:text-fg"
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-accent">
          {initial ?? <User className="size-4.5" aria-hidden="true" />}
        </span>
        {me && (
          <span className="max-w-32 truncate text-sm font-medium text-fg">
            {me.username}
          </span>
        )}
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`absolute top-full right-0 mt-2 w-52 origin-top-right rounded-card border border-line bg-surface p-1.5 shadow-2xl shadow-black/50
          transition-[opacity,scale,visibility] ease-[cubic-bezier(0.23,1,0.32,1)] ${
            open
              ? "visible scale-100 opacity-100 duration-180"
              : "invisible scale-95 opacity-0 duration-120"
          }`}
      >
        {me && (
          <>
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-fg">
                {me.username}
              </p>
              <p className="truncate text-xs text-fg-subtle">{me.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
          </>
        )}
        <Link
          to="/me"
          onClick={() => setOpen(false)}
          className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-fg transition-colors hover:bg-surface-hover"
        >
          <User className="size-4" aria-hidden="true" />
          Mi perfil
        </Link>
        <div className="my-1 h-px bg-line" />
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
