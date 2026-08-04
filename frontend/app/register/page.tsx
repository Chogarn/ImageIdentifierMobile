"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    nombreUsuario: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.telefono) delete data.telefono;
      await register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8 text-zinc-900 dark:text-zinc-50">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={form.nombre}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Juan"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="apellido" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              required
              value={form.apellido}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Pérez"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefono" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="123456789"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombreUsuario" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre de usuario
            </label>
            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              required
              value={form.nombreUsuario}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="juanperez"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-200 dark:text-zinc-900 dark:hover:bg-emerald-300"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
