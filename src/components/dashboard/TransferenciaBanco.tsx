"use client";

import { Check, Landmark } from "lucide-react";
import { useFmt } from "@/lib/useFmt";
import type { FilaTransferencia, ResumenTransferencia } from "@/lib/transferencia";

// Bloque "esto lo haces tu en tu banco" (roadmap 3.7), compartido por Cajitas y Bolsitas.
// Separa dos ideas: Amy reserva en el presupuesto; la usuaria mueve el dinero real.
export default function TransferenciaBanco({
  singular,
  filas,
  resumen,
  ocupado,
  error,
  onToggle,
}: {
  singular: "cajita" | "bolsita";
  filas: FilaTransferencia[];
  resumen: ResumenTransferencia;
  ocupado: boolean;
  error: string | null;
  // Opcional: en Cajitas y Bolsitas la transferencia se marca por item (4.2), asi que este
  // bloque solo explica la accion del banco. Sin onToggle no se muestra el boton global.
  onToggle?: () => void;
}) {
  const fmt = useFmt();
  if (!resumen.hay) return null;

  return (
    <div className="bg-white border border-[#ffb8e0] rounded-2xl p-5 mb-6">
      <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Landmark size={12} /> Esto lo haces tú en tu banco
      </p>
      <p className="text-sm text-[#1a1a2e]/70 leading-relaxed mb-3">
        Amy reserva este dinero en tu presupuesto, pero no mueve nada en tu banco. Este mes separa{" "}
        <span className="font-bold text-[#ec7fa9]">{fmt(resumen.total)}</span> y repártelo así:
      </p>
      <ul className="space-y-1.5 mb-4">
        {filas.map(f => (
          <li key={f.id} className="flex items-center justify-between gap-3 text-sm bg-[#ffedfa] rounded-xl px-4 py-2">
            <span className="text-[#1a1a2e]/80">
              {f.emoji} <span className="font-medium">{singular === "cajita" ? "Cajita de" : "Bolsita de"} {f.nombre}</span>
            </span>
            <span className="font-semibold text-[#1a1a2e] flex items-center gap-1.5">
              {f.confirmada && <Check size={13} className="text-green-600" strokeWidth={3} />}
              {fmt(f.monto)}
            </span>
          </li>
        ))}
      </ul>
      {onToggle && (
        <button
          onClick={onToggle}
          disabled={ocupado}
          aria-pressed={resumen.completa}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 ${
            resumen.completa
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-[#ffb8e0] text-[#1a1a2e]/70 hover:bg-[#ffedfa]"
          }`}
        >
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            resumen.completa ? "bg-green-500 border-green-500" : "border-[#ffb8e0]"
          }`}>
            {resumen.completa && <Check size={12} className="text-white" strokeWidth={3} />}
          </span>
          {resumen.completa ? "¡Listo! Registraste tu transferencia de este mes" : "Ya separé este dinero en mi banco"}
        </button>
      )}
      {error && <p className="text-xs text-[#1a1a2e]/60 mt-2">{error}</p>}
    </div>
  );
}
