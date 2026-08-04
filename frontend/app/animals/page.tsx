"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Identification {
  id: string;
  tipo: string;
  nombreComun: string;
  nombreCientifico: string;
  familia: string;
  descripcion: string;
  nivelConfianza: string;
  createdAt: string;
}

export default function AnimalsPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  const [animals, setAnimals] = useState<Identification[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const fetchAnimals = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/identification/history?tipo=animal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnimals(data);
    } catch {
      setAnimals([]);
    } finally {
      setLoadingAnimals(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAnimals();
    }
  }, [isAuthenticated, token, fetchAnimals]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 gap-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Mis Animales
      </h1>

      <div className="w-full max-w-2xl grid gap-4 sm:grid-cols-2">
        {loadingAnimals ? (
          <p className="col-span-full text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando identificaciones...
          </p>
        ) : animals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <svg
              className="mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aún no tienes identificaciones de animales.
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Usa la cámara para identificar tu primer animal.
            </p>
          </div>
        ) : (
          animals.map((animal) => (
            <div
              key={animal.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-emerald-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {animal.nombreComun}
              </h2>
              <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                {animal.nombreCientifico}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {animal.descripcion}
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                Familia: {animal.familia} · Confianza: {animal.nivelConfianza}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
