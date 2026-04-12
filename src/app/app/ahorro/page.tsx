"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Bolsillo = {
  id: string;
  nombre: string;
  meta: number;
  actual: number;
  emoji: string;
};

const DEFAULT_EMOJIS = ["✈️","🏠","🚨","🎓","💻","👗","💍","🎉","🐾","🌱"];

function BolsilloCard({
  b, onAbonar, onRemove, fmt,
}: {
  b: Bolsillo;
  onAbonar: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  fmt: (n: number) => string;
}) {
  const [abonoAmt, setAbonoAmt] = useState("");
  const pct = Math.min((b.actual / b.meta) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{b.emoji}</span>
          <div>
            <p className="font-semibold text-[#1a1a2e]">{b.nombre}</p>
            <p className="text-xs text-[#1a1a2e]/50">Meta: {fmt(b.meta)}</p>
          </div>
        </div>
        <button onClick={() => onRemove(b.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#1a1a2e]/60">{fmt(b.actual)} ahorrado</span>
          <span className="font-semibold text-[#ec7fa9]">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-[#ffb8e0] rounded-full overflow-hidden">
          <div className="h-full bg-[#ec7fa9] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {pct < 100 ? (
        <div className="flex gap-2">
          <input type="number" value={abonoAmt} onChange={(e) => setAbonoAmt(e.target.value)} placeholder="Abonar..."
            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]" />
          <button onClick={() => { onAbonar(b.id, parseFloat(abonoAmt) || 0); setAbonoAmt(""); }}
            className="bg-[#ec7fa9] text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-[#d96d97]">
            + Abonar
          </button>
        </div>
      ) : (
        <div className="text-center bg-green-50 border border-green-200 rounded-xl py-2">
          <p className="text-sm font-semibold text-green-600">🎉 ¡Meta alcanzada!</p>
        </div>
      )}
    </div>
  );
}

export default function AhorroPage() {
  const [bolsillos, setBolsillos] = useState<Bolsillo[]>([]);
  const [nombre, setNombre] = useState("");
  const [meta, setMeta] = useState("");
  const [emoji, setEmoji] = useState("🐷");
  const [showForm, setShowForm] = useState(false);
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

  async function addBolsillo(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !meta) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("bolsillos")
      .insert({ user_id: user.id, nombre, meta: parseFloat(meta), actual: 0, emoji })
      .select().single();
    if (data) setBolsillos([...bolsillos, data]);
    setNombre(""); setMeta(""); setEmoji("🐷"); setShowForm(false);
  }

  async function abonar(id: string, amount: number) {
    const bolsillo = bolsillos.find((b) => b.id === id);
    if (!bolsillo) return;
    const newActual = Math.min(bolsillo.actual + amount, bolsillo.meta);
    const supabase = createClient();
    await supabase.from("bolsillos").update({ actual: newActual }).eq("id", id);
    setBolsillos(bolsillos.map((b) => b.id === id ? { ...b, actual: newActual } : b));
  }

  async function removeBolsillo(id: string) {
    const supabase = createClient();
    await supabase.from("bolsillos").delete().eq("id", id);
    setBolsillos(bolsillos.filter((b) => b.id !== id));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalMeta = bolsillos.reduce((s, b) => s + b.meta, 0);
  const totalActual = bolsillos.reduce((s, b) => s + b.actual, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Bolsillos de ahorro 🐷
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Tus metas de ahorro, organizadas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
          + Nuevo bolsillo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Total acumulado</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totalActual)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="text-xs text-[#1a1a2e]/50 mb-1">Meta total</p>
          <p className="text-2xl font-bold text-[#1a1a2e]">{fmt(totalMeta)}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Crear bolsillo</h2>
          <form onSubmit={addBolsillo} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Viaje a París"
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
              </div>
              <div className="w-28">
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Emoji</label>
                <select value={emoji} onChange={(e) => setEmoji(e.target.value)}
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]">
                  {["🐷", ...DEFAULT_EMOJIS].map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Meta de ahorro</label>
              <input type="number" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="0"
                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
            </div>
            <button type="submit" className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm">
              Crear bolsillo 🐷
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[#1a1a2e]/30 text-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bolsillos.map((b) => (
            <BolsilloCard key={b.id} b={b} onAbonar={abonar} onRemove={removeBolsillo} fmt={fmt} />
          ))}
        </div>
      )}
    </div>
  );
}
