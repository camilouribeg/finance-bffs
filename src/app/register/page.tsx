"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const COUNTRY_CODES = [
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+52", flag: "🇲🇽", name: "México" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+51", flag: "🇵🇪", name: "Perú" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+34", flag: "🇪🇸", name: "España" },
  { code: "+44", flag: "🇬🇧", name: "Reino Unido" },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dialCode, setDialCode] = useState("+57");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: firstName,
            last_name: lastName,
            phone: phone ? `${dialCode} ${phone}` : "",
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        if (data.session) {
          // Email confirmation disabled — session active
          window.location.href = "/onboarding";
        } else {
          // Email confirmation required
          setStep(3);
          setLoading(false);
        }
      } else {
        setError("Algo salió mal. Intenta de nuevo.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ffedfa] flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb8e0] opacity-40 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb8e0] opacity-30 blob pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>
              Finly
            </span>
            <span className="text-xs text-[#1a1a2e]/40 font-medium ml-2">by Finance BFFs 💕</span>
          </Link>
          <p className="text-[#1a1a2e]/50 text-sm mt-2">Tu mejor amiga en las finanzas</p>
          <p className="text-[#ec7fa9] text-xs font-medium mt-1">✓ Registro 100% gratis · Sin tarjeta de crédito</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#ffb8e0] overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-[#ffb8e0]">
            <div
              className="h-full bg-[#ec7fa9] transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          <div className="p-8">

            {/* ── STEP 3: Check email ── */}
            {step === 3 && (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📩</div>
                <h1 className="text-2xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                  Revisa tu correo
                </h1>
                <p className="text-[#1a1a2e]/60 text-sm leading-relaxed mb-1">
                  Te enviamos un enlace de confirmación a
                </p>
                <p className="font-semibold text-[#ec7fa9] text-sm mb-5">{email}</p>
                <p className="text-[#1a1a2e]/50 text-xs leading-relaxed mb-6">
                  Haz clic en el enlace del correo para activar tu cuenta y empezar a usar Finly. Si no lo ves, revisa tu carpeta de spam.
                </p>
                <a href="/login"
                  className="inline-block bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors">
                  Ya confirmé, iniciar sesión →
                </a>
              </div>
            )}

            {/* ── STEPS 1 & 2 ── */}
            {step !== 3 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                      {step === 1 ? "Cuéntanos de ti ✨" : "Crea tu acceso 🔐"}
                    </h1>
                    <p className="text-[#1a1a2e]/50 text-sm mt-1">
                      {step === 1 ? "Paso 1 de 2 — tus datos" : "Paso 2 de 2 — tu cuenta"}
                    </p>
                  </div>
                </div>

                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setError(""); setStep(2); } : handleRegister} className="flex flex-col gap-4">
                  {step === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">Nombre</label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="María"
                            className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">Apellido</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="García"
                            className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">
                          Teléfono <span className="text-[#1a1a2e]/30 font-normal">(opcional)</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={dialCode}
                            onChange={(e) => setDialCode(e.target.value)}
                            className="border border-[#ffb8e0] rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa] w-32 flex-shrink-0"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="300 000 0000"
                            className="flex-1 border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!firstName}
                        className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
                      >
                        Continuar →
                      </button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">Correo electrónico</label>
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
                        <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">Contraseña</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all bg-[#ffedfa]"
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          {error}
                        </p>
                      )}

                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl transition-colors hover:bg-[#ffedfa] text-sm"
                        >
                          ← Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
                        >
                          {loading ? "Creando cuenta..." : "Crear mi cuenta →"}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <div className="mt-6 bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-4 text-center">
                  <p className="text-xs text-[#ec7fa9] font-semibold">🎉 PRECIO DE PREVENTA ACTIVO</p>
                  <p className="text-[#1a1a2e]/70 text-sm mt-1">
                    Precio bloqueado para siempre al unirte hoy
                  </p>
                </div>

                <p className="text-center text-sm text-[#1a1a2e]/50 mt-4">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-[#ec7fa9] font-medium hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
