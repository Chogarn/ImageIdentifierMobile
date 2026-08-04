"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Camera from "@/app/components/Camera";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface IdentificationResult {
  id: string;
  tipo: string;
  nombreComun: string;
  nombreCientifico: string;
  familia: string;
  descripcion: string;
  nivelConfianza: string;
}

export default function CameraPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64Data] = dataUrl.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };

  const handleCapture = async (imageData: string) => {
    if (!token) return;

    setIdentifying(true);
    setError(null);
    setResult(null);

    try {
      const blob = dataUrlToBlob(imageData);
      const formData = new FormData();
      formData.append("image", blob, "captura.jpg");

      const res = await fetch(`${API_URL}/identification/identify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al identificar la imagen");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIdentifying(false);
    }
  };

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
        Capturar imagen
      </h1>

      <div className="w-full max-w-md">
        <Camera onCapture={handleCapture} />
      </div>

      {identifying && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Identificando imagen...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {result && (
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {result.tipo}
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {result.nombreComun}
          </h2>
          <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
            {result.nombreCientifico}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {result.descripcion}
          </p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Familia: {result.familia} · Confianza: {result.nivelConfianza}
          </p>
        </div>
      )}
    </div>
  );
}