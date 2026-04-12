"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        window.location.href = "/app";
      } else {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ffedfa] flex items-center justify-center px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb8e0] opacity-40 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb8e0] opacity-30 blob pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span
              className="text-3xl font-bold text-[#ec7fa9]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Finance BFFs 💕
            </span>
          </Link>
          <p className="text-[#1a1a2e]/50 text-sm mt-2">Tu mejor amiga en las finanzas</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#ffb8e0] p-8">
          <h1
            className="text-2xl font-bold text-[#1a1a2e] mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Crea tu cuenta ✨
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mb-8">
            Empieza a tomar control de tu dinero hoy
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="María"
                className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta →"}
            </button>
          </form>

          {/* Presale badge */}
          <div className="mt-6 bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-4 text-center">
            <p className="text-xs text-[#ec7fa9] font-semibold">🎉 PRECIO DE PREVENTA</p>
            <p className="text-[#1a1a2e]/70 text-sm mt-1">
              Primer mes gratis, luego solo <strong>$X/mes</strong>
            </p>
          </div>

          <p className="text-center text-sm text-[#1a1a2e]/50 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#ec7fa9] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
