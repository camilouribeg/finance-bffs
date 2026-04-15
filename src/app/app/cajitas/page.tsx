"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Cajita = {
  id: string;
  nombre: string;
  monto_total: number;
  fecha_pago: string;
  emoji: string;
  actual: number;
};

const CAJITA_EMOJIS = ["📦", "🚗", "🏠", "📋", "🎓", "✈️", "🎁", "💊", "🏋️", "🌱", "⚙️", "🧴"];

const EJEMPLOS = [
  { nombre: "SOAT", emoji: "🚗" },
  { nombre: "Impuesto vehicular", emoji: "📋" },
  { nombre: "Seguro del carro", emoji: "🚗" },
  { nombre: "Revisión técnico-mecánica", emoji: "⚙️" },
  { nombre: "Matrícula escolar", emoji: "🎓" },
  { nombre: "Membresía anual", emoji: "🏋️" },
  { nombre: "Vacaciones", emoji: "✈️" },
  { nombre: "Regalos de navidad", emoji: "🎁" },
  { nombre: "Mantenimiento del hogar", emoji: "🏠" },
];

export default function CajitasPage() {
  const [cajitas, setCajitas] = useState<Cajita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [emoji, setEmoji] = useState("📦");

  const [abonarId, setAbonarId] = useState<string | null>(null);
  const [abonarMonto, setAbonarMonto] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("cajitas").select("*").eq("user_id", user.id).order("fecha_pago");
    if (data) setCajitas(data);
    setLoading(false);
  }

  function monthsUntil(fechaStr: string): number {
    const now = new Date();
    const fecha = new Date(fechaStr + "T12:00:00");
    const diff = (fecha.getFullYear() - now.getFullYear()) * 12 + (fecha.getMonth() - now.getMonth());
    return Math.max(1, diff);
  }

  function cuotaMensual(cajita: Cajita): number {
    const falta = Math.max(0, cajita.monto_total - cajita.actual);
    return Math.ceil(falta / monthsUntil(cajita.fecha_pago));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  async function addCajita(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !montoTotal || !fechaPago) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("cajitas")
      .insert({ user_id: user.id, nombre, monto_total: parseFloat(montoTotal), fecha_pago: fechaPago, emoji, actual: 0 })
      .select().single();
    if (data) setCajitas([...cajitas, data].sort((a, b) => a.fecha_pago.localeCompare(b.fecha_pago)));
    setNombre(""); setMontoTotal(""); setFechaPago(""); setEmoji("📦"); setShowForm(false);
  }

  async function abonar(id: string) {
    const cajita = cajitas.find(c => c.id === id);
    if (!cajita) return;
    const monto = parseFloat(abonarMonto);
    if (!monto) return;
    const nuevoActual = Math.min(cajita.actual + monto, cajita.monto_total);
    const supabase = createClient();
    await supabase.from("cajitas").update({ actual: nuevoActual }).eq("id", id);
    setCajitas(cajitas.map(c => c.id === id ? { ...c, actual: nuevoActual } : c));
    setAbonarId(null);
    setAbonarMonto("");
  }

  async function marcarPagada(id: string) {
    const cajita = cajitas.find(c => c.id === id);
    if (!cajita) return;
    const d = new Date(cajita.fecha_pago + "T12:00:00");
    d.setFullYear(d.getFullYear() + 1);
    const nuevaFecha = d.toISOString().split("T")[0];
    const supabase = createClient();
    await supabase.from("cajitas").update({ actual: 0, fecha_pago: nuevaFecha }).eq("id", id);
    setCajitas(cajitas.map(c => c.id === id ? { ...c, actual: 0, fecha_pago: nuevaFecha } : c));
  }

  async function removeCajita(id: string) {
    const supabase = createClient();
    await supabase.from("cajitas").delete().eq("id", id);
    setCajitas(cajitas.filter(c => c.id !== id));
  }

  const totalMensual = cajitas.reduce((s, c) => s + cuotaMensual(c), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Cajitas 📦
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Gastos grandes que no llegan cada mes — pero que puedes preparar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nueva cajita
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Nueva cajita</h2>
          <div className="mb-4">
            <p className="text-xs text-[#1a1a2e]/50 mb-2">Ejemplos frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS.map(ej => (
                <button key={ej.nombre} type="button"
                  onClick={() => { setNombre(ej.nombre); setEmoji(ej.emoji); }}
                  className="text-xs bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] px-3 py-1.5 rounded-lg hover:bg-[#ffb8e0] transition-colors">
                  {ej.emoji} {ej.nombre}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={addCajita} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Nombre</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: SOAT"
                  className="w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Emoji</label>
                <select value={emoji} onChange={(e) => setEmoji(e.target.value)}
                  className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none">
                  {CAJITA_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Monto total a pagar</label>
                <input type="number" value={montoTotal} onChange={(e) => setMontoTotal(e.target.value)}
                  placeholder="Ej: 1.200.000"
                  className="w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Fecha de pago</label>
                <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
              </div>
            </div>
            {nombre && montoTotal && fechaPago && (
              <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm">
                <span className="text-[#1a1a2e]/60">Finly reservará </span>
                <span className="font-bold text-[#ec7fa9]">
                  {fmt(Math.ceil(parseFloat(montoTotal) / Math.max(1, monthsUntil(fechaPago))))}
                </span>
                <span className="text-[#1a1a2e]/60"> por mes para esta cajita</span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-2.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                Cancelar
              </button>
              <button type="submit"
                className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Guardar cajita ✓
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : cajitas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ffb8e0]">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-semibold text-[#1a1a2e]">Aún no tienes cajitas</p>
          <p className="text-sm text-[#1a1a2e]/50 mt-1 mb-4">Agrégalas para prepararte con anticipación</p>
          <button onClick={() => setShowForm(true)}
            className="bg-[#ec7fa9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d96d97] transition-colors">
            + Crear primera cajita
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#1a1a2e]/50">Finly reserva cada mes</p>
                <p className="text-2xl font-bold text-[#ec7fa9]">{fmt(totalMensual)}<span className="text-sm font-normal text-[#1a1a2e]/40">/mes</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#1a1a2e]/50">{cajitas.length} cajita{cajitas.length !== 1 ? "s" : ""} activa{cajitas.length !== 1 ? "s" : ""}</p>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Descontado de tu dinero disponible</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {cajitas.map((cajita) => {
              const pct = cajita.monto_total > 0 ? Math.min((cajita.actual / cajita.monto_total) * 100, 100) : 0;
              const falta = Math.max(0, cajita.monto_total - cajita.actual);
              const meses = monthsUntil(cajita.fecha_pago);
              const cuota = cuotaMensual(cajita);
              const lista = falta === 0;
              const fecha = new Date(cajita.fecha_pago + "T12:00:00");
              const fechaStr = fecha.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
              return (
                <div key={cajita.id} className={`bg-white rounded-2xl border p-5 ${lista ? "border-green-200 bg-green-50" : "border-[#ffb8e0]"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cajita.emoji}</span>
                      <div>
                        <p className="font-semibold text-[#1a1a2e]">{cajita.nombre}</p>
                        <p className="text-xs text-[#1a1a2e]/40">Pago: {fechaStr} · {meses} mes{meses !== 1 ? "es" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lista ? "bg-green-100 text-green-600" : "bg-[#ffedfa] text-[#ec7fa9]"}`}>
                        {lista ? "✓ Lista" : `${fmt(cuota)}/mes`}
                      </span>
                      <button onClick={() => removeCajita(cajita.id)}
                        className="text-[#1a1a2e]/20 hover:text-red-400 text-xs ml-1">✕</button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#1a1a2e]/60">{fmt(cajita.actual)} reservado</span>
                      <span className={`font-semibold ${lista ? "text-green-600" : "text-[#ec7fa9]"}`}>{pct.toFixed(0)}% de {fmt(cajita.monto_total)}</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${lista ? "bg-green-200" : "bg-[#ffb8e0]"}`}>
                      <div className={`h-full rounded-full transition-all duration-700 ${lista ? "bg-green-500" : "bg-[#ec7fa9]"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {lista ? (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-green-600 flex-1">🎉 ¡Lista para pagar!</p>
                      <button onClick={() => marcarPagada(cajita.id)}
                        className="text-xs border border-green-300 text-green-600 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                        Ya la pagué ✓
                      </button>
                    </div>
                  ) : (
                    <div>
                      {abonarId === cajita.id ? (
                        <div className="flex gap-2">
                          <input type="number" value={abonarMonto} onChange={(e) => setAbonarMonto(e.target.value)}
                            placeholder="Monto a abonar" autoFocus
                            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none" />
                          <button onClick={() => abonar(cajita.id)}
                            className="bg-[#ec7fa9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#d96d97]">✓</button>
                          <button onClick={() => { setAbonarId(null); setAbonarMonto(""); }}
                            className="border border-[#ffb8e0] text-[#1a1a2e]/50 text-sm px-3 py-2 rounded-xl">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setAbonarId(cajita.id)}
                          className="text-xs text-[#ec7fa9] font-medium hover:underline">
                          + Abonar a esta cajita
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6 bg-[#ffedfa] rounded-2xl border border-[#ffb8e0] p-5">
        <p className="font-semibold text-[#1a1a2e] mb-2">💡 ¿Qué son las cajitas?</p>
        <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">
          Hay gastos que no llegan cada mes, pero cuando llegan duelen si no estás preparada.
          Las cajitas reservan una parte de tu dinero cada mes para que no te sorprendan.
          Finly descuenta la cuota mensual de tu dinero disponible automáticamente.
        </p>
      </div>
    </div>
  );
}
