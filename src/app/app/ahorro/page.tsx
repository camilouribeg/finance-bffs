"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PiggyBank, Target, Check, X, PartyPopper, Star } from "lucide-react";

type Bolsillo = {
  id: string;
  nombre: string;
  meta: number;
  actual: number;
  emoji: string;
  tipo: string;
  importancia: number;
  fecha_meta: string | null;
  cuota_mensual: number;
  celebrado: boolean;
};

const EMOJIS_FONDOS = ["🐷", "🏠", "🚨", "💊", "💄", "🎁", "👩‍💼", "🌱", "🐾", "💅"];
const EMOJIS_METAS = ["✈️", "📱", "💻", "👜", "🚗", "🎓", "🏡", "💍", "🌍", "🎉"];

const FONDOS_PREDEFINIDOS = [
  { nombre: "Skincare y belleza", emoji: "💄" },
  { nombre: "Regalos", emoji: "🎁" },
  { nombre: "Emergencias del hogar", emoji: "🏠" },
  { nombre: "Emergencias del carro", emoji: "🚗" },
  { nombre: "Salud y medicamentos", emoji: "💊" },
];

const METAS_EJEMPLOS = [
  { nombre: "Viaje soñado", emoji: "✈️" },
  { nombre: "Celular nuevo", emoji: "📱" },
  { nombre: "Computador", emoji: "💻" },
  { nombre: "Bolso especial", emoji: "👜" },
  { nombre: "Keratina / tratamiento", emoji: "💅" },
];

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`leading-none transition-colors ${onChange ? "cursor-pointer" : "cursor-default"} ${s <= value ? "text-[#ec7fa9]" : "text-[#ffb8e0]"}`}
        >
          <Star size={14} fill={s <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function AhorroPage() {
  const [bolsillos, setBolsillos] = useState<Bolsillo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fondos" | "metas">("fondos");
  const [showForm, setShowForm] = useState(false);

  // Form fondos
  const [fNombre, setFNombre] = useState("");
  const [fEmoji, setFEmoji] = useState("🐷");
  const [fImportancia, setFImportancia] = useState(3);
  const [fMeta, setFMeta] = useState("");
  const [fCuota, setFCuota] = useState("");

  // Form metas
  const [mNombre, setMNombre] = useState("");
  const [mEmoji, setMEmoji] = useState("✈️");
  const [mImportancia, setMImportancia] = useState(3);
  const [mMeta, setMMeta] = useState("");
  const [mFecha, setMFecha] = useState("");

  // Abonar
  const [abonarId, setAbonarId] = useState<string | null>(null);
  const [abonarMonto, setAbonarMonto] = useState("");

  // Celebration modal
  const [celebrando, setCelebrando] = useState<Bolsillo | null>(null);
  const [reasignarId, setReasignarId] = useState("");
  const [reasignarMonto, setReasignarMonto] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("bolsillos").select("*").eq("user_id", user.id).order("importancia", { ascending: false });
    if (data) {
      setBolsillos(data);
      // Check for uncelebrated completed metas
      const pendingCelebration = data.find(
        (b: Bolsillo) => b.tipo === "metas" && b.meta > 0 && b.actual >= b.meta && !b.celebrado
      );
      if (pendingCelebration) setCelebrando(pendingCelebration);
    }
    setLoading(false);
  }

  function monthsUntil(fechaStr: string): number {
    const now = new Date();
    const fecha = new Date(fechaStr + "T12:00:00");
    const diff = (fecha.getFullYear() - now.getFullYear()) * 12 + (fecha.getMonth() - now.getMonth());
    return Math.max(1, diff);
  }

  function cuotaMeta(b: Bolsillo): number {
    if (!b.fecha_meta || b.meta <= 0) return 0;
    const falta = Math.max(0, b.meta - b.actual);
    return Math.ceil(falta / monthsUntil(b.fecha_meta));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  async function addFondo(e: React.FormEvent) {
    e.preventDefault();
    if (!fNombre) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("bolsillos").insert({
      user_id: user.id,
      nombre: fNombre, emoji: fEmoji, tipo: "fondos",
      importancia: fImportancia,
      meta: fMeta ? parseFloat(fMeta) : 0,
      cuota_mensual: fCuota ? parseFloat(fCuota) : 0,
      actual: 0, celebrado: false,
    }).select().single();
    if (data) setBolsillos(prev => [...prev, data].sort((a, b) => b.importancia - a.importancia));
    setFNombre(""); setFEmoji("🐷"); setFImportancia(3); setFMeta(""); setFCuota("");
    setShowForm(false);
  }

  async function addMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!mNombre || !mMeta || !mFecha) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const metaVal = parseFloat(mMeta);
    const cuota = Math.ceil(metaVal / Math.max(1, monthsUntil(mFecha)));
    const { data } = await supabase.from("bolsillos").insert({
      user_id: user.id,
      nombre: mNombre, emoji: mEmoji, tipo: "metas",
      importancia: mImportancia,
      meta: metaVal,
      fecha_meta: mFecha,
      cuota_mensual: cuota,
      actual: 0, celebrado: false,
    }).select().single();
    if (data) setBolsillos(prev => [...prev, data]);
    setMNombre(""); setMEmoji("✈️"); setMImportancia(3); setMMeta(""); setMFecha("");
    setShowForm(false);
  }

  async function abonar(id: string) {
    const b = bolsillos.find(x => x.id === id);
    if (!b) return;
    const monto = parseFloat(abonarMonto);
    if (!monto) return;
    const nuevoActual = b.actual + monto;
    const supabase = createClient();
    await supabase.from("bolsillos").update({ actual: nuevoActual }).eq("id", id);
    const updated = bolsillos.map(x => x.id === id ? { ...x, actual: nuevoActual } : x);
    setBolsillos(updated);
    setAbonarId(null); setAbonarMonto("");
    // Check celebration
    const updatedB = updated.find(x => x.id === id);
    if (updatedB && updatedB.tipo === "metas" && updatedB.meta > 0 && nuevoActual >= updatedB.meta && !updatedB.celebrado) {
      setCelebrando(updatedB);
    }
  }

  async function marcarCelebrado(id: string) {
    const supabase = createClient();
    await supabase.from("bolsillos").update({ celebrado: true }).eq("id", id);
    setBolsillos(bolsillos.map(b => b.id === id ? { ...b, celebrado: true } : b));
    setCelebrando(null);
    setReasignarId(""); setReasignarMonto("");
  }

  async function reasignarDinero() {
    if (!celebrando || !reasignarId || !reasignarMonto) return;
    const destino = bolsillos.find(b => b.id === reasignarId);
    if (!destino) return;
    const monto = parseFloat(reasignarMonto);
    const supabase = createClient();
    await supabase.from("bolsillos").update({ actual: destino.actual + monto }).eq("id", reasignarId);
    await supabase.from("bolsillos").update({ celebrado: true }).eq("id", celebrando.id);
    setBolsillos(bolsillos.map(b => {
      if (b.id === reasignarId) return { ...b, actual: b.actual + monto };
      if (b.id === celebrando.id) return { ...b, celebrado: true };
      return b;
    }));
    setCelebrando(null); setReasignarId(""); setReasignarMonto("");
  }

  async function removeBolsillo(id: string) {
    const supabase = createClient();
    await supabase.from("bolsillos").delete().eq("id", id);
    setBolsillos(bolsillos.filter(b => b.id !== id));
  }

  const fondos = bolsillos.filter(b => !b.tipo || b.tipo === "fondos");
  const metas = bolsillos.filter(b => b.tipo === "metas");
  const totalAhorrado = bolsillos.reduce((s, b) => s + b.actual, 0);
  const totalMensual = fondos.reduce((s, b) => s + (b.cuota_mensual || 0), 0)
    + metas.reduce((s, b) => s + cuotaMeta(b), 0);

  const inputCls = "w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Celebration modal */}
      {celebrando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-3xl border border-[#ffb8e0] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <PartyPopper size={40} className="mx-auto mb-3 text-[#ec7fa9]" />
              <h2 className="text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                ¡Meta lograda!
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mt-2">
                Lograste tu meta <strong className="text-[#ec7fa9]">{celebrando.nombre}</strong>. ¡Qué orgullo!
              </p>
            </div>
            <p className="text-sm font-semibold text-[#1a1a2e] mb-3">¿Qué quieres hacer con este dinero?</p>
            <div className="space-y-3">
              {bolsillos.filter(b => b.id !== celebrando.id).length > 0 && (
                <div className="border border-[#ffb8e0] rounded-2xl p-4">
                  <p className="text-sm font-medium text-[#1a1a2e] mb-2">Reasignar a otra bolsita</p>
                  <select value={reasignarId} onChange={(e) => setReasignarId(e.target.value)}
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none mb-2">
                    <option value="">Selecciona una bolsita...</option>
                    {bolsillos.filter(b => b.id !== celebrando.id).map(b => (
                      <option key={b.id} value={b.id}>{b.emoji} {b.nombre}</option>
                    ))}
                  </select>
                  {reasignarId && (
                    <div className="flex gap-2">
                      <input type="number" value={reasignarMonto} onChange={(e) => setReasignarMonto(e.target.value)}
                        placeholder="Monto a reasignar" className={`${inputCls} flex-1`} />
                      <button onClick={reasignarDinero}
                        className="bg-[#ec7fa9] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#d96d97] flex items-center">
                        <Check size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => { marcarCelebrado(celebrando.id); setShowForm(true); setActiveTab("metas"); }}
                className="w-full border-2 border-[#ffb8e0] rounded-2xl p-3 text-sm text-[#ec7fa9] font-medium hover:bg-[#ffedfa] transition-colors">
                + Crear una nueva bolsita de metas
              </button>
              <button onClick={() => marcarCelebrado(celebrando.id)}
                className="w-full text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-1">
                Cerrar sin reasignar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis ahorros
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Tu dinero con propósito, guardado en tu banco</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); }}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Agregar
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#1a1a2e]/50 mb-1">Total ahorrado</p>
            <p className="text-2xl font-bold text-green-600">{fmt(totalAhorrado)}</p>
          </div>
          <div>
            <p className="text-xs text-[#1a1a2e]/50 mb-1">Reservas mensuales</p>
            <p className="text-2xl font-bold text-[#ec7fa9]">{fmt(totalMensual)}<span className="text-sm font-normal text-[#1a1a2e]/40">/mes</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["fondos", "metas"] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}>
            {tab === "fondos" ? <span className="flex items-center justify-center gap-2"><PiggyBank size={15} />Mis fondos</span> : <span className="flex items-center justify-center gap-2"><Target size={15} />Mis metas</span>}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
          {activeTab === "fondos" ? (
            <>
              <h2 className="font-semibold text-[#1a1a2e] mb-4">Nuevo fondo permanente</h2>
              <div className="mb-3">
                <p className="text-xs text-[#1a1a2e]/50 mb-2">Ejemplos:</p>
                <div className="flex flex-wrap gap-2">
                  {FONDOS_PREDEFINIDOS.map(f => (
                    <button key={f.nombre} type="button"
                      onClick={() => { setFNombre(f.nombre); setFEmoji(f.emoji); }}
                      className="text-xs bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] px-3 py-1.5 rounded-lg hover:bg-[#ffb8e0] transition-colors">
                      {f.emoji} {f.nombre}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={addFondo} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Nombre</label>
                    <input value={fNombre} onChange={(e) => setFNombre(e.target.value)} placeholder="Ej: Emergencias del hogar" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Emoji</label>
                    <select value={fEmoji} onChange={(e) => setFEmoji(e.target.value)}
                      className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none">
                      {EMOJIS_FONDOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#1a1a2e]/50 mb-1.5 block">Importancia</label>
                  <Stars value={fImportancia} onChange={setFImportancia} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto apartas por mes?</label>
                    <input type="number" value={fCuota} onChange={(e) => setFCuota(e.target.value)} placeholder="Ej: 100.000" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Meta total (opcional)</label>
                    <input type="number" value={fMeta} onChange={(e) => setFMeta(e.target.value)} placeholder="Ej: 2.000.000" className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-2.5 rounded-xl hover:bg-[#ffedfa] text-sm">Cancelar</button>
                  <button type="submit"
                    className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm">Guardar fondo</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-[#1a1a2e] mb-4">Nueva meta de ahorro</h2>
              <div className="mb-3">
                <p className="text-xs text-[#1a1a2e]/50 mb-2">Ejemplos:</p>
                <div className="flex flex-wrap gap-2">
                  {METAS_EJEMPLOS.map(m => (
                    <button key={m.nombre} type="button"
                      onClick={() => { setMNombre(m.nombre); setMEmoji(m.emoji); }}
                      className="text-xs bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] px-3 py-1.5 rounded-lg hover:bg-[#ffb8e0] transition-colors">
                      {m.emoji} {m.nombre}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={addMeta} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Qué quieres lograr?</label>
                    <input value={mNombre} onChange={(e) => setMNombre(e.target.value)} placeholder="Ej: Viaje a Disney" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Emoji</label>
                    <select value={mEmoji} onChange={(e) => setMEmoji(e.target.value)}
                      className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none">
                      {EMOJIS_METAS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#1a1a2e]/50 mb-1.5 block">Importancia</label>
                  <Stars value={mImportancia} onChange={setMImportancia} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto cuesta?</label>
                    <input type="number" value={mMeta} onChange={(e) => setMMeta(e.target.value)} placeholder="Ej: 5.000.000" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Para cuándo?</label>
                    <input type="date" value={mFecha} onChange={(e) => setMFecha(e.target.value)} className={inputCls} />
                  </div>
                </div>
                {mMeta && mFecha && (
                  <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm">
                    <span className="text-[#1a1a2e]/60">Finly calcula que necesitas apartar </span>
                    <span className="font-bold text-[#ec7fa9]">
                      {fmt(Math.ceil(parseFloat(mMeta) / Math.max(1, monthsUntil(mFecha))))}
                    </span>
                    <span className="text-[#1a1a2e]/60"> por mes para llegar a tiempo</span>
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-2.5 rounded-xl hover:bg-[#ffedfa] text-sm">Cancelar</button>
                  <button type="submit"
                    className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm">Guardar meta</button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : (
        <>
          {/* FONDOS TAB */}
          {activeTab === "fondos" && (
            <div>
              {fondos.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#ffb8e0]">
                  <PiggyBank size={36} className="mx-auto mb-3 text-[#ec7fa9] opacity-40" />
                  <p className="font-semibold text-[#1a1a2e]">Aún no tienes fondos permanentes</p>
                  <p className="text-sm text-[#1a1a2e]/50 mt-1 mb-4">Son para emergencias y gastos recurrentes de tu vida</p>
                  <button onClick={() => setShowForm(true)}
                    className="bg-[#ec7fa9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">
                    + Crear primer fondo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fondos.map((b) => {
                    const pct = b.meta > 0 ? Math.min((b.actual / b.meta) * 100, 100) : null;
                    return (
                      <div key={b.id} className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{b.emoji}</span>
                            <div>
                              <p className="font-semibold text-[#1a1a2e] text-sm">{b.nombre}</p>
                              <Stars value={b.importancia || 3} />
                            </div>
                          </div>
                          <button onClick={() => removeBolsillo(b.id)} className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={14} /></button>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-[#1a1a2e]/50">Ahorrado</p>
                            <p className="text-lg font-bold text-green-600">{fmt(b.actual)}</p>
                          </div>
                          {b.cuota_mensual > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-[#1a1a2e]/50">Por mes</p>
                              <p className="text-sm font-semibold text-[#ec7fa9]">{fmt(b.cuota_mensual)}</p>
                            </div>
                          )}
                        </div>
                        {pct !== null && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#1a1a2e]/50">Meta: {fmt(b.meta)}</span>
                              <span className="font-semibold text-[#ec7fa9]">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden">
                              <div className="h-full bg-[#ec7fa9] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                        {abonarId === b.id ? (
                          <div className="flex gap-2">
                            <input type="number" value={abonarMonto} onChange={(e) => setAbonarMonto(e.target.value)}
                              placeholder="Monto" autoFocus
                              className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none" />
                            <button onClick={() => abonar(b.id)} className="bg-[#ec7fa9] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#d96d97] flex items-center"><Check size={14} /></button>
                            <button onClick={() => { setAbonarId(null); setAbonarMonto(""); }}
                              className="border border-[#ffb8e0] text-[#1a1a2e]/50 text-sm px-3 py-2 rounded-xl flex items-center"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setAbonarId(b.id)} className="text-xs text-[#ec7fa9] font-medium hover:underline">+ Abonar</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* METAS TAB */}
          {activeTab === "metas" && (
            <div>
              {metas.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#ffb8e0]">
                  <Target size={36} className="mx-auto mb-3 text-[#ec7fa9] opacity-40" />
                  <p className="font-semibold text-[#1a1a2e]">Aún no tienes metas de ahorro</p>
                  <p className="text-sm text-[#1a1a2e]/50 mt-1 mb-4">Agrega algo que quieras lograr con fecha y costo</p>
                  <button onClick={() => setShowForm(true)}
                    className="bg-[#ec7fa9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">
                    + Crear primera meta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {metas.map((b) => {
                    const pct = b.meta > 0 ? Math.min((b.actual / b.meta) * 100, 100) : 0;
                    const falta = Math.max(0, b.meta - b.actual);
                    const cuota = cuotaMeta(b);
                    const done = b.actual >= b.meta && b.meta > 0;
                    const meses = b.fecha_meta ? monthsUntil(b.fecha_meta) : null;
                    const fechaStr = b.fecha_meta
                      ? new Date(b.fecha_meta + "T12:00:00").toLocaleDateString("es-CO", { month: "long", year: "numeric" })
                      : null;
                    return (
                      <div key={b.id} className={`bg-white rounded-2xl border p-5 ${done ? "border-green-200 bg-green-50" : "border-[#ffb8e0]"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{b.emoji}</span>
                            <div>
                              <p className="font-semibold text-[#1a1a2e]">{b.nombre}</p>
                              <Stars value={b.importancia || 3} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!done && cuota > 0 && (
                              <span className="text-xs bg-[#ffedfa] text-[#ec7fa9] font-semibold px-2.5 py-1 rounded-full">{fmt(cuota)}/mes</span>
                            )}
                            {done && <span className="text-xs bg-green-100 text-green-600 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Check size={11} />Meta lograda</span>}
                            <button onClick={() => removeBolsillo(b.id)} className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={14} /></button>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#1a1a2e]/60">{fmt(b.actual)} de {fmt(b.meta)}</span>
                            <span className={`font-semibold ${done ? "text-green-600" : "text-[#ec7fa9]"}`}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className={`h-3 rounded-full overflow-hidden ${done ? "bg-green-200" : "bg-[#ffb8e0]"}`}>
                            <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-green-500" : "bg-[#ec7fa9]"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        {fechaStr && !done && (
                          <p className="text-xs text-[#1a1a2e]/40 mb-2">
                            Para: {fechaStr} · Faltan {fmt(falta)} · {meses} mes{meses !== 1 ? "es" : ""}
                          </p>
                        )}
                        {done ? (
                          <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5"><PartyPopper size={14} />¡Lo lograste!</p>
                        ) : (
                          abonarId === b.id ? (
                            <div className="flex gap-2">
                              <input type="number" value={abonarMonto} onChange={(e) => setAbonarMonto(e.target.value)}
                                placeholder="Monto" autoFocus
                                className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none" />
                              <button onClick={() => abonar(b.id)} className="bg-[#ec7fa9] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#d96d97] flex items-center"><Check size={14} /></button>
                              <button onClick={() => { setAbonarId(null); setAbonarMonto(""); }}
                                className="border border-[#ffb8e0] text-[#1a1a2e]/50 text-sm px-3 py-2 rounded-xl flex items-center"><X size={14} /></button>
                            </div>
                          ) : (
                            <button onClick={() => setAbonarId(b.id)} className="text-xs text-[#ec7fa9] font-medium hover:underline">+ Abonar</button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
