"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto pt-8">
      <div className="bg-white rounded-3xl border border-[#ffd6e0] p-8 text-center shadow-xl">
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

        <div className="bg-[#fff0f3] border border-[#ffd6e0] rounded-2xl p-6 mb-8 text-left">
          <p className="text-xs text-[#ff2d78] font-semibold uppercase tracking-wide mb-3">Incluye</p>
          {[
            "📋 Dashboard mensual con cálculos automáticos",
            "📅 Tracking de gastos diario por categoría",
            "🐷 Bolsillos de ahorro personalizados",
            "💳 Control de deudas y cuotas",
            "📐 Método 60/30/10 automático",
            "✅ Checklist mensual de finanzas",
          ].map((item) => (
            <p key={item} className="text-sm text-[#1a1a2e]/80 py-1.5 border-b border-[#ffd6e0] last:border-0">
              {item}
            </p>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-4xl font-bold text-[#ff2d78]" style={{ fontFamily: "var(--font-playfair)" }}>
            $X<span className="text-lg text-[#1a1a2e]/50 font-normal">/mes</span>
          </p>
          <p className="text-xs text-[#1a1a2e]/40 mt-1">Cancela cuando quieras</p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-[#ff2d78] hover:bg-[#e0255f] disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-pink-200"
        >
          {loading ? "Redirigiendo..." : "Activar mi cuenta 💕"}
        </button>

        <p className="text-xs text-[#1a1a2e]/40 mt-4">
          Pago seguro con Stripe. Sin sorpresas.
        </p>
      </div>
    </div>
  );
}
