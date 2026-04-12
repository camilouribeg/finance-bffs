"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Bolsillo = { id: string; nombre: string; meta: number; actual: number; emoji: string };

const TIPS = [
  { icon: "🐷", title: "El método de los sobres", desc: "Asigna un monto fijo a cada bolsillo al inicio del mes, antes de gastar en cualquier otra cosa. El ahorro primero, no lo que sobra." },
  { icon: "📈", title: "Automatiza tu ahorro", desc: "Si puedes, configura una transferencia automática el día que te pagan. Lo que no ves, no lo gastas." },
  { icon: "🎯", title: "Metas con fecha", desc: "Un bolsillo con fecha límite genera más motivación. '¿Cuánto necesito ahorrar por mes para llegar a mi meta?' — Finly te ayuda a calcularlo." },
  { icon: "💡", title: "El poder del ahorro pequeño", desc: "Ahorrar $20.000 al día son $600.000 al mes y $7.2M al año. Los montos pequeños y constantes construyen grandes metas." },
];

export default function AhorroVisualPage() {
  const [bolsillos, setBolsillos] = useState<Bolsillo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("bolsillos").select("*").eq("user_id", user.id).order("created_at");
      if (data) setBolsillos(data);
      setLoading(false);
    }
    load();
  }, []);

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalMeta = bolsillos.reduce((s, b) => s + b.meta, 0);
  const totalActual = bolsillos.reduce((s, b) => s + b.actual, 0);
  const totalPct = totalMeta > 0 ? Math.min((totalActual / totalMeta) * 100, 100) : 0;
  const completadas = bolsillos.filter((b) => b.actual >= b.meta).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Mis ahorros 🐷
        </h1>
        <p className="text-[#1a1a2e]/50 text-sm mt-1">Tu progreso hacia cada meta</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="grid grid-cols-3 gap-6 mb-5">
              <div>
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Total ahorrado</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalActual)}</p>
              </div>
              <div>
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Meta total</p>
                <p className="text-2xl font-bold text-[#1a1a2e]">{fmt(totalMeta)}</p>
              </div>
              <div>
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Metas logradas</p>
                <p className="text-2xl font-bold text-[#ec7fa9]">{completadas}/{bolsillos.length}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#1a1a2e]/60">Progreso general</span>
                <span className="font-semibold text-[#ec7fa9]">{totalPct.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-[#ffb8e0] rounded-full overflow-hidden">
                <div className="h-full bg-[#ec7fa9] rounded-full transition-all duration-700"
                  style={{ width: `${totalPct}%` }} />
              </div>
            </div>
          </div>

          {/* Bolsillos grid */}
          {bolsillos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#ffb8e0]">
              <p className="text-4xl mb-3">🐷</p>
              <p className="font-semibold text-[#1a1a2e]">Aún no tienes bolsillos</p>
              <p className="text-sm text-[#1a1a2e]/50 mt-1">Créalos desde el Dashboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bolsillos.map((b) => {
                const pct = Math.min((b.actual / b.meta) * 100, 100);
                const falta = Math.max(b.meta - b.actual, 0);
                const done = b.actual >= b.meta;
                return (
                  <div key={b.id} className={`rounded-2xl p-6 border ${done ? "bg-green-50 border-green-200" : "bg-white border-[#ffb8e0]"}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{b.emoji}</span>
                      <div>
                        <p className="font-semibold text-[#1a1a2e]">{b.nombre}</p>
                        <p className="text-xs text-[#1a1a2e]/50">Meta: {fmt(b.meta)}</p>
                      </div>
                      {done && <span className="ml-auto text-green-600 text-lg">✓</span>}
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#1a1a2e]/60">{fmt(b.actual)} ahorrado</span>
                        <span className={`font-semibold ${done ? "text-green-600" : "text-[#ec7fa9]"}`}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${done ? "bg-green-200" : "bg-[#ffb8e0]"}`}>
                        <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-green-500" : "bg-[#ec7fa9]"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {done ? (
                      <p className="text-sm font-semibold text-green-600 text-center mt-3">🎉 ¡Meta alcanzada!</p>
                    ) : (
                      <p className="text-xs text-[#1a1a2e]/50 text-right">Faltan {fmt(falta)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips */}
          <div>
            <h2 className="font-semibold text-[#1a1a2e] mb-4">Tips de ahorro 💡</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIPS.map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
                  <p className="font-semibold text-[#1a1a2e] mb-2">{tip.icon} {tip.title}</p>
                  <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
