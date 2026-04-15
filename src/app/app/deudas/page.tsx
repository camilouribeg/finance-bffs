"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Deuda = { id: string; nombre: string; tipo: string; cuota_mensual: number; total_pendiente: number };

const TIPO_EMOJIS: Record<string, string> = {
  "Tarjeta de crédito": "💳",
  "Préstamo personal": "🏦",
  "Crédito hipotecario": "🏠",
  "Crédito de vehículo": "🚗",
  "Deuda familiar": "👨‍👩‍👧",
  "Otro": "📄",
};

const METHOD_LABELS: Record<string, { emoji: string; nombre: string; desc: string }> = {
  snowball: { emoji: "❄️", nombre: "Bola de nieve", desc: "Paga el mínimo en todas y enfoca el dinero extra en la deuda más pequeña. Al pagarla, ese dinero pasa a la siguiente. Genera momentum y motivación." },
  avalanche: { emoji: "🏔️", nombre: "Avalancha", desc: "Paga el mínimo en todas y enfoca el dinero extra en la deuda con mayor tasa de interés. Te ahorra más dinero a largo plazo." },
  balanced: { emoji: "⚖️", nombre: "Equilibrado", desc: "Avanza en varias deudas al mismo tiempo de forma estable. Sin enfocarte en una sola, pero sin descuidar ninguna." },
};

export default function DeudasVisualPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [debtMethod, setDebtMethod] = useState<string>("snowball");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data }, { data: profile }] = await Promise.all([
        supabase.from("deudas").select("*").eq("user_id", user.id).order("total_pendiente", { ascending: false }),
        supabase.from("profiles").select("debt_method").eq("id", user.id).single(),
      ]);
      if (data) setDeudas(data);
      if (profile?.debt_method) setDebtMethod(profile.debt_method);
      setLoading(false);
    }
    load();
  }, []);

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalPendiente = deudas.reduce((s, d) => s + d.total_pendiente, 0);
  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const maxPendiente = deudas[0]?.total_pendiente || 1;

  const method = METHOD_LABELS[debtMethod] || METHOD_LABELS.snowball;
  const sortedByMethod = [...deudas].sort((a, b) => {
    if (debtMethod === "snowball") return a.total_pendiente - b.total_pendiente;
    if (debtMethod === "avalanche") return b.total_pendiente - a.total_pendiente; // approximate; tasa not always available
    return 0; // balanced
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Mis deudas 💳
        </h1>
        <p className="text-[#1a1a2e]/50 text-sm mt-1">Tu camino para quedar libre de deudas</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : deudas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ffb8e0]">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-bold text-[#1a1a2e]">¡Sin deudas registradas!</p>
          <p className="text-sm text-[#1a1a2e]/50 mt-2">Agrega tus deudas desde el Dashboard</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Deuda total</p>
              <p className="text-xl font-bold text-[#ec7fa9]">{fmt(totalPendiente)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Cuotas/mes</p>
              <p className="text-xl font-bold text-[#1a1a2e]">{fmt(totalCuotas)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Deudas activas</p>
              <p className="text-xl font-bold text-[#1a1a2e]">{deudas.filter((d) => d.total_pendiente > 0).length}</p>
            </div>
          </div>

          {/* Debt bars */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <h2 className="font-semibold text-[#1a1a2e] mb-5">Resumen de deudas</h2>
            <div className="flex flex-col gap-5">
              {deudas.map((d) => {
                const meses = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : null;
                const done = d.total_pendiente === 0;
                return (
                  <div key={d.id}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{TIPO_EMOJIS[d.tipo] || "📄"}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">{d.nombre}</p>
                          <p className="text-xs text-[#1a1a2e]/40">{d.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {done ? (
                          <p className="text-sm font-bold text-green-600">✓ Pagada</p>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</p>
                            <p className="text-xs text-[#1a1a2e]/40">{fmt(d.cuota_mensual)}/mes · {meses} meses</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-green-400" : "bg-[#ec7fa9]"}`}
                        style={{ width: `${(d.total_pendiente / maxPendiente) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy based on user's debt method */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <h2 className="font-semibold text-[#1a1a2e] mb-1">{method.emoji} Estrategia: {method.nombre}</h2>
            <p className="text-xs text-[#1a1a2e]/50 mb-5">{method.desc}</p>
            <div className="flex flex-col gap-3">
              {sortedByMethod.filter((d) => d.total_pendiente > 0).map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? "bg-[#ec7fa9] text-white" : "bg-[#ffedfa] text-[#ec7fa9]"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {TIPO_EMOJIS[d.tipo] || "📄"} {d.nombre}
                      {i === 0 && debtMethod !== "balanced" && <span className="ml-2 text-xs text-[#ec7fa9] font-semibold">← empieza aquí</span>}
                    </p>
                    <p className="text-sm font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#ec7fa9] rounded-2xl p-5 text-white">
              <p className="font-bold mb-2">💡 El mínimo no es suficiente</p>
              <p className="text-sm text-white/80 leading-relaxed">
                Pagar solo el mínimo de una tarjeta puede hacer que esa deuda dure años más y que pagues el doble en intereses. Si puedes, siempre paga más del mínimo.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="font-bold text-[#1a1a2e] mb-2">🎯 Una deuda a la vez</p>
              <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">
                Intentar pagar todas a la vez genera sensación de no avanzar. Concentrarte en una sola deuda y celebrar cuando la terminas genera motivación real.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="font-bold text-[#1a1a2e] mb-2">🚫 No más deuda nueva</p>
              <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">
                Mientras pagas deudas, evita crear deuda nueva. Cada peso nuevo que debes es un paso hacia atrás en tu progreso.
              </p>
            </div>
            <div className="bg-[#ffedfa] rounded-2xl border border-[#ffb8e0] p-5">
              <p className="font-bold text-[#1a1a2e] mb-2">✨ Celebra cada logro</p>
              <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">
                Cada deuda que pagas es una victoria enorme. Date el crédito — literalmente estás recuperando tu libertad financiera.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
