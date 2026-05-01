"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "true";

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "No fue posible iniciar el pago.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar el pago.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto pt-8">
      {expired && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 mb-6 text-center">
          <p className="text-sm font-semibold text-orange-600">Tu periodo de prueba de 40 días ha terminado</p>
          <p className="text-xs text-orange-500 mt-1">Activa tu plan para seguir usando Finance BFFs</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#ffb8e0] p-8 text-center shadow-xl">
        <p className="text-5xl mb-4">💕</p>
        <h1
          className="text-2xl font-bold text-[#1a1a2e] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Activa tu suscripción
        </h1>
        <p className="text-[#1a1a2e]/60 text-sm mb-8">
          Accede a todas las herramientas de Finance BFFs y toma el control de tu dinero.
        </p>

        <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-6 mb-6 text-left">
          <p className="text-xs text-[#ec7fa9] font-semibold uppercase tracking-wide mb-3">Incluye</p>
          {[
            "📋 Dashboard mensual con cálculos automáticos",
            "📅 Tracking de gastos diario por categoría",
            "🐷 Bolsillos de ahorro personalizados",
            "💳 Control de deudas y cuotas",
            "📐 Método 60/30/10 automático",
            "✅ Checklist mensual de finanzas",
          ].map((item) => (
            <p key={item} className="text-sm text-[#1a1a2e]/80 py-1.5 border-b border-[#ffb8e0] last:border-0">
              {item}
            </p>
          ))}
        </div>

        <div className="mb-6 bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-2xl px-5 py-4">
          <p className="text-xs text-[#ec7fa9] font-bold uppercase tracking-wider mb-1">Precio de preventa</p>
          <p className="text-4xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>
            $24.900<span className="text-lg text-[#1a1a2e]/50 font-normal"> COP/mes</span>
          </p>
          <p className="text-xs text-[#1a1a2e]/40 mt-1">Este precio se mantiene para siempre · Cancela cuando quieras</p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-pink-200"
        >
          {loading ? "Redirigiendo..." : "Activar mi cuenta 💕"}
        </button>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
            {error}
          </p>
        )}

        <p className="text-xs text-[#1a1a2e]/40 mt-4">
          Pago seguro con Stripe. Sin sorpresas.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
