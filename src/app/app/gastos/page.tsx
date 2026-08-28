"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Inbox, X, Mic, Square, ChevronDown, ChevronUp, Pencil, Check, Plus } from "lucide-react";
import Link from "next/link";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Vivienda": "🏠", "Comida": "🍽️", "Transporte": "🚗", "Salud": "💊",
  "Educación": "📚", "Entretenimiento": "🎬", "Ropa": "👗", "Belleza": "💄",
  "Suscripciones": "📱", "Cafés": "☕", "Domicilios": "🛵", "Compras impulsivas": "🛍️", "Otros": "📦",
};
const CATEGORIES = Object.keys(CATEGORY_EMOJIS);
const PIE_COLORS = ["#ec7fa9","#ffb8e0","#f472b6","#fb7185","#f9a8d4","#e879f9","#c084fc","#a78bfa","#818cf8","#60a5fa","#34d399","#fbbf24","#f87171"];

type Gasto = { id: string; fecha: string; categoria: string; descripcion: string; valor: number };
type GastoFijo = { id: string; nombre: string; valor: number };
type AmySuggestion = { categoria: string; descripcion: string; valor: number };
type VoiceState = "idle" | "recording" | "parsing" | "confirmed";

export default function GastosPage() {
  const fmt = useFmt();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"diarios" | "fijos">("diarios");

  // Gastos diarios
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoria, setCategoria] = useState("Comida");
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [fecha, setFecha] = useState("");
  const [adding, setAdding] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Edit gasto diario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState("Comida");
  const [editDesc, setEditDesc] = useState("");
  const [editVal, setEditVal] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [saving, setSaving] = useState(false);

  // Gastos fijos
  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const [editingFijoId, setEditingFijoId] = useState<string | null>(null);
  const [editFijoNombre, setEditFijoNombre] = useState("");
  const [editFijoValor, setEditFijoValor] = useState("");
  const [showAddFijo, setShowAddFijo] = useState(false);
  const [newFijoNombre, setNewFijoNombre] = useState("");
  const [newFijoValor, setNewFijoValor] = useState("");

  // Voice
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [hasMic, setHasMic] = useState(false);
  const [suggestion, setSuggestion] = useState<AmySuggestion | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const [presupuestoDisponible, setPresupuestoDisponible] = useState<number | null>(null);

  useEffect(() => {
    load();
    setHasMic(!!(navigator.mediaDevices?.getUserMedia));
  }, []);

  // ── Voice ──────────────────────────────────────────────────────────────
  async function startVoice() {
    setVoiceError(null);
    setSuggestion(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e: { data: Blob }) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setVoiceState("parsing");
        try {
          const mimeType = recorder.mimeType || "audio/webm";
          const blob = new Blob(chunks, { type: mimeType });
          const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
          const fd = new FormData();
          fd.append("audio", blob, `r.${ext}`);
          const res = await fetch("/api/gastos/parse", { method: "POST", body: fd });
          const data = await res.json() as { categoria?: string; descripcion?: string; valor?: number };
          const cat = data.categoria && CATEGORIES.includes(data.categoria) ? data.categoria : "Otros";
          const desc = typeof data.descripcion === "string" ? data.descripcion : "";
          const val = typeof data.valor === "number" && data.valor > 0 ? data.valor : 0;
          if (desc || val) {
            const s = { categoria: cat, descripcion: desc, valor: val };
            setSuggestion(s);
            setCategoria(s.categoria);
            setDescripcion(s.descripcion);
            setValor(String(s.valor));
            setVoiceState("confirmed");
          } else {
            setVoiceError("No entendí bien, intenta de nuevo");
            setVoiceState("idle");
          }
        } catch {
          setVoiceError("Error al analizar, escríbelo manualmente");
          setVoiceState("idle");
        }
      };
      stopRef.current = () => recorder.stop();
      recorder.start();
      setVoiceState("recording");
      setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 10000);
    } catch {
      setVoiceError("No se pudo acceder al micrófono");
      setVoiceState("idle");
    }
  }

  function stopVoice() { stopRef.current?.(); }

  function resetVoice() {
    setSuggestion(null);
    setVoiceState("idle");
    setVoiceError(null);
    setDescripcion(""); setValor(""); setFecha("");
    setCategoria("Comida");
  }

  // ── Data ───────────────────────────────────────────────────────────────
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
      function monthsUntil(f: string): number {
        const date = new Date(f + "T12:00:00");
        const diff = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
        return Math.max(1, diff);
      }
      const totalBolsitas = (bolsillos ?? []).reduce((s, b) => {
        if (b.tipo === "metas" && b.fecha_meta && b.meta > 0)
          return s + Math.ceil(Math.max(0, b.meta - b.actual) / monthsUntil(b.fecha_meta));
        return s + (b.cuota_mensual || 0);
      }, 0);
      const totalCajitas = (cajitas ?? []).reduce((c, cajita) =>
        c + Math.ceil(Math.max(0, cajita.monto_total - cajita.actual) / monthsUntil(cajita.fecha_pago)), 0);
      setPresupuestoDisponible(ingresoFijo + ingresosOtros - gastosFijosTotal - totalCuotas - totalBolsitas - totalCajitas);
    }
    setLoading(false);
  }

  // ── Gastos diarios CRUD ────────────────────────────────────────────────
  async function saveGasto() {
    if (!descripcion || !valor) return;
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAdding(false); return; }
    const { data } = await supabase.from("gastos").insert({
      user_id: user.id,
      fecha: fecha || new Date().toISOString().split("T")[0],
      categoria, descripcion, valor: parseFloat(valor),
    }).select().single();
    if (data) setGastos([data, ...gastos]);
    resetVoice();
    setShowManual(false);
    setAdding(false);
  }

  function openEditGasto(g: Gasto) {
    setEditingId(g.id);
    setEditCat(g.categoria);
    setEditDesc(g.descripcion);
    setEditVal(String(g.valor));
    setEditFecha(g.fecha);
  }

  async function updateGasto(id: string) {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("gastos").update({
      categoria: editCat, descripcion: editDesc,
      valor: parseFloat(editVal), fecha: editFecha,
    }).eq("id", id).eq("user_id", user.id);
    setGastos(gastos.map(g => g.id === id
      ? { ...g, categoria: editCat, descripcion: editDesc, valor: parseFloat(editVal), fecha: editFecha }
      : g));
    setEditingId(null);
    setSaving(false);
  }

  async function removeGasto(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("gastos").delete().eq("id", id).eq("user_id", user.id);
    setGastos(gastos.filter(g => g.id !== id));
    if (editingId === id) setEditingId(null);
  }

  // ── Gastos fijos CRUD ──────────────────────────────────────────────────
  async function saveFijos(items: GastoFijo[]) {
    if (!dashboardId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = items.map(({ nombre, valor }) => ({ nombre, valor }));
    await supabase.from("dashboard_mensual").update({
      gastos_fijos_items: payload,
      gastos_fijos: items.reduce((s, i) => s + i.valor, 0),
    }).eq("id", dashboardId).eq("user_id", user.id);
  }

  async function addFijo(e: React.FormEvent) {
    e.preventDefault();
    if (!newFijoNombre || !newFijoValor) return;
    const nuevo: GastoFijo = { id: `fijo-${Date.now()}`, nombre: newFijoNombre, valor: parseFloat(newFijoValor) };
    const next = [...gastosFijos, nuevo];
    setGastosFijos(next);
    await saveFijos(next);
    setNewFijoNombre(""); setNewFijoValor(""); setShowAddFijo(false);
  }

  function openEditFijo(f: GastoFijo) {
    setEditingFijoId(f.id);
    setEditFijoNombre(f.nombre);
    setEditFijoValor(String(f.valor));
  }

  async function updateFijo(id: string) {
    const next = gastosFijos.map(f => f.id === id
      ? { ...f, nombre: editFijoNombre, valor: parseFloat(editFijoValor) }
      : f);
    setGastosFijos(next);
    setEditingFijoId(null);
    await saveFijos(next);
  }

  async function removeFijo(id: string) {
    const next = gastosFijos.filter(f => f.id !== id);
    setGastosFijos(next);
    await saveFijos(next);
    if (editingFijoId === id) setEditingFijoId(null);
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const filtered = gastos.filter(g => {
    const d = new Date(g.fecha + "T00:00:00");
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const totalVariable = filtered.reduce((s, g) => s + g.valor, 0);
  const totalFijos = gastosFijos.reduce((s, f) => s + f.valor, 0);
  const remaining = presupuestoDisponible !== null ? presupuestoDisponible - totalVariable : null;

  const byCategory = Object.entries(
    filtered.reduce((acc, g) => { acc[g.categoria] = (acc[g.categoria] || 0) + g.valor; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const inputCls = "border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 w-full";
  const inputSmCls = "border border-[#ffb8e0] rounded-lg px-3 py-2 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 w-full";

  function fmtFecha(iso: string): string {
    const today = new Date();
    const d = new Date(iso + "T00:00:00");
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (iso === todayStr) return "hoy";
    if (iso === yesterday.toISOString().split("T")[0]) return "ayer";
    const sameYear = d.getFullYear() === today.getFullYear();
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>Mis gastos</h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-0.5">Conoce en qué se va tu dinero</p>
        </div>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* Budget bar */}
      {presupuestoDisponible !== null && month === new Date().getMonth() && (
        <div className={`rounded-2xl border-2 px-5 py-4 mb-5 ${remaining !== null && remaining >= 0 ? "bg-white border-[#ec7fa9]" : "bg-red-50 border-red-200"}`}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div><p className="text-xs text-[#1a1a2e]/50">Para gastar</p><p className="text-base font-bold text-[#ec7fa9]">{fmt(presupuestoDisponible)}</p></div>
            <div><p className="text-xs text-[#1a1a2e]/50">Gastado</p><p className="text-base font-bold text-[#1a1a2e]">{fmt(totalVariable)}</p></div>
            <div><p className="text-xs text-[#1a1a2e]/50">Restante</p><p className={`text-base font-bold ${remaining !== null && remaining >= 0 ? "text-green-600" : "text-red-500"}`}>{remaining !== null ? fmt(remaining) : "—"}</p></div>
          </div>
          {presupuestoDisponible > 0 && (
            <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${remaining !== null && remaining >= 0 ? "bg-[#ec7fa9]" : "bg-red-400"}`}
                style={{ width: `${Math.min((totalVariable / presupuestoDisponible) * 100, 100)}%` }} />
            </div>
          )}
        </div>
      )}

      {/* ── ADD GASTO CARD ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] overflow-hidden mb-5">

        {hasMic && voiceState !== "confirmed" && (
          <div className="px-5 pt-5 pb-4">
            {voiceState === "idle" && (
              <button type="button" onClick={startVoice}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-gradient-to-b from-[#ffedfa] to-white border-2 border-dashed border-[#ffb8e0] hover:border-[#ec7fa9] hover:from-[#fce4f3] transition-all group">
                <div className="w-14 h-14 rounded-full bg-[#ec7fa9] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Mic size={24} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-[#ec7fa9]">Hablarle a Amy</p>
                <p className="text-xs text-[#1a1a2e]/40">Di el gasto y Amy lo registra</p>
              </button>
            )}
            {voiceState === "recording" && (
              <button type="button" onClick={stopVoice}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-red-50 border-2 border-red-300">
                <div className="w-14 h-14 rounded-full bg-red-400 flex items-center justify-center shadow-md animate-pulse">
                  <Square size={20} fill="white" className="text-white" />
                </div>
                <p className="text-sm font-semibold text-red-500">Escuchando…</p>
                <p className="text-xs text-red-400">Toca para detener</p>
              </button>
            )}
            {voiceState === "parsing" && (
              <div className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-[#ffedfa] border-2 border-[#ffb8e0]">
                <div className="w-14 h-14 rounded-full bg-[#ec7fa9]/20 flex items-center justify-center">
                  <span className="text-2xl animate-spin inline-block">✨</span>
                </div>
                <p className="text-sm font-semibold text-[#ec7fa9]">Amy está analizando…</p>
              </div>
            )}
            {voiceError && <p className="text-xs text-red-400 text-center mt-2">{voiceError}</p>}
          </div>
        )}

        {voiceState === "confirmed" && suggestion && (
          <div className="px-5 pt-5 pb-4">
            <div className="bg-gradient-to-br from-[#ffedfa] to-white rounded-2xl border border-[#ec7fa9] p-5 mb-3">
              <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-widest mb-3">Amy entendió ✨</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{CATEGORY_EMOJIS[suggestion.categoria] || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-[#1a1a2e] truncate">{suggestion.descripcion || "Gasto"}</p>
                  <p className="text-sm text-[#1a1a2e]/50">{suggestion.categoria}</p>
                </div>
                <p className="text-2xl font-bold text-[#ec7fa9] flex-shrink-0">{fmt(suggestion.valor)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveGasto} disabled={adding}
                  className="flex-1 bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                  {adding ? "Guardando…" : "✓ Guardar"}
                </button>
                <button onClick={() => { setShowManual(true); setVoiceState("idle"); setSuggestion(null); }}
                  className="px-4 py-3 border border-[#ffb8e0] rounded-xl text-sm text-[#1a1a2e]/60 hover:bg-[#ffedfa]">
                  Editar
                </button>
                <button onClick={resetVoice} className="px-3 py-3 border border-[#ffb8e0] rounded-xl text-[#1a1a2e]/30 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {hasMic && voiceState !== "confirmed" && (
          <div className="px-5 pb-1">
            <button type="button" onClick={() => setShowManual(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 transition-colors">
              {showManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showManual ? "Ocultar formulario" : "Agregar manualmente"}
            </button>
          </div>
        )}

        {(showManual || !hasMic) && voiceState !== "confirmed" && (
          <form onSubmit={e => { e.preventDefault(); saveGasto(); }} className="px-5 pb-5 pt-2 flex flex-col gap-3 border-t border-[#ffb8e0]/50">
            <div>
              <label className="text-xs font-medium text-[#1a1a2e]/50 mb-1 block">Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#1a1a2e]/50 mb-1 block">¿En qué gastaste?</label>
              <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="Almuerzo, café, Rappi…" required className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1a1a2e]/50 mb-1 block">Valor</label>
                <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0" required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1a1a2e]/50 mb-1 block">Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className={`${inputCls} text-[#1a1a2e]/50`} />
              </div>
            </div>
            <button type="submit" disabled={adding}
              className="w-full bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
              {adding ? "Guardando…" : "+ Agregar gasto"}
            </button>
          </form>
        )}
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("diarios")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "diarios" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}>
          Gastos diarios {filtered.length > 0 && <span className="ml-1 opacity-70">({filtered.length})</span>}
        </button>
        <button onClick={() => setTab("fijos")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "fijos" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}>
          Gastos fijos {gastosFijos.length > 0 && <span className="ml-1 opacity-70">({gastosFijos.length})</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-2xl border border-[#ffb8e0]" />)}
        </div>
      ) : tab === "diarios" ? (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#ffb8e0]">
              <Inbox size={32} className="mx-auto mb-3 text-[#ec7fa9] opacity-30" />
              <p className="font-semibold text-[#1a1a2e]">Sin gastos en {MONTHS[month]}</p>
              <p className="text-sm text-[#1a1a2e]/40 mt-1">Usa el micrófono o agrégalo manualmente</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-2xl border border-[#ffb8e0] p-3">
                  <p className="text-xs text-[#1a1a2e]/50">Gastado</p>
                  <p className="text-lg font-bold text-[#ec7fa9]">{fmt(totalVariable)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#ffb8e0] p-3">
                  <p className="text-xs text-[#1a1a2e]/50">Movimientos</p>
                  <p className="text-lg font-bold text-[#1a1a2e]">{filtered.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[#ffb8e0] p-3">
                  <p className="text-xs text-[#1a1a2e]/50">Top</p>
                  <p className="text-sm font-bold text-[#1a1a2e]">{byCategory[0] ? CATEGORY_EMOJIS[byCategory[0][0]] || "📦" : "—"}</p>
                  <p className="text-xs text-[#1a1a2e]/40 truncate">{byCategory[0]?.[0]}</p>
                </div>
              </div>

              {/* Transaction list — each row editable */}
              <div className="bg-white rounded-2xl border border-[#ffb8e0] overflow-hidden mb-4">
                {filtered.map((g, i) => (
                  <div key={g.id} className={i < filtered.length - 1 ? "border-b border-[#ffb8e0]/40" : ""}>
                    {editingId === g.id ? (
                      // Edit form
                      <div className="p-4 bg-[#ffedfa]">
                        <div className="flex flex-col gap-2 mb-3">
                          <select value={editCat} onChange={e => setEditCat(e.target.value)} className={inputSmCls}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                          </select>
                          <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className={inputSmCls} placeholder="Descripción" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} className={inputSmCls} placeholder="Valor" />
                            <input type="date" value={editFecha} onChange={e => setEditFecha(e.target.value)} className={`${inputSmCls} text-[#1a1a2e]/50`} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateGasto(g.id)} disabled={saving}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm">
                            <Check size={13} />{saving ? "Guardando…" : "Guardar"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-[#ffb8e0] rounded-xl text-sm text-[#1a1a2e]/50 hover:bg-white">
                            Cancelar
                          </button>
                          <button onClick={() => removeGasto(g.id)} className="px-3 py-2 border border-red-200 rounded-xl text-red-400 hover:bg-red-50">
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Read view — tap to edit
                      <button type="button" onClick={() => openEditGasto(g)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#ffedfa]/50 transition-colors text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl flex-shrink-0">{CATEGORY_EMOJIS[g.categoria] || "📦"}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1a1a2e] truncate">{g.descripcion}</p>
                            <p className="text-xs text-[#1a1a2e]/40">{fmtFecha(g.fecha)} · {g.categoria}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-sm font-bold text-[#ec7fa9]">{fmt(g.valor)}</span>
                          <Pencil size={12} className="text-[#1a1a2e]/20" />
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Category chart */}
              {byCategory.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
                  <h3 className="font-semibold text-[#1a1a2e] text-sm mb-3">Por categoría</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={byCategory.map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={2} dataKey="value">
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
                        <div className="flex gap-3">
                          <span className="text-[#1a1a2e]/40">{totalVariable > 0 ? ((val / totalVariable) * 100).toFixed(0) : 0}%</span>
                          <span className="font-semibold text-[#1a1a2e] w-20 text-right">{fmt(val)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        // ── GASTOS FIJOS TAB ──────────────────────────────────────────
        <>
          <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-4 py-3 mb-4">
            <p className="text-sm text-[#1a1a2e]/70">
              <span className="font-semibold text-[#ec7fa9]">Se repiten igual cada mes.</span>{" "}
              Arriendo, servicios, gym… Amy los descuenta de tu dinero disponible automáticamente.
            </p>
          </div>

          {gastosFijos.length === 0 && !showAddFijo ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#ffb8e0] mb-4">
              <p className="font-semibold text-[#1a1a2e]">Sin gastos fijos aún</p>
              <p className="text-sm text-[#1a1a2e]/40 mt-1 mb-4">Agrega los que pagas igual cada mes</p>
              <button onClick={() => setShowAddFijo(true)}
                className="bg-[#ec7fa9] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">
                + Agregar primero
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ffb8e0] overflow-hidden mb-4">
              {gastosFijos.map((f, i) => (
                <div key={f.id} className={i < gastosFijos.length - 1 || showAddFijo ? "border-b border-[#ffb8e0]/40" : ""}>
                  {editingFijoId === f.id ? (
                    <div className="p-4 bg-[#ffedfa]">
                      <div className="flex gap-2 mb-2">
                        <input value={editFijoNombre} onChange={e => setEditFijoNombre(e.target.value)} className={`${inputSmCls} flex-1`} placeholder="Nombre" />
                        <input type="number" value={editFijoValor} onChange={e => setEditFijoValor(e.target.value)} className={`${inputSmCls} w-28`} placeholder="Valor" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateFijo(f.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2 rounded-xl text-sm">
                          <Check size={13} />Guardar
                        </button>
                        <button onClick={() => setEditingFijoId(null)} className="px-4 py-2 border border-[#ffb8e0] rounded-xl text-sm text-[#1a1a2e]/50 hover:bg-white">
                          Cancelar
                        </button>
                        <button onClick={() => removeFijo(f.id)} className="px-3 py-2 border border-red-200 rounded-xl text-red-400 hover:bg-red-50">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openEditFijo(f)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#ffedfa]/50 transition-colors text-left">
                      <p className="text-sm font-medium text-[#1a1a2e]">{f.nombre}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#ec7fa9]">{fmt(f.valor)}<span className="text-xs font-normal text-[#1a1a2e]/40">/mes</span></span>
                        <Pencil size={12} className="text-[#1a1a2e]/20" />
                      </div>
                    </button>
                  )}
                </div>
              ))}

              {/* Inline add fijo form */}
              {showAddFijo && (
                <form onSubmit={addFijo} className="p-4 border-t border-[#ffb8e0]/40">
                  <div className="flex gap-2 mb-2">
                    <input value={newFijoNombre} onChange={e => setNewFijoNombre(e.target.value)} placeholder="Nombre (ej: Arriendo)" className={`${inputSmCls} flex-1`} />
                    <input type="number" value={newFijoValor} onChange={e => setNewFijoValor(e.target.value)} placeholder="Valor" className={`${inputSmCls} w-28`} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 flex items-center justify-center gap-1.5 bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2 rounded-xl text-sm">
                      <Check size={13} />Guardar
                    </button>
                    <button type="button" onClick={() => setShowAddFijo(false)} className="px-4 py-2 border border-[#ffb8e0] rounded-xl text-sm text-[#1a1a2e]/50 hover:bg-[#ffedfa]">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Total row */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#ffedfa] border-t border-[#ffb8e0]">
                <p className="text-xs font-semibold text-[#1a1a2e]/50 uppercase tracking-wide">Total fijos</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{fmt(totalFijos)}/mes</p>
              </div>
            </div>
          )}

          {!showAddFijo && gastosFijos.length > 0 && (
            <button onClick={() => setShowAddFijo(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#ffb8e0] hover:border-[#ec7fa9] rounded-2xl text-sm text-[#ec7fa9] font-medium hover:bg-[#ffedfa] transition-all">
              <Plus size={14} />Agregar gasto fijo
            </button>
          )}

          <Link href="/app" className="block text-center text-xs text-[#1a1a2e]/30 hover:text-[#ec7fa9] mt-3 transition-colors">
            También puedes editarlos desde el dashboard →
          </Link>
        </>
      )}
    </div>
  );
}
