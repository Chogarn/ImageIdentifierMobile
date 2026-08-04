"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 gap-6">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        ImageIdentifier
      </h1>
      <p className="text-lg text-zinc-500 dark:text-zinc-400">
        No estás registrado.{" "}
        <Link href="/register" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
          Regístrate
        </Link>{" "}
        o{" "}
        <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
          inicia sesión
        </Link>
      </p>
    </div>
  );
}
