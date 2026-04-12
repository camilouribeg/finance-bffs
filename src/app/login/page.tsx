"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <div className="min-h-screen bg-[#ffedfa] flex items-center justify-center px-4">
      {/* Background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb8e0] opacity-40 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb8e0] opacity-30 blob pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
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
            Bienvenida de nuevo 👋
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mb-8">
            Entra a tu cuenta para continuar
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                placeholder="••••••••"
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
              {loading ? "Entrando..." : "Entrar a mi cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-[#1a1a2e]/50 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[#ec7fa9] font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
