"use client";

import { useState } from "react";

type Deuda = {
  id: string;
  nombre: string;
  tipo: string;
  cuotaMensual: number;
  totalPendiente: number;
};

const TIPOS = ["Tarjeta de crédito", "Préstamo personal", "Crédito hipotecario", "Crédito de vehículo", "Deuda familiar", "Otro"];

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([
    { id: "1", nombre: "Tarjeta Visa", tipo: "Tarjeta de crédito", cuotaMensual: 200000, totalPendiente: 1500000 },
  ]);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [cuota, setCuota] = useState("");
  const [total, setTotal] = useState("");
  const [showForm, setShowForm] = useState(false);

  function addDeuda(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !cuota || !total) return;
    setDeudas([
      ...deudas,
      { id: crypto.randomUUID(), nombre, tipo, cuotaMensual: parseFloat(cuota), totalPendiente: parseFloat(total) },
    ]);
    setNombre(""); setCuota(""); setTotal(""); setShowForm(false);
  }

  function abonar(id: string, amount: number) {
    setDeudas(deudas.map((d) =>
      d.id === id ? { ...d, totalPendiente: Math.max(0, d.totalPendiente - amount) } : d
    ));
  }

  function removeDeuda(id: string) {
    setDeudas(deudas.filter((d) => d.id !== id));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalCuotas = deudas.reduce((s, d) => s + d.cuotaMensual, 0);
  const totalPendiente = deudas.reduce((s, d) => s + d.totalPendiente, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis deudas 💳
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Sabe exactamente cuánto debes y cuándo terminas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          + Agregar deuda
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Cuotas mensuales totales</p>
          <p className="text-2xl font-bold text-[#ec7fa9]">{fmt(totalCuotas)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Deuda total pendiente</p>
          <p className="text-2xl font-bold text-[#1a1a2e]">{fmt(totalPendiente)}</p>
        </div>
      </div>

      {/* New deuda form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Registrar deuda</h2>
          <form onSubmit={addDeuda} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Tarjeta Visa"
                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
            </div>
            <div>
              <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]">
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Cuota mensual</label>
              <input type="number" value={cuota} onChange={(e) => setCuota(e.target.value)} placeholder="0"
                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
            </div>
            <div>
              <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Total pendiente</label>
              <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0"
                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm">
                Registrar deuda
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deudas list */}
      <div className="flex flex-col gap-4">
        {deudas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#ffb8e0]">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-semibold text-[#1a1a2e]">¡Sin deudas registradas!</p>
            <p className="text-sm text-[#1a1a2e]/50 mt-1">Agrega tus deudas para llevar el control</p>
          </div>
        )}
        {deudas.map((d) => {
          const pct = 100; // percentage paid — could be calculated with original amount
          const [abonoAmt, setAbonoAmt] = useState("");
          const mesesRestantes = d.cuotaMensual > 0 ? Math.ceil(d.totalPendiente / d.cuotaMensual) : 0;

          return (
            <div key={d.id} className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-lg">💳 {d.nombre}</p>
                  <p className="text-xs text-[#1a1a2e]/50">{d.tipo}</p>
                </div>
                <button onClick={() => removeDeuda(d.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center bg-[#ffedfa] rounded-xl p-3">
                  <p className="text-xs text-[#1a1a2e]/50 mb-1">Cuota mensual</p>
                  <p className="font-bold text-[#ec7fa9]">{fmt(d.cuotaMensual)}</p>
                </div>
                <div className="text-center bg-[#ffedfa] rounded-xl p-3">
                  <p className="text-xs text-[#1a1a2e]/50 mb-1">Pendiente</p>
                  <p className="font-bold text-[#1a1a2e]">{fmt(d.totalPendiente)}</p>
                </div>
                <div className="text-center bg-[#ffedfa] rounded-xl p-3">
                  <p className="text-xs text-[#1a1a2e]/50 mb-1">Meses restantes</p>
                  <p className="font-bold text-[#1a1a2e]">{d.totalPendiente === 0 ? "✓" : mesesRestantes}</p>
                </div>
              </div>

              {d.totalPendiente > 0 ? (
                <div className="flex gap-2">
                  <input type="number" value={abonoAmt} onChange={(e) => setAbonoAmt(e.target.value)} placeholder="Registrar abono..."
                    className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]" />
                  <button onClick={() => { abonar(d.id, parseFloat(abonoAmt) || 0); setAbonoAmt(""); }}
                    className="bg-[#ec7fa9] text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-[#d96d97]">
                    Abonar
                  </button>
                </div>
              ) : (
                <div className="text-center bg-green-50 border border-green-200 rounded-xl py-2">
                  <p className="text-sm font-semibold text-green-600">🎉 ¡Deuda pagada!</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
