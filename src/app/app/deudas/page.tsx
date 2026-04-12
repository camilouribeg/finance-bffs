"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Deuda = {
  id: string;
  nombre: string;
  tipo: string;
  cuota_mensual: number;
  total_pendiente: number;
};

const TIPOS = ["Tarjeta de crédito", "Préstamo personal", "Crédito hipotecario", "Crédito de vehículo", "Deuda familiar", "Otro"];

function DeudaCard({
  d, onAbonar, onRemove, fmt,
}: {
  d: Deuda;
  onAbonar: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  fmt: (n: number) => string;
}) {
  const [abonoAmt, setAbonoAmt] = useState("");
  const mesesRestantes = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-[#1a1a2e] text-lg">💳 {d.nombre}</p>
          <p className="text-xs text-[#1a1a2e]/50">{d.tipo}</p>
        </div>
        <button onClick={() => onRemove(d.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center bg-[#ffedfa] rounded-xl p-3">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Cuota mensual</p>
          <p className="font-bold text-[#ec7fa9]">{fmt(d.cuota_mensual)}</p>
        </div>
        <div className="text-center bg-[#ffedfa] rounded-xl p-3">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Pendiente</p>
          <p className="font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</p>
        </div>
        <div className="text-center bg-[#ffedfa] rounded-xl p-3">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Meses restantes</p>
          <p className="font-bold text-[#1a1a2e]">{d.total_pendiente === 0 ? "✓" : mesesRestantes}</p>
        </div>
      </div>

      {d.total_pendiente > 0 ? (
        <div className="flex gap-2">
          <input type="number" value={abonoAmt} onChange={(e) => setAbonoAmt(e.target.value)} placeholder="Registrar abono..."
            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]" />
          <button onClick={() => { onAbonar(d.id, parseFloat(abonoAmt) || 0); setAbonoAmt(""); }}
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
}

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [cuota, setCuota] = useState("");
  const [total, setTotal] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("deudas").select("*").eq("user_id", user.id).order("created_at");
      if (data) setDeudas(data);
      setLoading(false);
    }
    load();
  }, []);

  async function addDeuda(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !cuota || !total) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("deudas")
      .insert({ user_id: user.id, nombre, tipo, cuota_mensual: parseFloat(cuota), total_pendiente: parseFloat(total) })
      .select().single();
    if (data) setDeudas([...deudas, data]);
    setNombre(""); setCuota(""); setTotal(""); setShowForm(false);
  }

  async function abonar(id: string, amount: number) {
    const deuda = deudas.find((d) => d.id === id);
    if (!deuda) return;
    const newTotal = Math.max(0, deuda.total_pendiente - amount);
    const supabase = createClient();
    await supabase.from("deudas").update({ total_pendiente: newTotal }).eq("id", id);
    setDeudas(deudas.map((d) => d.id === id ? { ...d, total_pendiente: newTotal } : d));
  }

  async function removeDeuda(id: string) {
    const supabase = createClient();
    await supabase.from("deudas").delete().eq("id", id);
    setDeudas(deudas.filter((d) => d.id !== id));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const totalPendiente = deudas.reduce((s, d) => s + d.total_pendiente, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis deudas 💳
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Sabe exactamente cuánto debes y cuándo terminas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
          + Agregar deuda
        </button>
      </div>

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

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-[#1a1a2e]/30 text-sm">Cargando...</div>
        ) : deudas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#ffb8e0]">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-semibold text-[#1a1a2e]">¡Sin deudas registradas!</p>
            <p className="text-sm text-[#1a1a2e]/50 mt-1">Agrega tus deudas para llevar el control</p>
          </div>
        ) : (
          deudas.map((d) => (
            <DeudaCard key={d.id} d={d} onAbonar={abonar} onRemove={removeDeuda} fmt={fmt} />
          ))
        )}
      </div>
    </div>
  );
}
