"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Vivienda": "🏠", "Comida": "🍽️", "Transporte": "🚗", "Salud": "💊",
  "Educación": "📚", "Entretenimiento": "🎬", "Ropa": "👗", "Belleza": "💄",
  "Suscripciones": "📱", "Cafés": "☕", "Domicilios": "🛵", "Compras impulsivas": "🛍️", "Otros": "📦",
};

const CATEGORIES = ["Vivienda","Comida","Transporte","Salud","Educación","Entretenimiento","Ropa","Belleza","Suscripciones","Cafés","Domicilios","Compras impulsivas","Otros"];
const PIE_COLORS = ["#ec7fa9","#ffb8e0","#f472b6","#fb7185","#f9a8d4","#e879f9","#c084fc","#a78bfa","#818cf8","#60a5fa","#34d399","#fbbf24","#f87171"];

const TIPS = [
  { icon: "💡", title: "La regla del 24 horas", desc: "Antes de una compra no planeada, espera 24 horas. Si al día siguiente sigues queriéndola, evalúa si está en tu presupuesto." },
  { icon: "📊", title: "Conoce tus patrones", desc: "Ver en qué categoría gastas más te da poder. No para juzgarte, sino para tomar decisiones conscientes." },
  { icon: "🎯", title: "Gasto vs. valor", desc: "Pregúntate: ¿este gasto me dio el valor que esperaba? Si la respuesta es no frecuentemente en una categoría, ahí está la oportunidad." },
  { icon: "🛒", title: "Lista antes de comprar", desc: "Ir al mercado con lista reduce el gasto en promedio un 23%. Aplica para cualquier tienda, no solo supermercados." },
];

type Gasto = { id: string; fecha: string; categoria: string; descripcion: string; valor: number };

export default function GastosVisualPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());

  // Form state
  const [categoria, setCategoria] = useState(CATEGORIES[1]);
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("gastos").select("*").eq("user_id", user.id).order("fecha", { ascending: false });
      if (data) setGastos(data);
      setLoading(false);
    }
    load();
  }, []);

  async function addGasto(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion || !valor) return;
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("gastos").insert({
      user_id: user.id,
      fecha: fecha || new Date().toISOString().split("T")[0],
      categoria, descripcion,
      valor: parseFloat(valor),
    }).select().single();
    if (data) setGastos([data, ...gastos]);
    setDescripcion(""); setValor(""); setFecha("");
    setAdding(false);
  }

  async function removeGasto(id: string) {
    const supabase = createClient();
    await supabase.from("gastos").delete().eq("id", id);
    setGastos(gastos.filter((g) => g.id !== id));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  // Filter by selected month
  const filtered = gastos.filter((g) => {
    const d = new Date(g.fecha + "T00:00:00");
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const total = filtered.reduce((s, g) => s + g.valor, 0);

  // Group by category
  const byCategory = Object.entries(
    filtered.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const maxCat = byCategory[0]?.[1] || 1;
  const tip = TIPS[month % TIPS.length];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis gastos 📊
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Conoce en qué se va tu dinero</p>
        </div>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-[#ffb8e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
        </select>
      </div>

      {/* Quick add form */}
      <form onSubmit={addGasto} className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-6">
        <p className="text-sm font-semibold text-[#1a1a2e] mb-3">Registrar gasto rápido</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 sm:w-44">
            {CATEGORIES.map((c) => (
              <option key={c}>{CATEGORY_EMOJIS[c] ? `${CATEGORY_EMOJIS[c]} ${c}` : c}</option>
            ))}
          </select>
          <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿En qué gastaste? *" required
            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
          <input type="number" value={valor} onChange={(e) => setValor(e.target.value)}
            placeholder="Valor *" required
            className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 sm:w-36" />
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 sm:w-40 text-[#1a1a2e]/50" />
          <button type="submit" disabled={adding}
            className="bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
            {adding ? "..." : "+ Agregar"}
          </button>
        </div>
        <p className="text-xs text-[#1a1a2e]/30 mt-2">* obligatorio · fecha es opcional</p>
      </form>

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5 col-span-1">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Total gastado</p>
              <p className="text-2xl font-bold text-[#ec7fa9]">{fmt(total)}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">{MONTHS[month]}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{filtered.length}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">este mes</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Categoría top</p>
              <p className="text-lg font-bold text-[#1a1a2e] truncate">{byCategory[0] ? `${CATEGORY_EMOJIS[byCategory[0][0]] || "📦"} ${byCategory[0][0]}` : "—"}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">{byCategory[0] ? fmt(byCategory[0][1]) : ""}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
              <h2 className="font-semibold text-[#1a1a2e] mb-5">Por categoría</h2>
              {byCategory.length === 0 ? (
                <div className="text-center py-10 text-[#1a1a2e]/30">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">Sin gastos registrados este mes</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={byCategory.map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        paddingAngle={2} dataKey="value">
                        {byCategory.map(([cat], i) => (
                          <Cell key={cat} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 mt-2">
                    {byCategory.map(([cat, val], i) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-[#1a1a2e]/70">{CATEGORY_EMOJIS[cat] || "📦"} {cat}</span>
                        </div>
                        <span className="font-semibold text-[#1a1a2e]">{total > 0 ? ((val / total) * 100).toFixed(0) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
              <h2 className="font-semibold text-[#1a1a2e] mb-5">Últimas transacciones</h2>
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-[#1a1a2e]/30">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">Sin gastos este mes</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {filtered.slice(0, 15).map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2 border-b border-[#ffb8e0]/40 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{CATEGORY_EMOJIS[g.categoria] || "📦"}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-[#1a1a2e] truncate">{g.descripcion}</p>
                          <p className="text-xs text-[#1a1a2e]/40">{g.fecha}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-sm font-semibold text-[#ec7fa9]">{fmt(g.valor)}</span>
                        <button onClick={() => removeGasto(g.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-[#ec7fa9] rounded-2xl p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/70">💡 Tip del mes</p>
            <h3 className="font-bold text-lg mb-2">{tip.icon} {tip.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{tip.desc}</p>
          </div>

        </div>
      )}
    </div>
  );
}
