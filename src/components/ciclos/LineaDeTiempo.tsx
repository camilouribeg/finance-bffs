"use client";

import { useState } from "react";
import { useFmt } from "@/lib/useFmt";
import type { Evento } from "@/lib/ciclos";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const VISIBLES = 6;

// Linea de tiempo de proximos ingresos y obligaciones (roadmap 5.12).
// Usa los mismos eventos que el plan, sin segunda captura. Una linea punteada marca
// cada ingreso: lo que queda entre dos lineas es un periodo entre ingresos.
export default function LineaDeTiempo({ eventos }: { eventos: Evento[] }) {
  const fmt = useFmt();
  const [verTodo, setVerTodo] = useState(false);
  if (eventos.length === 0) return null;

  const lista = verTodo ? eventos : eventos.slice(0, VISIBLES);
  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
      <p className="font-semibold text-[#1a1a2e] mb-1">Lo que viene en orden</p>
      <p className="text-xs text-[#1a1a2e]/60 mb-3">Tus próximos ingresos y pagos, uno detrás de otro.</p>
      <ul>
        {lista.map((e, i) => {
          const entra = e.tipo === "ingreso";
          return (
            <li key={`${e.fecha.getTime()}-${e.nombre}-${i}`}
              className={`flex items-center gap-3 py-2 ${entra && i > 0 ? "border-t border-dashed border-[#ffb8e0]" : ""}`}>
              <span className="w-14 text-xs font-semibold text-[#1a1a2e]/60 flex-shrink-0">
                {e.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
              </span>
              {entra
                ? <ArrowDownCircle size={16} className="text-green-600 flex-shrink-0" aria-label="Entra" />
                : <ArrowUpCircle size={16} className="text-[#ec7fa9] flex-shrink-0" aria-label="Sale" />}
              <span className="flex-1 text-sm text-[#1a1a2e]">{e.nombre}</span>
              <span className={`text-sm font-semibold ${entra ? "text-green-600" : "text-[#1a1a2e]"}`}>
                {entra ? "+" : "-"}{fmt(e.monto)}
              </span>
            </li>
          );
        })}
      </ul>
      {eventos.length > VISIBLES && (
        <button onClick={() => setVerTodo(!verTodo)} className="mt-2 text-xs text-[#ec7fa9] font-semibold hover:underline">
          {verTodo ? "Ver menos" : `Ver los ${eventos.length - VISIBLES} siguientes`}
        </button>
      )}
    </div>
  );
}
