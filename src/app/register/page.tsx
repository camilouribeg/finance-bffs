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

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError("Hubo un error al registrarte. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // After register → go to checkout to activate subscription
    router.push("/app/checkout");
  }

  return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffd6e0] opacity-40 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb6c9] opacity-30 blob pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span
              className="text-3xl font-bold text-[#ff2d78]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Finance BFFs 💕
            </span>
          </Link>
          <p className="text-[#1a1a2e]/50 text-sm mt-2">Tu mejor amiga en las finanzas</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#ffd6e0] p-8">
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
                className="w-full border border-[#ffd6e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff2d78]/30 focus:border-[#ff2d78] transition-all bg-[#fff8f9]"
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
                className="w-full border border-[#ffd6e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff2d78]/30 focus:border-[#ff2d78] transition-all bg-[#fff8f9]"
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
                className="w-full border border-[#ffd6e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff2d78]/30 focus:border-[#ff2d78] transition-all bg-[#fff8f9]"
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
              className="w-full bg-[#ff2d78] hover:bg-[#e0255f] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta →"}
            </button>
          </form>

          {/* Presale badge */}
          <div className="mt-6 bg-[#fff0f3] border border-[#ffd6e0] rounded-2xl p-4 text-center">
            <p className="text-xs text-[#ff2d78] font-semibold">🎉 PRECIO DE PREVENTA</p>
            <p className="text-[#1a1a2e]/70 text-sm mt-1">
              Primer mes gratis, luego solo <strong>$X/mes</strong>
            </p>
          </div>

          <p className="text-center text-sm text-[#1a1a2e]/50 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#ff2d78] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
