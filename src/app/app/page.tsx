"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

type LineItem = { id: string; descripcion: string; valor: number };
type Bolsillo = { id: string; nombre: string; meta: number; actual: number; emoji: string };
type Deuda = { id: string; nombre: string; tipo: string; cuota_mensual: number; total_pendiente: number };

const TIPOS_DEUDA = ["Tarjeta de crédito", "Préstamo personal", "Crédito hipotecario", "Crédito de vehículo", "Deuda familiar", "Otro"];
const DEFAULT_EMOJIS = ["🐷","✈️","🏠","🚨","🎓","💻","👗","💍","🎉","🐾","🌱"];

function ListInput({ items, onAdd, onRemove, placeholder, fmt }: {
  items: LineItem[]; onAdd: (item: LineItem) => void; onRemove: (id: string) => void; placeholder: string; fmt: (n: number) => string;
}) {
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  function add() {
    if (!desc || !val) return;
    onAdd({ id: crypto.randomUUID(), descripcion: desc, valor: parseFloat(val) });
    setDesc(""); setVal("");
  }
  const total = items.reduce((s, i) => s + i.valor, 0);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
        <input type="number" value={val} onChange={(e) => setVal(e.target.value)} placeholder="0"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="w-28 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 text-right" />
        <button onClick={add} className="bg-[#ec7fa9] text-white text-lg px-3 py-2 rounded-xl font-semibold hover:bg-[#d96d97] leading-none">+</button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#ffb8e0]/50 last:border-0">
          <span className="text-sm text-[#1a1a2e]/70 flex-1 truncate pr-4">{item.descripcion}</span>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-[#1a1a2e]">{fmt(item.valor)}</span>
            <button onClick={() => onRemove(item.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div className="flex justify-between pt-3 mt-1">
          <span className="text-xs font-semibold text-[#1a1a2e]/50">Total</span>
          <span className="text-sm font-bold text-[#ec7fa9]">{fmt(total)}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year] = useState(currentYear);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresosOtros, setIngresosOtros] = useState<LineItem[]>([]);
  const [gastosFijosItems, setGastosFijosItems] = useState<LineItem[]>([]);

  // Real gastos from transactions table
  const [totalGastosReales, setTotalGastosReales] = useState(0);

  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [showDeudaForm, setShowDeudaForm] = useState(false);
  const [deudaNombre, setDeudaNombre] = useState("");
  const [deudaTipo, setDeudaTipo] = useState(TIPOS_DEUDA[0]);
  const [deudaCuota, setDeudaCuota] = useState("");
  const [deudaTotal, setDeudaTotal] = useState("");

  const [bolsillos, setBolsillos] = useState<Bolsillo[]>([]);
  const [showBolsilloForm, setShowBolsilloForm] = useState(false);
  const [bolsilloNombre, setBolsilloNombre] = useState("");
  const [bolsilloMeta, setBolsilloMeta] = useState("");
  const [bolsilloEmoji, setBolsilloEmoji] = useState("🐷");

  const loadMonth = useCallback(async (m: number, y: number) => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load monthly plan
    const { data } = await supabase.from("dashboard_mensual")
      .select("*").eq("user_id", user.id).eq("month", m).eq("year", y).single();
    if (data) {
      setIngresoFijo(data.ingreso_fijo ? String(data.ingreso_fijo) : "");
      setIngresosOtros(data.ingresos_otros ?? []);
      setGastosFijosItems(data.gastos_fijos_items ?? []);
    } else {
      setIngresoFijo(""); setIngresosOtros([]); setGastosFijosItems([]);
    }

    // Load real gastos for this month from transactions
    const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const endDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const { data: gastosData } = await supabase.from("gastos")
      .select("valor").eq("user_id", user.id).gte("fecha", startDate).lte("fecha", endDate);
    setTotalGastosReales(gastosData?.reduce((s, g) => s + g.valor, 0) ?? 0);

    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadPermanent() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Redirect to onboarding if not completed
      const { data: profile } = await supabase
        .from("profiles").select("onboarding_completed").eq("id", user.id).single();
      if (profile && profile.onboarding_completed === false) {
        window.location.href = "/onboarding";
        return;
      }

      const [{ data: d }, { data: b }] = await Promise.all([
        supabase.from("deudas").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("bolsillos").select("*").eq("user_id", user.id).order("created_at"),
      ]);
      if (d) setDeudas(d);
      if (b) setBolsillos(b);
    }
    loadPermanent();
  }, []);

  useEffect(() => { loadMonth(month, year); }, [month, year, loadMonth]);

  async function saveData() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("dashboard_mensual").upsert({
        user_id: user.id, month, year,
        ingreso_fijo: parseFloat(ingresoFijo) || 0,
        ingresos_otros: ingresosOtros,
        gastos_fijos_items: gastosFijosItems,
        gastos_fijos: gastosFijosItems.reduce((s, i) => s + i.valor, 0),
      }, { onConflict: "user_id,month,year" });
    } finally {
      setSaving(false);
    }
  }

  async function addDeuda(e: React.FormEvent) {
    e.preventDefault();
    if (!deudaNombre || !deudaCuota || !deudaTotal) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("deudas")
      .insert({ user_id: user.id, nombre: deudaNombre, tipo: deudaTipo, cuota_mensual: parseFloat(deudaCuota), total_pendiente: parseFloat(deudaTotal) })
      .select().single();
    if (data) setDeudas([...deudas, data]);
    setDeudaNombre(""); setDeudaCuota(""); setDeudaTotal(""); setShowDeudaForm(false);
  }

  async function removeDeuda(id: string) {
    const supabase = createClient();
    await supabase.from("deudas").delete().eq("id", id);
    setDeudas(deudas.filter((d) => d.id !== id));
  }

  async function addBolsillo(e: React.FormEvent) {
    e.preventDefault();
    if (!bolsilloNombre || !bolsilloMeta) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("bolsillos")
      .insert({ user_id: user.id, nombre: bolsilloNombre, meta: parseFloat(bolsilloMeta), actual: 0, emoji: bolsilloEmoji })
      .select().single();
    if (data) setBolsillos([...bolsillos, data]);
    setBolsilloNombre(""); setBolsilloMeta(""); setBolsilloEmoji("🐷"); setShowBolsilloForm(false);
  }

  async function abonarBolsillo(id: string, amount: number) {
    const b = bolsillos.find((x) => x.id === id);
    if (!b) return;
    const newActual = Math.min(b.actual + amount, b.meta);
    const supabase = createClient();
    await supabase.from("bolsillos").update({ actual: newActual }).eq("id", id);
    setBolsillos(bolsillos.map((x) => x.id === id ? { ...x, actual: newActual } : x));
  }

  async function removeBolsillo(id: string) {
    const supabase = createClient();
    await supabase.from("bolsillos").delete().eq("id", id);
    setBolsillos(bolsillos.filter((b) => b.id !== id));
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  const totalIngresos = (parseFloat(ingresoFijo) || 0) + ingresosOtros.reduce((s, i) => s + i.valor, 0);
  const totalGastosFijos = gastosFijosItems.reduce((s, i) => s + i.valor, 0);
  const totalGastos = totalGastosFijos + totalGastosReales;
  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const totalDeudaPendiente = deudas.reduce((s, d) => s + d.total_pendiente, 0);
  const totalAhorro = bolsillos.reduce((s, b) => s + b.actual, 0);
  const totalMetaAhorro = bolsillos.reduce((s, b) => s + b.meta, 0);
  const disponible = totalIngresos - totalGastos - totalCuotas;
  const pctGastos = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
  const pctDisponible = totalIngresos > 0 ? (disponible / totalIngresos) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mi dashboard 📋
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Todo tu dinero en un solo lugar</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-[#ffb8e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
          </select>
          <button onClick={saveData} disabled={saving}
            className="bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            {saving ? "Guardando..." : "Guardar 💾"}
          </button>
        </div>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Dinero disponible */}
        <div className={`rounded-2xl p-6 border-2 ${disponible >= 0 ? "bg-white border-[#ec7fa9]" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 ${disponible >= 0 ? 'text-[#ec7fa9]' : 'text-red-400'}">
            <span className={disponible >= 0 ? "text-[#ec7fa9]" : "text-red-400"}>✨ Dinero disponible</span>
          </p>
          <p className={`text-3xl font-bold mt-1 ${disponible >= 0 ? "text-[#1a1a2e]" : "text-red-500"}`}>
            {fmt(disponible)}
          </p>
          <p className="text-xs text-[#1a1a2e]/40 mt-2">
            Ingresos − gastos − cuotas deudas
          </p>
          {totalIngresos > 0 && (
            <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${disponible >= 0 ? "bg-[#ec7fa9]" : "bg-red-400"}`}
                style={{ width: `${Math.min(Math.max(pctDisponible, 0), 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Total ahorro */}
        <div className="bg-white rounded-2xl border-2 border-[#ffb8e0] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ec7fa9] mb-1">🐷 Total ahorro</p>
          <p className="text-3xl font-bold text-[#1a1a2e] mt-1">{fmt(totalAhorro)}</p>
          {totalMetaAhorro > 0 && (
            <>
              <p className="text-xs text-[#1a1a2e]/40 mt-2">Meta total: {fmt(totalMetaAhorro)}</p>
              <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ec7fa9] rounded-full transition-all"
                  style={{ width: `${Math.min((totalAhorro / totalMetaAhorro) * 100, 100)}%` }}
                />
              </div>
            </>
          )}
          {totalMetaAhorro === 0 && (
            <p className="text-xs text-[#1a1a2e]/40 mt-2">Sin bolsillos de ahorro aún</p>
          )}
        </div>

        {/* Deudas pendientes */}
        <div className="bg-white rounded-2xl border-2 border-[#ffb8e0] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ec7fa9] mb-1">💳 Deudas pendientes</p>
          <p className="text-3xl font-bold text-[#1a1a2e] mt-1">{fmt(totalDeudaPendiente)}</p>
          <p className="text-xs text-[#1a1a2e]/40 mt-2">
            {deudas.length > 0
              ? `${deudas.filter(d => d.total_pendiente > 0).length} deuda${deudas.filter(d => d.total_pendiente > 0).length !== 1 ? "s" : ""} · ${fmt(totalCuotas)}/mes`
              : "Sin deudas registradas"}
          </p>
          {totalDeudaPendiente > 0 && (
            <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
              <div className="h-full bg-[#ffb8e0] rounded-full w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <SummaryCard label="Total ingresos" value={fmt(totalIngresos)} color="green" icon="💰" />
        <SummaryCard label="Gastos fijos" value={fmt(totalGastosFijos)} color="red" icon="📌" />
        <SummaryCard label="Gastos del mes" value={fmt(totalGastosReales)} color="red" icon="💸" />
        <SummaryCard label="% disponible" value={`${Math.max(pctDisponible, 0).toFixed(0)}%`} color={disponible >= 0 ? "blue" : "red"} icon="📊" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Ingresos */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <h2 className="font-semibold text-[#1a1a2e] mb-5 text-lg">💰 Ingresos del mes</h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]/70 mb-2 block">Ingreso fijo (salario)</label>
                <input type="number" value={ingresoFijo} onChange={(e) => setIngresoFijo(e.target.value)} placeholder="0"
                  className="w-full md:w-64 border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 text-right" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]/70 mb-2 block">Otros ingresos</label>
                <ListInput items={ingresosOtros}
                  onAdd={(item) => setIngresosOtros([...ingresosOtros, item])}
                  onRemove={(id) => setIngresosOtros(ingresosOtros.filter((i) => i.id !== id))}
                  placeholder="Ej: Freelance, renta..." fmt={fmt} />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#ffb8e0] flex justify-between">
              <span className="text-sm font-semibold text-[#1a1a2e]/60">Total ingresos</span>
              <span className="text-lg font-bold text-green-600">{fmt(totalIngresos)}</span>
            </div>
          </div>

          {/* Gastos fijos */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <h2 className="font-semibold text-[#1a1a2e] mb-1 text-lg">📌 Gastos fijos</h2>
            <p className="text-xs text-[#1a1a2e]/40 mb-4">Los que pagas igual todos los meses — arriendo, servicios, etc.</p>
            <ListInput items={gastosFijosItems}
              onAdd={(item) => setGastosFijosItems([...gastosFijosItems, item])}
              onRemove={(id) => setGastosFijosItems(gastosFijosItems.filter((i) => i.id !== id))}
              placeholder="Ej: Arriendo, internet..." fmt={fmt} />
            <div className="mt-4 pt-4 border-t border-[#ffb8e0] flex justify-between">
              <span className="text-sm font-semibold text-[#1a1a2e]/60">Total gastos fijos</span>
              <span className="text-lg font-bold text-red-400">{fmt(totalGastosFijos)}</span>
            </div>
          </div>

          {/* Gastos reales del mes */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-[#1a1a2e] text-lg">🛍️ Gastos del mes</h2>
              <Link href="/app/gastos"
                className="text-xs text-[#ec7fa9] font-semibold hover:underline">
                Ver y registrar →
              </Link>
            </div>
            <p className="text-xs text-[#1a1a2e]/40 mb-4">Transacciones registradas en Mis Gastos este mes</p>
            {totalGastosReales === 0 ? (
              <div className="text-center py-6 bg-[#ffedfa] rounded-xl">
                <p className="text-sm text-[#1a1a2e]/40">Sin transacciones este mes</p>
                <Link href="/app/gastos" className="text-xs text-[#ec7fa9] font-medium mt-1 inline-block hover:underline">
                  Ir a registrar gastos →
                </Link>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-[#ffedfa] rounded-xl px-5 py-4">
                <span className="text-sm text-[#1a1a2e]/60">Total registrado</span>
                <span className="text-2xl font-bold text-red-400">{fmt(totalGastosReales)}</span>
              </div>
            )}
          </div>

          {/* 60/30/10 + disponible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
              <h2 className="font-semibold text-[#1a1a2e] mb-1">📐 Método 60/30/10</h2>
              <p className="text-xs text-[#1a1a2e]/50 mb-4">Así va la distribución de tu dinero</p>
              <div className="flex flex-col gap-4">
                <ProgressBar label="Gastos (fijos + variables)" pct={pctGastos} target={60} value={fmt(totalGastos)} color="#ec7fa9" />
                <ProgressBar label="Libre / disponible" pct={Math.max(0, pctDisponible)} target={30} value={fmt(Math.max(0, disponible))} color="#3b82f6" />
              </div>
            </div>
            <div className={`rounded-2xl border p-6 flex flex-col justify-center items-center text-center ${
              disponible >= 0 ? "bg-[#f0fdf4] border-green-200" : "bg-[#ffedfa] border-[#ffb8e0]"
            }`}>
              <p className="text-4xl mb-3">{disponible >= 0 ? "✨" : "😰"}</p>
              <p className="text-lg font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                {disponible >= 0 ? "Dinero disponible" : "Estás en déficit"}
              </p>
              <p className={`text-3xl font-bold ${disponible >= 0 ? "text-green-600" : "text-[#ec7fa9]"}`}>
                {fmt(disponible)}
              </p>
              <p className="text-xs text-[#1a1a2e]/50 mt-2">
                {disponible >= 0 ? "¡Vas muy bien! Úsalo con intención 💕" : "Revisa tus gastos fijos y variables"}
              </p>
            </div>
          </div>

          {/* Deudas */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg">💳 Mis deudas</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Cuotas totales: <span className="font-semibold text-[#ec7fa9]">{fmt(totalCuotas)}/mes</span></p>
              </div>
              <button onClick={() => setShowDeudaForm(!showDeudaForm)}
                className="bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#ffb8e0]/30 transition-colors">
                + Agregar
              </button>
            </div>
            {showDeudaForm && (
              <form onSubmit={addDeuda} className="bg-[#ffedfa] rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Nombre</label>
                  <input type="text" value={deudaNombre} onChange={(e) => setDeudaNombre(e.target.value)} placeholder="Ej: Tarjeta Visa"
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" /></div>
                <div><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Tipo</label>
                  <select value={deudaTipo} onChange={(e) => setDeudaTipo(e.target.value)}
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
                    {TIPOS_DEUDA.map((t) => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Cuota mensual</label>
                  <input type="number" value={deudaCuota} onChange={(e) => setDeudaCuota(e.target.value)} placeholder="0"
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" /></div>
                <div><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Total pendiente</label>
                  <input type="number" value={deudaTotal} onChange={(e) => setDeudaTotal(e.target.value)} placeholder="0"
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" /></div>
                <div className="col-span-2">
                  <button type="submit" className="w-full bg-[#ec7fa9] text-white font-semibold py-2 rounded-xl text-sm hover:bg-[#d96d97]">Registrar deuda</button>
                </div>
              </form>
            )}
            {deudas.length === 0 ? (
              <div className="text-center py-8 text-[#1a1a2e]/30"><p className="text-2xl mb-2">🎉</p><p className="text-sm">¡Sin deudas registradas!</p></div>
            ) : (
              <div className="flex flex-col gap-3">{deudas.map((d) => <DeudaRow key={d.id} d={d} onRemove={removeDeuda} fmt={fmt} />)}</div>
            )}
          </div>

          {/* Bolsillos */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg">🐷 Bolsillos de ahorro</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Total ahorrado: <span className="font-semibold text-green-600">{fmt(totalAhorro)}</span></p>
              </div>
              <button onClick={() => setShowBolsilloForm(!showBolsilloForm)}
                className="bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#ffb8e0]/30 transition-colors">
                + Nuevo
              </button>
            </div>
            {showBolsilloForm && (
              <form onSubmit={addBolsillo} className="bg-[#ffedfa] rounded-2xl p-4 mb-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1"><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Nombre</label>
                    <input type="text" value={bolsilloNombre} onChange={(e) => setBolsilloNombre(e.target.value)} placeholder="Ej: Viaje a París"
                      className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" /></div>
                  <div className="w-24"><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Emoji</label>
                    <select value={bolsilloEmoji} onChange={(e) => setBolsilloEmoji(e.target.value)}
                      className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
                      {DEFAULT_EMOJIS.map((e) => <option key={e}>{e}</option>)}
                    </select></div>
                </div>
                <div><label className="text-xs text-[#1a1a2e]/60 mb-1 block">Meta de ahorro</label>
                  <input type="number" value={bolsilloMeta} onChange={(e) => setBolsilloMeta(e.target.value)} placeholder="0"
                    className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" /></div>
                <button type="submit" className="bg-[#ec7fa9] text-white font-semibold py-2 rounded-xl text-sm hover:bg-[#d96d97]">Crear bolsillo 🐷</button>
              </form>
            )}
            {bolsillos.length === 0 ? (
              <div className="text-center py-8 text-[#1a1a2e]/30"><p className="text-2xl mb-2">🐷</p><p className="text-sm">Crea tu primer bolsillo de ahorro</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bolsillos.map((b) => <BolsilloRow key={b.id} b={b} onAbonar={abonarBolsillo} onRemove={removeBolsillo} fmt={fmt} />)}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  const colors: Record<string, string> = { green: "text-green-600", red: "text-red-500", pink: "text-[#ec7fa9]", blue: "text-blue-600" };
  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
      <p className="text-xl mb-2">{icon}</p>
      <p className="text-xs text-[#1a1a2e]/50 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function ProgressBar({ label, pct, target, value, color }: { label: string; pct: number; target: number; value: string; color: string }) {
  const overTarget = pct > target;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#1a1a2e]/70">{label}</span>
        <span className={`text-xs font-semibold ${overTarget ? "text-[#ec7fa9]" : "text-[#1a1a2e]/60"}`}>
          {pct.toFixed(0)}% <span className="text-[#1a1a2e]/30">(meta: {target}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-[#1a1a2e]/50 mt-1 text-right">{value}</p>
    </div>
  );
}

function DeudaRow({ d, onRemove, fmt }: { d: Deuda; onRemove: (id: string) => void; fmt: (n: number) => string }) {
  const meses = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : "—";
  return (
    <div className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a2e] truncate">💳 {d.nombre}</p>
        <p className="text-xs text-[#1a1a2e]/50">{d.tipo}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        <div className="text-right"><p className="text-xs text-[#1a1a2e]/40">cuota/mes</p><p className="text-sm font-bold text-[#ec7fa9]">{fmt(d.cuota_mensual)}</p></div>
        <div className="text-right"><p className="text-xs text-[#1a1a2e]/40">pendiente</p><p className="text-sm font-bold text-[#1a1a2e]">{d.total_pendiente === 0 ? "✓ Pagada" : fmt(d.total_pendiente)}</p></div>
        <div className="text-right hidden md:block"><p className="text-xs text-[#1a1a2e]/40">meses</p><p className="text-sm font-bold text-[#1a1a2e]">{meses}</p></div>
        <button onClick={() => onRemove(d.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs ml-2">✕</button>
      </div>
    </div>
  );
}

function BolsilloRow({ b, onAbonar, onRemove, fmt }: { b: Bolsillo; onAbonar: (id: string, amount: number) => void; onRemove: (id: string) => void; fmt: (n: number) => string }) {
  const [abonoAmt, setAbonoAmt] = useState("");
  const pct = Math.min((b.actual / b.meta) * 100, 100);
  return (
    <div className="bg-[#ffedfa] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{b.emoji}</span>
          <div><p className="font-semibold text-[#1a1a2e] text-sm">{b.nombre}</p><p className="text-xs text-[#1a1a2e]/50">Meta: {fmt(b.meta)}</p></div>
        </div>
        <button onClick={() => onRemove(b.id)} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1"><span className="text-[#1a1a2e]/60">{fmt(b.actual)}</span><span className="font-semibold text-[#ec7fa9]">{pct.toFixed(0)}%</span></div>
        <div className="h-2.5 bg-[#ffb8e0] rounded-full overflow-hidden"><div className="h-full bg-[#ec7fa9] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      </div>
      {pct < 100 ? (
        <div className="flex gap-2">
          <input type="number" value={abonoAmt} onChange={(e) => setAbonoAmt(e.target.value)} placeholder="Abonar..."
            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
          <button onClick={() => { onAbonar(b.id, parseFloat(abonoAmt) || 0); setAbonoAmt(""); }}
            className="bg-[#ec7fa9] text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-[#d96d97]">+ Abonar</button>
        </div>
      ) : (
        <div className="text-center bg-green-50 border border-green-200 rounded-xl py-1.5"><p className="text-xs font-semibold text-green-600">🎉 ¡Meta alcanzada!</p></div>
      )}
    </div>
  );
}
