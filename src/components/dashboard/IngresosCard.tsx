"use client";

import { useState } from "react";
import { TrendingUp, Pencil } from "lucide-react";

export type LineItem = { id: string; descripcion: string; valor: number };

// Tarjeta de ingresos con edicion inline. Vive aca (en vez de duplicarse) para que
// "Mis finanzas" (app/page.tsx) y "Ingresos" (app/ingresos/page.tsx, roadmap 4.10)
// nunca puedan divergir en como se editan los ingresos.
export default function IngresosCard({
  ingresoFijo,
  setIngresoFijo,
  ingresosOtros,
  setIngresosOtros,
  editing,
  onToggleEdit,
  saving,
  fmt,
}: {
  ingresoFijo: string;
  setIngresoFijo: (v: string) => void;
  ingresosOtros: LineItem[];
  setIngresosOtros: (v: LineItem[]) => void;
  editing: boolean;
  onToggleEdit: () => void;
  saving: boolean;
  fmt: (n: number) => string;
}) {
  const [nuevoIngNombre, setNuevoIngNombre] = useState("");
  const [nuevoIngValor, setNuevoIngValor] = useState("");
  const totalIngresos = (parseFloat(ingresoFijo) || 0) + ingresosOtros.reduce((s, i) => s + i.valor, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><TrendingUp size={18} className="text-[#ec7fa9]" />Ingresos del mes</h2>
        <button onClick={onToggleEdit}
          className="flex items-center gap-1.5 text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
          <Pencil size={11} />{editing ? (saving ? "Guardando..." : "Guardar") : "Editar"}
        </button>
      </div>
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#1a1a2e]/60 mb-1.5 block">Ingreso fijo (salario)</label>
            <input type="number" value={ingresoFijo} onChange={(e) => setIngresoFijo(e.target.value)}
              className="w-full md:w-64 border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 text-right" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1a1a2e]/60 mb-1.5 block">Otros ingresos</label>
            {ingresosOtros.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-1.5 border-b border-[#ffb8e0]/50 last:border-0">
                <span className="text-sm text-[#1a1a2e]/70">{i.descripcion}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{fmt(i.valor)}</span>
                  <button onClick={() => setIngresosOtros(ingresosOtros.filter(x => x.id !== i.id))} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={nuevoIngNombre} onChange={e => setNuevoIngNombre(e.target.value)} placeholder="Ej: Freelance"
                className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none" />
              <input type="number" value={nuevoIngValor} onChange={e => setNuevoIngValor(e.target.value)} placeholder="0"
                className="w-28 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none text-right" />
              <button onClick={() => { if (!nuevoIngNombre || !nuevoIngValor) return; setIngresosOtros([...ingresosOtros, { id: crypto.randomUUID(), descripcion: nuevoIngNombre, valor: parseFloat(nuevoIngValor) }]); setNuevoIngNombre(""); setNuevoIngValor(""); }}
                className="bg-[#ec7fa9] text-white px-3 py-2 rounded-xl font-semibold hover:bg-[#d96d97]">+</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-[#ffb8e0]/40">
            <span className="text-sm text-[#1a1a2e]/60">Ingreso fijo (salario)</span>
            <span className="text-sm font-semibold text-[#1a1a2e]">{fmt(parseFloat(ingresoFijo) || 0)}</span>
          </div>
          {ingresosOtros.map(i => (
            <div key={i.id} className="flex justify-between items-center py-2 border-b border-[#ffb8e0]/40 last:border-0">
              <span className="text-sm text-[#1a1a2e]/60">{i.descripcion}</span>
              <span className="text-sm font-semibold text-[#1a1a2e]">{fmt(i.valor)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-[#ffb8e0] flex justify-between">
        <span className="text-sm font-semibold text-[#1a1a2e]/60">Total ingresos</span>
        <span className="text-lg font-bold text-green-600">{fmt(totalIngresos)}</span>
      </div>
    </div>
  );
}
