"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Vivienda", "Comida", "Transporte", "Salud", "Educación",
  "Entretenimiento", "Ropa", "Belleza", "Suscripciones", "Cafés",
  "Domicilios", "Compras impulsivas", "Otros"
];

type Gasto = {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  valor: number;
};

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("gastos")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });
      if (data) setGastos(data);
      setLoading(false);
    }
    load();
  }, []);

  async function addGasto(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || !descripcion) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newGasto = { user_id: user.id, fecha: fecha || new Date().toISOString().split("T")[0], categoria, descripcion, valor: parseFloat(valor) };
    const { data } = await supabase.from("gastos").insert(newGasto).select().single();
    if (data) setGastos([data, ...gastos]);
    setDescripcion("");
    setValor("");
  }

  async function removeGasto(id: string) {
    const supabase = createClient();
    await supabase.from("gastos").delete().eq("id", id);
    setGastos(gastos.filter((g) => g.id !== id));
  }

  const filtered = filtro === "Todas" ? gastos : gastos.filter((g) => g.categoria === filtro);
  const total = filtered.reduce((sum, g) => sum + g.valor, 0);

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: gastos.filter((g) => g.categoria === cat).reduce((s, g) => s + g.valor, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Mis gastos 📅
        </h1>
        <p className="text-[#1a1a2e]/50 text-sm mt-1">Registra y conoce en qué se va tu dinero</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
            <h2 className="font-semibold text-[#1a1a2e] mb-4">Registrar gasto</h2>
            <form onSubmit={addGasto} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Fecha <span className="text-[#1a1a2e]/30">(opcional)</span></label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Descripción</label>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Mercado semanal"
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/60 mb-1 block">Valor</label>
                <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0"
                  className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
              </div>
              <div className="col-span-2">
                <button type="submit" className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  + Agregar gasto
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a1a2e]">
                Gastos registrados <span className="text-[#ec7fa9]">({filtered.length})</span>
              </h2>
              <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
                className="border border-[#ffb8e0] rounded-xl px-3 py-1.5 text-xs bg-[#ffedfa] outline-none">
                <option>Todas</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#1a1a2e]/30 text-sm">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-[#1a1a2e]/30">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">Aún no has registrado gastos</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-[#ffedfa] border border-[#ffb8e0]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a2e] truncate">{g.descripcion}</p>
                      <p className="text-xs text-[#1a1a2e]/50">{g.fecha} · {g.categoria}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#ec7fa9]">{fmt(g.valor)}</span>
                      <button onClick={() => removeGasto(g.id)} className="text-[#1a1a2e]/30 hover:text-red-400 transition-colors text-xs">✕</button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#ffb8e0] flex justify-between">
                  <span className="text-sm font-semibold text-[#1a1a2e]/70">Total</span>
                  <span className="text-base font-bold text-[#ec7fa9]">{fmt(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 h-fit">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Por categoría</h2>
          {byCategory.length === 0 ? (
            <p className="text-xs text-[#1a1a2e]/40 text-center py-8">Sin datos aún</p>
          ) : (
            <div className="flex flex-col gap-3">
              {byCategory.map(({ cat, total: t }) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1a1a2e]/70">{cat}</span>
                    <span className="font-semibold text-[#ec7fa9]">{fmt(t)}</span>
                  </div>
                  <div className="h-1.5 bg-[#ffb8e0] rounded-full">
                    <div className="h-full bg-[#ec7fa9] rounded-full"
                      style={{ width: `${Math.min((t / (byCategory[0]?.total || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
