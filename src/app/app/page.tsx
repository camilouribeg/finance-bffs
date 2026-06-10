"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  ShoppingBag,
  CreditCard,
  PiggyBank,
  BarChart3,
  Pencil,
  X,
  Info,
  Box,
} from "lucide-react";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

type LineItem = { id: string; descripcion: string; valor: number };
type Bolsillo = { id: string; nombre: string; meta: number; actual: number; emoji: string; tipo?: string; cuota_mensual?: number; fecha_meta?: string };
type Deuda = { id: string; nombre: string; tipo: string; cuota_mensual: number; total_pendiente: number };
type Cajita = { id: string; nombre: string; monto_total: number; fecha_pago: string; emoji: string; actual: number };

export default function DashboardPage() {
  const fmt = useFmt();
  const [month, setMonth] = useState(currentMonth);
  const [year] = useState(currentYear);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);

  // Editable ingresos/gastos (inline edit mode)
  const [editingIngresos, setEditingIngresos] = useState(false);
  const [editingGastos, setEditingGastos] = useState(false);

  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresosOtros, setIngresosOtros] = useState<LineItem[]>([]);
  const [gastosFijosItems, setGastosFijosItems] = useState<LineItem[]>([]);
  const [nuevoIngNombre, setNuevoIngNombre] = useState("");
  const [nuevoIngValor, setNuevoIngValor] = useState("");
  const [nuevoGastNombre, setNuevoGastNombre] = useState("");
  const [nuevoGastValor, setNuevoGastValor] = useState("");

  const [totalGastosReales, setTotalGastosReales] = useState(0);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [cajitas, setCajitas] = useState<Cajita[]>([]);
  const [bolsillos, setBolsillos] = useState<Bolsillo[]>([]);

  // First-week tip banner
  useEffect(() => {
    const key = "amy_dashboard_first_visit";
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, String(Date.now()));
      setShowTip(true);
    } else {
      const diff = Date.now() - parseInt(stored);
      if (diff < 7 * 24 * 60 * 60 * 1000) setShowTip(true);
    }
  }, []);

  const loadMonth = useCallback(async (m: number, y: number) => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("dashboard_mensual")
      .select("*").eq("user_id", user.id).eq("month", m + 1).eq("year", y).single();
    if (data) {
      setIngresoFijo(data.ingreso_fijo ? String(data.ingreso_fijo) : "");
      setIngresosOtros((data.ingresos_otros ?? []).map((i: Record<string, unknown>) => ({
        id: (i.id as string) ?? crypto.randomUUID(),
        descripcion: ((i.descripcion ?? i.nombre ?? "") as string),
        valor: i.valor as number,
      })));
      setGastosFijosItems((data.gastos_fijos_items ?? []).map((i: Record<string, unknown>) => ({
        id: (i.id as string) ?? crypto.randomUUID(),
        descripcion: ((i.descripcion ?? i.nombre ?? "") as string),
        valor: i.valor as number,
      })));
    } else {
      setIngresoFijo(""); setIngresosOtros([]); setGastosFijosItems([]);
    }
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
      const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single();
      if (profile && profile.onboarding_completed === false) { window.location.href = "/onboarding"; return; }
      const [{ data: d }, { data: b }, { data: c }] = await Promise.all([
        supabase.from("deudas").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("bolsillos").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("cajitas").select("*").eq("user_id", user.id).order("fecha_pago"),
      ]);
      if (d) setDeudas(d);
      if (b) setBolsillos(b);
      if (c) setCajitas(c);
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
        user_id: user.id, month: month + 1, year,
        ingreso_fijo: parseFloat(ingresoFijo) || 0,
        ingresos_otros: ingresosOtros,
        gastos_fijos_items: gastosFijosItems,
        gastos_fijos: gastosFijosItems.reduce((s, i) => s + i.valor, 0),
      }, { onConflict: "user_id,month,year" });
    } finally {
      setSaving(false);
    }
  }

  function monthsUntilDate(fechaStr: string): number {
    const now = new Date();
    const fecha = new Date(fechaStr + "T12:00:00");
    const diff = (fecha.getFullYear() - now.getFullYear()) * 12 + (fecha.getMonth() - now.getMonth());
    return Math.max(1, diff);
  }

  const totalIngresos = (parseFloat(ingresoFijo) || 0) + ingresosOtros.reduce((s, i) => s + i.valor, 0);
  const totalGastosFijos = gastosFijosItems.reduce((s, i) => s + i.valor, 0);
  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const totalDeudaPendiente = deudas.reduce((s, d) => s + d.total_pendiente, 0);
  const totalAhorro = bolsillos.reduce((s, b) => s + b.actual, 0);
  const totalMetaAhorro = bolsillos.reduce((s, b) => s + b.meta, 0);
  const totalCajitasMensual = cajitas.reduce((s, c) => {
    const falta = Math.max(0, c.monto_total - c.actual);
    return s + Math.ceil(falta / monthsUntilDate(c.fecha_pago));
  }, 0);
  const totalBolsitasMensual = bolsillos.reduce((s, b) => {
    if (b.tipo === "metas" && b.fecha_meta && b.meta > 0) return s + Math.ceil(Math.max(0, b.meta - b.actual) / monthsUntilDate(b.fecha_meta));
    return s + (b.cuota_mensual || 0);
  }, 0);
  const disponible = totalIngresos - totalGastosFijos - totalCajitasMensual - totalBolsitasMensual - totalCuotas;
  const pctDisponible = totalIngresos > 0 ? (disponible / totalIngresos) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">

      {/* First-week tip banner */}
      {showTip && (
        <div className="flex items-start gap-3 bg-white border border-[#ffb8e0] rounded-2xl px-5 py-4 mb-6">
          <Info size={16} className="text-[#ec7fa9] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#1a1a2e]/70 flex-1">
            <span className="font-semibold text-[#ec7fa9]">Este es tu panel de monitoreo.</span> Aquí puedes ver el resumen de tus finanzas de un vistazo. Para registrar gastos, gestionar deudas, cajitas o bolsillos, usa el menú de la izquierda.
          </p>
          <button onClick={() => setShowTip(false)} className="text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>Mis finanzas</h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Todo tu dinero en un solo lugar</p>
        </div>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-[#ffb8e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
        </select>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`rounded-2xl p-6 border-2 ${loading ? "bg-white border-[#ffb8e0]" : disponible >= 0 ? "bg-white border-[#ec7fa9]" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1">
            <span className={loading ? "text-[#1a1a2e]/30" : disponible >= 0 ? "text-[#ec7fa9]" : "text-red-400"}>Dinero disponible</span>
          </p>
          {loading ? (
            <div className="h-9 w-36 bg-[#ffb8e0] rounded-xl animate-pulse mt-1" />
          ) : (
            <p className={`text-3xl font-bold mt-1 ${disponible >= 0 ? "text-[#1a1a2e]" : "text-red-500"}`}>{fmt(disponible)}</p>
          )}
          <p className="text-xs text-[#1a1a2e]/40 mt-2">Ingresos − GF − Cajitas − Bolsitas − Deudas</p>
          {!loading && totalIngresos > 0 && (
            <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${disponible >= 0 ? "bg-[#ec7fa9]" : "bg-red-400"}`}
                style={{ width: `${Math.min(Math.max(pctDisponible, 0), 100)}%` }} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#ffb8e0] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ec7fa9] mb-1 flex items-center gap-1.5"><PiggyBank size={13} />Total ahorro</p>
          {loading ? (
            <div className="h-9 w-28 bg-[#ffb8e0] rounded-xl animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-bold text-[#1a1a2e] mt-1">{fmt(totalAhorro)}</p>
          )}
          {!loading && (totalMetaAhorro > 0 ? (
            <>
              <p className="text-xs text-[#1a1a2e]/40 mt-2">Meta total: {fmt(totalMetaAhorro)}</p>
              <div className="mt-3 h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
                <div className="h-full bg-[#ec7fa9] rounded-full transition-all" style={{ width: `${Math.min((totalAhorro / totalMetaAhorro) * 100, 100)}%` }} />
              </div>
            </>
          ) : <p className="text-xs text-[#1a1a2e]/40 mt-2">Sin bolsillos de ahorro aún</p>)}
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#ffb8e0] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ec7fa9] mb-1 flex items-center gap-1.5"><CreditCard size={13} />Deudas pendientes</p>
          {loading ? (
            <div className="h-9 w-32 bg-[#ffb8e0] rounded-xl animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-bold text-[#1a1a2e] mt-1">{fmt(totalDeudaPendiente)}</p>
          )}
          {!loading && (
            <p className="text-xs text-[#1a1a2e]/40 mt-2">
              {deudas.length > 0 ? `${deudas.length} deuda${deudas.length !== 1 ? "s" : ""} · ${fmt(totalCuotas)}/mes` : "Sin deudas registradas"}
            </p>
          )}
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <SummaryCard label="Total ingresos" value={fmt(totalIngresos)} color="green" icon={<TrendingUp size={16} />} />
        <SummaryCard label="Gastos fijos" value={fmt(totalGastosFijos)} color="red" icon={<Receipt size={16} />} />
        <SummaryCard label="Gastos del mes" value={fmt(totalGastosReales)} color="red" icon={<ShoppingBag size={16} />} />
        <SummaryCard label="% disponible" value={`${Math.max(pctDisponible, 0).toFixed(0)}%`} color={disponible >= 0 ? "blue" : "red"} icon={<BarChart3 size={16} />} />
      </div>

      {loading ? <div className="text-center py-20 text-[#1a1a2e]/30">Cargando...</div> : (
        <div className="flex flex-col gap-6">

          {/* Ingresos — read-only with inline edit */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><TrendingUp size={18} className="text-[#ec7fa9]" />Ingresos del mes</h2>
              <button onClick={() => { if (editingIngresos) saveData(); setEditingIngresos(!editingIngresos); }}
                className="flex items-center gap-1.5 text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                <Pencil size={11} />{editingIngresos ? (saving ? "Guardando..." : "Guardar") : "Editar"}
              </button>
            </div>
            {editingIngresos ? (
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

          {/* Gastos fijos — read-only with inline edit */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><Receipt size={18} className="text-[#ec7fa9]" />Gastos fijos</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Los que pagas igual todos los meses</p>
              </div>
              <button onClick={() => { if (editingGastos) saveData(); setEditingGastos(!editingGastos); }}
                className="flex items-center gap-1.5 text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                <Pencil size={11} />{editingGastos ? (saving ? "Guardando..." : "Guardar") : "Editar"}
              </button>
            </div>
            {editingGastos ? (
              <div>
                {gastosFijosItems.map((i) => (
                  <div key={i.id} className="flex items-center justify-between py-1.5 border-b border-[#ffb8e0]/50 last:border-0">
                    <span className="text-sm text-[#1a1a2e]/70">{i.descripcion}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{fmt(i.valor)}</span>
                      <button onClick={() => setGastosFijosItems(gastosFijosItems.filter(x => x.id !== i.id))} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input value={nuevoGastNombre} onChange={e => setNuevoGastNombre(e.target.value)} placeholder="Ej: Arriendo"
                    className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none" />
                  <input type="number" value={nuevoGastValor} onChange={e => setNuevoGastValor(e.target.value)} placeholder="0"
                    className="w-28 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none text-right" />
                  <button onClick={() => { if (!nuevoGastNombre || !nuevoGastValor) return; setGastosFijosItems([...gastosFijosItems, { id: crypto.randomUUID(), descripcion: nuevoGastNombre, valor: parseFloat(nuevoGastValor) }]); setNuevoGastNombre(""); setNuevoGastValor(""); }}
                    className="bg-[#ec7fa9] text-white px-3 py-2 rounded-xl font-semibold hover:bg-[#d96d97]">+</button>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {gastosFijosItems.length === 0 ? (
                  <p className="text-sm text-[#1a1a2e]/30 py-4 text-center">Sin gastos fijos registrados</p>
                ) : gastosFijosItems.map(i => (
                  <div key={i.id} className="flex justify-between items-center py-2 border-b border-[#ffb8e0]/40 last:border-0">
                    <span className="text-sm text-[#1a1a2e]/60">{i.descripcion}</span>
                    <span className="text-sm font-semibold text-[#1a1a2e]">{fmt(i.valor)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-[#ffb8e0] flex justify-between">
              <span className="text-sm font-semibold text-[#1a1a2e]/60">Total gastos fijos</span>
              <span className="text-lg font-bold text-red-400">{fmt(totalGastosFijos)}</span>
            </div>
          </div>

          {/* Gastos del mes — read-only, link to section */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><ShoppingBag size={18} className="text-[#ec7fa9]" />Gastos del mes</h2>
              <Link href="/app/gastos" className="text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                Ir a Mis gastos →
              </Link>
            </div>
            <p className="text-xs text-[#1a1a2e]/40 mb-4">Transacciones registradas este mes</p>
            {totalGastosReales === 0 ? (
              <div className="text-center py-6 bg-[#ffedfa] rounded-xl">
                <p className="text-sm text-[#1a1a2e]/40">Sin transacciones este mes</p>
                <Link href="/app/gastos" className="text-xs text-[#ec7fa9] font-medium mt-1 inline-block hover:underline">Registrar gastos →</Link>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-[#ffedfa] rounded-xl px-5 py-4">
                <span className="text-sm text-[#1a1a2e]/60">Total registrado</span>
                <span className="text-2xl font-bold text-red-400">{fmt(totalGastosReales)}</span>
              </div>
            )}
          </div>

          {/* Cajitas — read-only, link to section */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><Box size={18} className="text-[#ec7fa9]" />Cajitas</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Reserva mensual: <span className="font-semibold text-[#ec7fa9]">{fmt(totalCajitasMensual)}/mes</span></p>
              </div>
              <Link href="/app/cajitas" className="text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                Gestionar →
              </Link>
            </div>
            {cajitas.length === 0 ? (
              <div className="text-center py-6 bg-[#ffedfa] rounded-xl">
                <p className="text-sm text-[#1a1a2e]/40">Sin cajitas creadas</p>
                <Link href="/app/cajitas" className="text-xs text-[#ec7fa9] font-medium mt-1 inline-block hover:underline">Crear cajita →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cajitas.map((c) => {
                  const falta = Math.max(0, c.monto_total - c.actual);
                  const pct = c.monto_total > 0 ? Math.min((c.actual / c.monto_total) * 100, 100) : 0;
                  const cuotaMes = Math.ceil(falta / monthsUntilDate(c.fecha_pago));
                  return (
                    <div key={c.id} className="bg-[#ffedfa] rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.emoji}</span>
                          <p className="text-sm font-semibold text-[#1a1a2e]">{c.nombre}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#1a1a2e]/40">reserva/mes</p>
                          <p className="text-sm font-bold text-[#ec7fa9]">{fmt(cuotaMes)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#1a1a2e]/60">{fmt(c.actual)} ahorrado</span>
                        <span className="font-semibold text-[#1a1a2e]">{pct.toFixed(0)}% · meta {fmt(c.monto_total)}</span>
                      </div>
                      <div className="h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ec7fa9] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deudas — read-only, link to section */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><CreditCard size={18} className="text-[#ec7fa9]" />Mis deudas</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Cuotas totales: <span className="font-semibold text-[#ec7fa9]">{fmt(totalCuotas)}/mes</span></p>
              </div>
              <Link href="/app/deudas" className="text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                Gestionar →
              </Link>
            </div>
            {deudas.length === 0 ? (
              <p className="text-sm text-[#1a1a2e]/30 text-center py-6">Sin deudas registradas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {deudas.map((d) => {
                  const meses = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : "—";
                  return (
                    <div key={d.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a2e]">{d.nombre}</p>
                        <p className="text-xs text-[#1a1a2e]/50">{d.tipo}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right"><p className="text-xs text-[#1a1a2e]/40">cuota/mes</p><p className="text-sm font-bold text-[#ec7fa9]">{fmt(d.cuota_mensual)}</p></div>
                        <div className="text-right hidden md:block"><p className="text-xs text-[#1a1a2e]/40">pendiente</p><p className="text-sm font-bold text-[#1a1a2e]">{d.total_pendiente === 0 ? "✓ Pagada" : fmt(d.total_pendiente)}</p></div>
                        <div className="text-right hidden md:block"><p className="text-xs text-[#1a1a2e]/40">meses</p><p className="text-sm font-bold text-[#1a1a2e]">{meses}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bolsillos — read-only, link to section */}
          <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2"><PiggyBank size={18} className="text-[#ec7fa9]" />Bolsillos de ahorro</h2>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">Total ahorrado: <span className="font-semibold text-green-600">{fmt(totalAhorro)}</span></p>
              </div>
              <Link href="/app/ahorro" className="text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors font-medium">
                Gestionar →
              </Link>
            </div>
            {bolsillos.length === 0 ? (
              <div className="text-center py-8 text-[#1a1a2e]/30"><PiggyBank size={28} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Sin bolsillos de ahorro aún</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bolsillos.map((b) => {
                  const pct = b.meta > 0 ? Math.min((b.actual / b.meta) * 100, 100) : 0;
                  const isMeta = b.tipo === "metas";
                  return (
                    <div key={b.id} className="bg-[#ffedfa] rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{b.emoji}</span>
                        <div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${isMeta ? "text-purple-500 bg-purple-50 border border-purple-200" : "text-[#ec7fa9] bg-white border border-[#ffb8e0]"}`}>
                            {isMeta ? "Meta de ahorro" : "Fondo permanente"}
                          </span>
                          <p className="font-semibold text-[#1a1a2e] text-sm mt-0.5">{b.nombre}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-[#1a1a2e]/60">{fmt(b.actual)}</span><span className="font-semibold text-[#ec7fa9]">{pct.toFixed(0)}%</span></div>
                      <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden"><div className="h-full bg-[#ec7fa9] rounded-full" style={{ width: `${pct}%` }} /></div>
                      <p className="text-xs text-[#1a1a2e]/40 mt-1.5">Meta: {fmt(b.meta)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = { green: "text-green-600", red: "text-red-500", pink: "text-[#ec7fa9]", blue: "text-blue-600" };
  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
      <div className="text-[#ec7fa9] mb-2">{icon}</div>
      <p className="text-xs text-[#1a1a2e]/50 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
