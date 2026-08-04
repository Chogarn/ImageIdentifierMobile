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

export default function PlantsPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  const [plants, setPlants] = useState<Identification[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const fetchPlants = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/identification/history?tipo=planta`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlants(data);
    } catch {
      setPlants([]);
    } finally {
      setLoadingPlants(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPlants();
    }
  }, [isAuthenticated, token, fetchPlants]);

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
        Mis Plantas
      </h1>

      <div className="w-full max-w-2xl grid gap-4 sm:grid-cols-2">
        {loadingPlants ? (
          <p className="col-span-full text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando identificaciones...
          </p>
        ) : plants.length === 0 ? (
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
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aún no tienes identificaciones de plantas.
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Usa la cámara para identificar tu primera planta.
            </p>
          </div>
        ) : (
          plants.map((plant) => (
            <div
              key={plant.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-emerald-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {plant.nombreComun}
              </h2>
              <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                {plant.nombreCientifico}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {plant.descripcion}
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                Familia: {plant.familia} · Confianza: {plant.nivelConfianza}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}