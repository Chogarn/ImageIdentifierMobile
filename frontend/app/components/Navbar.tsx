"use client";

import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-200">
        ImageIdentifier
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium">
        {isAuthenticated ? (
          <>
            <Link
              href="/animals"
              className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
            >
              Animales
            </Link>
            <Link
              href="/plants"
              className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
            >
              Plantas
            </Link>
            <Link
              href="/camera"
              className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
            >
              Cámara
            </Link>
            <Link
              href="/profile"
              className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
            >
              Perfil
            </Link>
            <span className="text-zinc-400 dark:text-zinc-500">
              {user?.nombreUsuario}
            </span>
            <button
              onClick={logout}
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-200 dark:text-zinc-900 dark:hover:bg-emerald-300"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-200 dark:text-zinc-900 dark:hover:bg-emerald-300"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
