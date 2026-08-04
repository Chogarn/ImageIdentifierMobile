"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface CameraProps {
  onCapture?: (imageData: string) => void;
}

export default function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setReady(true);
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCaptured(dataUrl);
    stopStream();
    onCapture?.(dataUrl);
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!ready && !error && !captured && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Iniciando cámara...</p>
      )}

      {!captured && !error && (
        <>
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-black dark:border-zinc-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
            />
          </div>
          <button
            onClick={capture}
            disabled={!ready}
            className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-200 dark:text-zinc-900 dark:hover:bg-emerald-300"
          >
            Capturar
          </button>
        </>
      )}

      {captured && (
        <>
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={captured} alt="Foto capturada" className="w-full" />
          </div>
          <button
            onClick={retake}
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Volver a tomar
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
