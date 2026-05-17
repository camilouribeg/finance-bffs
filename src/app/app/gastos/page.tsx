"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Inbox, X, Plus, RefreshCw, ShoppingBag } from "lucide-react";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Vivienda": "🏠", "Comida": "🍽️", "Transporte": "🚗", "Salud": "💊",
  "Educación": "📚", "Entretenimiento": "🎬", "Ropa": "👗", "Belleza": "💄",
  "Suscripciones": "📱", "Cafés": "☕", "Domicilios": "🛵", "Compras impulsivas": "🛍️", "Otros": "📦",
};
const CATEGORIES = Object.keys(CATEGORY_EMOJIS);
const PIE_COLORS = ["#ec7fa9","#ffb8e0","#f472b6","#fb7185","#f9a8d4","#e879f9","#c084fc","#a78bfa","#818cf8","#60a5fa","#34d399","#fbbf24","#f87171"];

type GastoFijo = { id: string; nombre: string; valor: number };
type Gasto = { id: string; fecha: string; categoria: string; descripcion: string; valor: number };

export default function GastosPage() {
  const fmt = useFmt();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Gastos fijos
  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
  const [showFijoForm, setShowFijoForm] = useState(false);
  const [fijoNombre, setFijoNombre] = useState("");
  const [fijoValor, setFijoValor] = useState("");

  // Gastos del día a día
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoria, setCategoria] = useState("Comida");
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState("");
  const [adding, setAdding] = useState(false);

  // Budget
  const [presupuestoDisponible, setPresupuestoDisponible] = useState<number | null>(null);
  const [dashboardId, setDashboardId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const [{ data: gastosData }, { data: plan }, { data: deudas }, { data: bolsillos }, { data: cajitas }] = await Promise.all([
      supabase.from("gastos").select("*").eq("user_id", user.id).order("fecha", { ascending: false }),
      supabase.from("dashboard_mensual").select("*")
        .eq("user_id", user.id).eq("month", now.getMonth() + 1).eq("year", now.getFullYear()).single(),
      supabase.from("deudas").select("cuota_mensual").eq("user_id", user.id),
      supabase.from("bolsillos").select("cuota_mensual,meta,actual,fecha_meta,tipo").eq("user_id", user.id),
      supabase.from("cajitas").select("monto_total,actual,fecha_pago").eq("user_id", user.id),
    ]);

    if (gastosData) setGastos(gastosData);

    if (plan) {
      setDashboardId(plan.id);
      const items: GastoFijo[] = ((plan.gastos_fijos_items ?? []) as Array<{ nombre?: string; descripcion?: string; valor: number }>).map((i, idx) => ({
        id: `fijo-${idx}`, nombre: i.nombre ?? i.descripcion ?? "", valor: i.valor,
      }));
      setGastosFijos(items);

      const ingresoFijo = plan.ingreso_fijo ?? 0;
      const ingresosOtros = ((plan.ingresos_otros ?? []) as Array<{ valor: number }>).reduce((s, i) => s + (i.valor || 0), 0);
      const gastosFijosTotal = items.reduce((s, i) => s + i.valor, 0);
      const totalCuotas = (deudas ?? []).reduce((s, d) => s + (d.cuota_mensual || 0), 0);

      function monthsUntil(fechaStr: string): number {
        const f = new Date(fechaStr + "T12:00:00");
        const diff = (f.getFullYear() - now.getFullYear()) * 12 + (f.getMonth() - now.getMonth());
        return Math.max(1, diff);
      }
      const totalBolsitas = (bolsillos ?? []).reduce((s, b) => {
        if (b.tipo === "metas" && b.fecha_meta && b.meta > 0)
          return s + Math.ceil(Math.max(0, b.meta - b.actual) / monthsUntil(b.fecha_meta));
        return s + (b.cuota_mensual || 0);
      }, 0);
      const totalCajitas = (cajitas ?? []).reduce((c, cajita) => {
        return c + Math.ceil(Math.max(0, cajita.monto_total - cajita.actual) / monthsUntil(cajita.fecha_pago));
      }, 0);

      setPresupuestoDisponible(ingresoFijo + ingresosOtros - gastosFijosTotal - totalCuotas - totalBolsitas - totalCajitas);
    }
    setLoading(false);
  }

  async function saveFijos(newItems: GastoFijo[]) {
    if (!dashboardId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = newItems.map(({ nombre, valor }) => ({ nombre, valor }));
    const total = newItems.reduce((s, i) => s + i.valor, 0);
    await supabase.from("dashboard_mensual").update({ gastos_fijos_items: payload, gastos_fijos: total }).eq("id", dashboardId).eq("user_id", user.id);
  }

  async function addFijo(e: React.FormEvent) {
    e.preventDefault();
    if (!fijoNombre || !fijoValor) return;
    const nuevo: GastoFijo = { id: `fijo-${Date.now()}`, nombre: fijoNombre, valor: parseFloat(fijoValor) };
    const next = [...gastosFijos, nuevo];
    setGastosFijos(next);
    await saveFijos(next);
    setFijoNombre(""); setFijoValor(""); setShowFijoForm(false);
    // Recalc presupuesto
    if (presupuestoDisponible !== null) {
      setPresupuestoDisponible(p => p !== null ? p - nuevo.valor : p);
    }
  }

  async function removeFijo(id: string) {
    const item = gastosFijos.find(f => f.id === id);
    const next = gastosFijos.filter(f => f.id !== id);
    setGastosFijos(next);
    await saveFijos(next);
    if (item && presupuestoDisponible !== null) {
      setPresupuestoDisponible(p => p !== null ? p + item.valor : p);
    }
  }

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("gastos").delete().eq("id", id).eq("user_id", user.id);
    setGastos(gastos.filter(g => g.id !== id));
  }


  const filtered = gastos.filter(g => {
    const d = new Date(g.fecha + "T00:00:00");
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const totalVariable = filtered.reduce((s, g) => s + g.valor, 0);
  const totalFijos = gastosFijos.reduce((s, f) => s + f.valor, 0);

  const byCategory = Object.entries(
    filtered.reduce((acc, g) => { acc[g.categoria] = (acc[g.categoria] || 0) + g.valor; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const inputCls = "border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis gastos
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Conoce en qué se va tu dinero</p>
        </div>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="border border-[#ffb8e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
        </select>
      </div>

      {/* Budget banner */}
      {presupuestoDisponible !== null && month === new Date().getMonth() && (
        <div className={`rounded-2xl border-2 p-5 mb-8 grid grid-cols-3 gap-4 ${presupuestoDisponible - totalVariable >= 0 ? "bg-white border-[#ec7fa9]" : "bg-red-50 border-red-200"}`}>
          <div>
            <p className="text-xs text-[#1a1a2e]/50 mb-0.5">Para gastar este mes</p>
            <p className="text-xl font-bold text-[#ec7fa9]">{fmt(presupuestoDisponible)}</p>
          </div>
          <div>
            <p className="text-xs text-[#1a1a2e]/50 mb-0.5">Ya gastado</p>
            <p className="text-xl font-bold text-red-400">{fmt(totalVariable)}</p>
          </div>
          <div>
            <p className="text-xs text-[#1a1a2e]/50 mb-0.5">Restante</p>
            <p className={`text-xl font-bold ${presupuestoDisponible - totalVariable >= 0 ? "text-green-600" : "text-red-500"}`}>
              {fmt(presupuestoDisponible - totalVariable)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : (
        <div className="flex flex-col gap-10">

          {/* ── GASTOS FIJOS ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={17} className="text-[#ec7fa9]" />
                <h2 className="text-lg font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Gastos fijos
                </h2>
              </div>
              <button
                onClick={() => setShowFijoForm(f => !f)}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#ec7fa9] border border-[#ffb8e0] bg-white hover:bg-[#ffedfa] px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={14} />Agregar
              </button>
            </div>

            <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-5 py-3 mb-4">
              <p className="text-sm text-[#1a1a2e]/70 leading-relaxed">
                <span className="font-semibold text-[#ec7fa9]">Se repiten igual cada mes.</span> Arriendo, servicios, gym, suscripciones… Amy los descuenta automáticamente de tu dinero disponible.
              </p>
            </div>

            {showFijoForm && (
              <form onSubmit={addFijo} className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-4">
                <div className="flex gap-2">
                  <input value={fijoNombre} onChange={e => setFijoNombre(e.target.value)} placeholder="Nombre (ej: Arriendo)" className={`${inputCls} flex-1`} />
                  <input type="number" value={fijoValor} onChange={e => setFijoValor(e.target.value)} placeholder="Valor" className={`${inputCls} w-36`} />
                  <button type="submit" className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1">
                    <Check />Guardar
                  </button>
                  <button type="button" onClick={() => setShowFijoForm(false)} className="border border-[#ffb8e0] text-[#1a1a2e]/50 px-3 py-2.5 rounded-xl flex items-center">
                    <X size={14} />
                  </button>
                </div>
              </form>
            )}

            {gastosFijos.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#ffb8e0]">
                <RefreshCw size={28} className="mx-auto mb-2 text-[#ec7fa9] opacity-30" />
                <p className="text-sm font-semibold text-[#1a1a2e]">Sin gastos fijos registrados</p>
                <p className="text-xs text-[#1a1a2e]/40 mt-1 mb-3">Agrega tus gastos que se repiten cada mes</p>
                <button onClick={() => setShowFijoForm(true)} className="bg-[#ec7fa9] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#d96d97]">+ Agregar primero</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#ffb8e0] overflow-hidden">
                {gastosFijos.map((f, i) => (
                  <div key={f.id} className={`flex items-center justify-between px-5 py-3.5 ${i < gastosFijos.length - 1 ? "border-b border-[#ffb8e0]/50" : ""}`}>
                    <p className="text-sm font-medium text-[#1a1a2e]">{f.nombre}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#ec7fa9]">{fmt(f.valor)}<span className="text-xs font-normal text-[#1a1a2e]/40">/mes</span></span>
                      <button onClick={() => removeFijo(f.id)} className="text-[#1a1a2e]/20 hover:text-red-400"><X size={13} /></button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-3 bg-[#ffedfa] border-t border-[#ffb8e0]">
                  <p className="text-xs font-semibold text-[#1a1a2e]/60 uppercase tracking-wide">Total fijos</p>
                  <p className="text-sm font-bold text-[#1a1a2e]">{fmt(totalFijos)}/mes</p>
                </div>
              </div>
            )}
          </section>

          {/* ── GASTOS DEL DÍA A DÍA ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={17} className="text-[#ec7fa9]" />
              <h2 className="text-lg font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                Gastos del día a día
              </h2>
            </div>

            <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-5 py-3 mb-4">
              <p className="text-sm text-[#1a1a2e]/70 leading-relaxed">
                <span className="font-semibold text-[#ec7fa9]">Lo que gastas en el momento.</span> Restaurantes, compras, Rappi, ropa… Regístralo aquí para saber en qué se va tu dinero libre.
              </p>
            </div>

            {/* Quick add */}
            <form onSubmit={addGasto} className="bg-white rounded-2xl border border-[#ffb8e0] p-5 mb-5">
              <p className="text-xs font-semibold text-[#1a1a2e]/50 uppercase tracking-wide mb-3">Registrar gasto</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={categoria} onChange={e => setCategoria(e.target.value)}
                  className={`${inputCls} sm:w-44`}>
                  {CATEGORIES.map(c => <option key={c}>{CATEGORY_EMOJIS[c] ? `${CATEGORY_EMOJIS[c]} ${c}` : c}</option>)}
                </select>
                <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="¿En qué gastaste?" required className={`${inputCls} flex-1`} />
                <input type="number" value={valor} onChange={e => setValor(e.target.value)}
                  placeholder="Valor" required className={`${inputCls} sm:w-32`} />
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                  className={`${inputCls} sm:w-36 text-[#1a1a2e]/50`} />
                <button type="submit" disabled={adding}
                  className="bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap">
                  {adding ? "..." : "+ Agregar"}
                </button>
              </div>
              <p className="text-xs text-[#1a1a2e]/30 mt-2">Fecha es opcional — se guarda hoy si no la pones</p>
            </form>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Gastado</p>
                <p className="text-xl font-bold text-[#ec7fa9]">{fmt(totalVariable)}</p>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">{MONTHS[month]}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Transacciones</p>
                <p className="text-xl font-bold text-[#1a1a2e]">{filtered.length}</p>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">este mes</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Categoría top</p>
                <p className="text-sm font-bold text-[#1a1a2e] truncate">{byCategory[0] ? `${CATEGORY_EMOJIS[byCategory[0][0]] || "📦"} ${byCategory[0][0]}` : "—"}</p>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">{byCategory[0] ? fmt(byCategory[0][1]) : ""}</p>
              </div>
            </div>

            {/* Category chart + transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-4">Por categoría</h3>
                {byCategory.length === 0 ? (
                  <div className="text-center py-8 text-[#1a1a2e]/30">
                    <Inbox size={26} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin gastos registrados este mes</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={byCategory.map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                          paddingAngle={2} dataKey="value">
                          {byCategory.map(([cat], i) => <Cell key={cat} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {byCategory.map(([cat, val], i) => (
                        <div key={cat} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-[#1a1a2e]/70">{CATEGORY_EMOJIS[cat] || "📦"} {cat}</span>
                          </div>
                          <span className="font-semibold text-[#1a1a2e]">{totalVariable > 0 ? ((val / totalVariable) * 100).toFixed(0) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
                <h3 className="font-semibold text-[#1a1a2e] text-sm mb-4">Últimos gastos</h3>
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-[#1a1a2e]/30">
                    <Inbox size={26} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin gastos este mes</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                    {filtered.slice(0, 20).map(g => (
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
                          <button onClick={() => removeGasto(g.id)} className="text-[#1a1a2e]/20 hover:text-red-400"><X size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

function Check() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
