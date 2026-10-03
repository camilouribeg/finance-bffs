"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { useFmt } from "@/lib/useFmt";
import type { Paso } from "@/lib/proximosPasos";

// "Qué hacer ahora" (roadmap 3.6): pocas acciones priorizadas arriba de Mis finanzas.
export default function PlanConAmy({ pendientes, hechos }: { pendientes: Paso[]; hechos: Paso[] }) {
  const fmt = useFmt();
  const [verHechos, setVerHechos] = useState(false);

  return (
    <section className="bg-white border border-[#ffb8e0] rounded-2xl p-5 mb-6" aria-label="Qué hacer ahora">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[#ec7fa9]" />
        <h2 className="text-lg font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Qué hacer ahora
        </h2>
      </div>

      {pendientes.length === 0 ? (
        <p className="text-sm text-[#1a1a2e]/70 bg-[#ffedfa] rounded-xl px-4 py-3">
          Estás al día por ahora. Amy te avisa cuando toque el siguiente paso 💗
        </p>
      ) : (
        <ul className="space-y-2">
          {pendientes.map(p => (
            <li key={p.id}>
              <Link href={p.href}
                className="flex items-center gap-3 bg-[#ffedfa] hover:bg-[#ffb8e0]/40 rounded-xl px-4 py-3 transition-colors group">
                <span className="w-5 h-5 rounded-full border-2 border-[#ec7fa9] flex-shrink-0" aria-hidden />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#1a1a2e]">
                    {p.titulo}{p.monto ? <span className="text-[#ec7fa9]"> · {fmt(p.monto)}</span> : null}
                  </span>
                  <span className="block text-xs text-[#1a1a2e]/60 mt-0.5">{p.detalle}</span>
                </span>
                <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#ec7fa9] whitespace-nowrap">
                  {p.cta} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hechos.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setVerHechos(!verHechos)}
            className="flex items-center gap-1.5 text-xs text-[#1a1a2e]/50 hover:text-[#ec7fa9] transition-colors">
            <ChevronDown size={13} className={`transition-transform ${verHechos ? "rotate-180" : ""}`} />
            {hechos.length} {hechos.length === 1 ? "completada" : "completadas"}
          </button>
          {verHechos && (
            <ul className="mt-2 space-y-1.5">
              {hechos.map(p => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2 text-sm text-[#1a1a2e]/50">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </span>
                  {p.titulo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
