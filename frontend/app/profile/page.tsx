"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 gap-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Mi Perfil
      </h1>

      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Nombre</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{user.nombre}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Apellido</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{user.apellido}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Nombre de usuario</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{user.nombreUsuario}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Email</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{user.email}</p>
          </div>
          {user.telefono && (
            <div>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Teléfono</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-50">{user.telefono}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
