"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { ordenarDeudas, METHOD_META, type DebtMethod } from "@/lib/debtMethods";
import { CreditCard, Landmark, Home, Car, Users, FileText, Check, X, Plus, Lightbulb, PartyPopper, TrendingDown } from "lucide-react";

type Deuda = { id: string; nombre: string; tipo: string; cuota_mensual: number; total_pendiente: number; tasa: number | null; saldo_inicial: number | null };

const TIPOS = ["Tarjeta de crédito", "Préstamo personal", "Crédito hipotecario", "Crédito de vehículo", "Deuda familiar", "Otro"];

function mesActual() {
  const now = new Date();
  return { mes: now.getMonth() + 1, anio: now.getFullYear() };
}

// Estimación de amortización simple: si conocemos la tasa, podemos calcular
// cuánto de la cuota va a intereses y cuánto reduce el capital (4.8: "salvo
// que exista información suficiente para hacerlo correctamente").
function abonoACapitalEstimado(deuda: Deuda): number | null {
  if (deuda.tasa == null || deuda.tasa <= 0) return null;
  const interesMensual = deuda.total_pendiente * (deuda.tasa / 100 / 12);
  return Math.max(0, deuda.cuota_mensual - interesMensual);
}

function TipoIcon({ tipo }: { tipo: string }) {
  const props = { size: 16, className: "text-[#ec7fa9] flex-shrink-0", strokeWidth: 1.75 };
  if (tipo === "Tarjeta de crédito") return <CreditCard {...props} />;
  if (tipo === "Préstamo personal") return <Landmark {...props} />;
  if (tipo === "Crédito hipotecario") return <Home {...props} />;
  if (tipo === "Crédito de vehículo") return <Car {...props} />;
  if (tipo === "Deuda familiar") return <Users {...props} />;
  return <FileText {...props} />;
}

export default function DeudasPage() {
  const fmt = useFmt();
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Tarjeta de crédito");
  const [totalPendiente, setTotalPendiente] = useState("");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [tasa, setTasa] = useState("");

  // Metodología elegida en el onboarding (profiles.debt_method)
  const [metodo, setMetodo] = useState<DebtMethod>("snowball");

  // Abono state
  const [abonarId, setAbonarId] = useState<string | null>(null);
  const [abonarMonto, setAbonarMonto] = useState("");
  const [abonarUsar, setAbonarUsar] = useState<"cuota" | "abono_capital">("cuota");

  // Actualizar saldo real (4.8)
  const [editSaldoId, setEditSaldoId] = useState<string | null>(null);
  const [editSaldoValor, setEditSaldoValor] = useState("");

  // Editar tasa de interés (para poder estimar el abono a capital de la cuota)
  const [editTasaId, setEditTasaId] = useState<string | null>(null);
  const [editTasaValor, setEditTasaValor] = useState("");

  // Check mensual por deuda (4.7): item_id -> { id de la confirmacion, abono a
  // capital que se aplico por esa confirmacion (0 si no habia tasa) }. Guardar
  // el abono aparte permite revertir exactamente lo mismo al autocorregir.
  const [confirmadas, setConfirmadas] = useState<Record<string, { id: string; abonoCapital: number }>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { mes, anio } = mesActual();
    const [{ data }, { data: perfil }, { data: confs }] = await Promise.all([
      supabase.from("deudas").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("debt_method").eq("id", user.id).single(),
      supabase.from("confirmaciones_mensuales").select("id, item_id, tipo_pago, monto")
        .eq("user_id", user.id).eq("tipo", "deuda").eq("mes", mes).eq("anio", anio),
    ]);
    const m = (perfil?.debt_method as DebtMethod) || "snowball";
    setMetodo(m);
    if (data) setDeudas(ordenarDeudas(data as Deuda[], m));
    if (confs) {
      setConfirmadas(Object.fromEntries(
        confs.map(c => [c.item_id, { id: c.id, abonoCapital: c.tipo_pago === "cuota" ? (c.monto ?? 0) : 0 }])
      ));
    }
    setLoading(false);
  }

  // Registrar movimiento de "abono adicional a capital" (custom, siempre reduce
  // el saldo por el monto ingresado) y marcar el check del mes de paso. El
  // abono ya se aplicó por su propio flujo explícito, así que si luego se
  // desmarca el check no debe revertir esa plata (abonoCapital: 0 acá).
  async function confirmarMes(deudaId: string, tipoPago: "abono_capital", monto: number, saldoResultante: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { mes, anio } = mesActual();
    const { data } = await supabase.from("confirmaciones_mensuales")
      .upsert(
        { user_id: user.id, tipo: "deuda", item_id: deudaId, mes, anio, tipo_pago: tipoPago, monto, saldo_resultante: saldoResultante, confirmado_at: new Date().toISOString() },
        { onConflict: "user_id,tipo,item_id,mes,anio" }
      ).select().single();
    if (data) setConfirmadas(prev => ({ ...prev, [deudaId]: { id: data.id, abonoCapital: 0 } }));
  }

  // Confirmar la cuota de este mes: si hay tasa, aplica el abono a capital
  // estimado; si no, solo deja constancia sin tocar el saldo. Usado tanto por
  // el check individual (4.7) como por "Registrar pago" > "Pago de mi cuota".
  async function confirmarCuotaDelMes(deudaId: string) {
    const deuda = deudas.find(d => d.id === deudaId);
    if (!deuda) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const abonoCapital = abonoACapitalEstimado(deuda) ?? 0;
    const nuevoSaldo = abonoCapital > 0 ? Math.max(0, deuda.total_pendiente - abonoCapital) : deuda.total_pendiente;
    setDeudas(prev => prev.map(d => d.id === deudaId ? { ...d, total_pendiente: nuevoSaldo } : d));
    const { mes, anio } = mesActual();
    const [{ data }] = await Promise.all([
      supabase.from("confirmaciones_mensuales")
        .upsert(
          { user_id: user.id, tipo: "deuda", item_id: deudaId, mes, anio, tipo_pago: "cuota", monto: abonoCapital, saldo_resultante: nuevoSaldo, confirmado_at: new Date().toISOString() },
          { onConflict: "user_id,tipo,item_id,mes,anio" }
        ).select().single(),
      abonoCapital > 0
        ? supabase.from("deudas").update({ total_pendiente: nuevoSaldo }).eq("id", deudaId).eq("user_id", user.id)
        : Promise.resolve(null),
    ]);
    if (data) setConfirmadas(prev => ({ ...prev, [deudaId]: { id: data.id, abonoCapital } }));
  }

  async function desconfirmarCuotaDelMes(deudaId: string) {
    const existing = confirmadas[deudaId];
    const deuda = deudas.find(d => d.id === deudaId);
    if (!existing || !deuda) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const nuevoSaldo = deuda.total_pendiente + existing.abonoCapital;
    setDeudas(prev => prev.map(d => d.id === deudaId ? { ...d, total_pendiente: nuevoSaldo } : d));
    setConfirmadas(prev => { const next = { ...prev }; delete next[deudaId]; return next; });
    await Promise.all([
      supabase.from("confirmaciones_mensuales").delete().eq("id", existing.id).eq("user_id", user.id),
      existing.abonoCapital > 0
        ? supabase.from("deudas").update({ total_pendiente: nuevoSaldo }).eq("id", deudaId).eq("user_id", user.id)
        : Promise.resolve(null),
    ]);
  }

  function irARegistrarPago(id: string, modo: "cuota" | "abono_capital") {
    setEditSaldoId(null);
    setAbonarId(id);
    setAbonarUsar(modo);
    setAbonarMonto("");
    requestAnimationFrame(() => {
      document.getElementById(`deuda-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function toggleConfirmado(deudaId: string) {
    if (confirmadas[deudaId]) {
      await desconfirmarCuotaDelMes(deudaId);
    } else {
      await confirmarCuotaDelMes(deudaId);
    }
  }


  async function addDeuda(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !totalPendiente || !cuotaMensual) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("deudas").insert({
      user_id: user.id,
      nombre,
      tipo,
      total_pendiente: parseFloat(totalPendiente),
      saldo_inicial: parseFloat(totalPendiente),
      cuota_mensual: parseFloat(cuotaMensual),
      tasa: tasa ? parseFloat(tasa) : null,
    }).select().single();
    if (data) setDeudas(prev => ordenarDeudas([...prev, data as Deuda], metodo));
    setNombre(""); setTipo("Tarjeta de crédito"); setTotalPendiente(""); setCuotaMensual(""); setTasa("");
    setShowForm(false);
  }

  async function registrarAbono(id: string) {
    const deuda = deudas.find(d => d.id === id);
    if (!deuda) return;

    if (abonarUsar === "cuota") {
      setAbonarId(null); setAbonarMonto(""); setAbonarUsar("cuota");
      confirmarCuotaDelMes(id);
      return;
    }

    const monto = parseFloat(abonarMonto);
    if (!monto || monto <= 0) return;
    const nuevo = Math.max(0, deuda.total_pendiente - monto);
    setDeudas(deudas.map(d => d.id === id ? { ...d, total_pendiente: nuevo } : d));
    setAbonarId(null); setAbonarMonto(""); setAbonarUsar("cuota");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([
      supabase.from("deudas").update({ total_pendiente: nuevo }).eq("id", id).eq("user_id", user.id),
      confirmarMes(id, "abono_capital", monto, nuevo),
    ]);
  }

  async function actualizarTasa(id: string) {
    const nueva = editTasaValor.trim() === "" ? null : parseFloat(editTasaValor);
    if (nueva !== null && (isNaN(nueva) || nueva < 0)) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deudas").update({ tasa: nueva }).eq("id", id).eq("user_id", user.id);
    setDeudas(deudas.map(d => d.id === id ? { ...d, tasa: nueva } : d));
    setEditTasaId(null); setEditTasaValor("");
  }

  async function actualizarSaldoReal(id: string) {
    const nuevo = parseFloat(editSaldoValor);
    if (isNaN(nuevo) || nuevo < 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deudas").update({ total_pendiente: nuevo }).eq("id", id).eq("user_id", user.id);
    setDeudas(deudas.map(d => d.id === id ? { ...d, total_pendiente: nuevo } : d));
    setEditSaldoId(null); setEditSaldoValor("");
  }

  async function removeDeuda(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deudas").delete().eq("id", id).eq("user_id", user.id);
    await supabase.from("confirmaciones_mensuales").delete().eq("item_id", id).eq("user_id", user.id).eq("tipo", "deuda");
    setDeudas(deudas.filter(d => d.id !== id));
    setConfirmadas(prev => { const next = { ...prev }; delete next[id]; return next; });
  }

  const totalPend = deudas.reduce((s, d) => s + d.total_pendiente, 0);
  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const activas = deudas.filter(d => d.total_pendiente > 0);
  const pagosListos = activas.filter(d => confirmadas[d.id]).length;
  const meta = METHOD_META[metodo];
  // En el método equilibrado no hay una sola deuda prioritaria: todas avanzan juntas.
  const primeraDeuda = meta.unaPrioridad && activas.length > 0 ? activas[0] : null;

  // Progreso (4.9): basado en saldo_inicial (fijo al crear la deuda) vs. el saldo real de hoy.
  const totalSaldoInicial = deudas.reduce((s, d) => s + (d.saldo_inicial ?? d.total_pendiente), 0);
  const reduccionAcumulada = Math.max(0, totalSaldoInicial - totalPend);
  const pctReduccion = totalSaldoInicial > 0 ? (reduccionAcumulada / totalSaldoInicial) * 100 : 0;
  const todasLiquidadas = deudas.length > 0 && activas.length === 0;

  let siguienteObjetivo = "";
  if (primeraDeuda) {
    siguienteObjetivo = confirmadas[primeraDeuda.id]
      ? `Te faltan ${fmt(primeraDeuda.total_pendiente)} para liquidar ${primeraDeuda.nombre}. Cualquier abono extra te acerca.`
      : `Completa el pago de este mes de ${primeraDeuda.nombre} para seguir avanzando.`;
  } else if (activas.length > 0) {
    siguienteObjetivo = "Sigue pagando todas tus cuotas al día este mes.";
  }

  const inputCls = "w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mis deudas
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Tu camino para quedar libre de deudas</p>
          {!loading && deudas.length > 0 && (
            <p className="text-xs text-[#ec7fa9] font-medium mt-1.5">
              {meta.emoji} Método {meta.nombre.toLowerCase()}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={14} /> Agregar deuda
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Nueva deuda</h2>
          <form onSubmit={addDeuda} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Tarjeta Bancolombia" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Saldo pendiente</label>
                <input type="number" value={totalPendiente} onChange={e => setTotalPendiente(e.target.value)} placeholder="Ej: 5.000.000" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Cuota mensual</label>
                <input type="number" value={cuotaMensual} onChange={e => setCuotaMensual(e.target.value)} placeholder="Ej: 300.000" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#1a1a2e]/50 mb-1 block">
                Tasa de interés anual <span className="text-[#1a1a2e]/30">(opcional)</span>
              </label>
              <input type="number" step="0.01" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Ej: 28.5" className={inputCls} />
              {metodo === "avalanche" && (
                <p className="text-[11px] text-[#ec7fa9] mt-1">
                  Con tu método {METHOD_META.avalanche.nombre.toLowerCase()} usamos la tasa para saber cuál atacar primero.
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-2.5 rounded-xl hover:bg-[#ffedfa] text-sm">Cancelar</button>
              <button type="submit"
                className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-2.5 rounded-xl text-sm">Guardar deuda</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-white rounded-2xl border border-[#ffb8e0]" />
            <div className="h-24 bg-white rounded-2xl border border-[#ffb8e0]" />
          </div>
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-[#ffb8e0]" />)}
        </div>
      ) : deudas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ffb8e0]">
          <CreditCard size={36} className="mx-auto mb-3 text-[#ec7fa9] opacity-40" />
          <p className="font-semibold text-[#1a1a2e]">No tienes deudas registradas</p>
          <p className="text-sm text-[#1a1a2e]/50 mt-1 mb-4">Si tienes, agrégalas para hacer seguimiento</p>
          <button onClick={() => setShowForm(true)}
            className="bg-[#ec7fa9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">
            + Agregar primera deuda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Total pendiente</p>
              <p className="text-2xl font-bold text-[#ec7fa9]">{fmt(totalPend)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs text-[#1a1a2e]/50 mb-1">Cuotas este mes</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{fmt(totalCuotas)}</p>
            </div>
          </div>

          {/* Tu progreso (4.9) */}
          {todasLiquidadas ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <PartyPopper className="mx-auto mb-2 text-green-600" size={26} />
              <p className="font-semibold text-green-700 text-lg">¡Quedaste libre de deudas!</p>
              <p className="text-sm text-green-700/80 mt-1">
                Empezaste debiendo {fmt(totalSaldoInicial)} y hoy no debes nada. Ese esfuerzo constante fue tuyo.
              </p>
            </div>
          ) : activas.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
              <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingDown size={12} /> Tu progreso
              </p>
              {reduccionAcumulada > 0 ? (
                <p className="text-sm text-[#1a1a2e]/70 leading-relaxed mb-3">
                  Empezaste debiendo <span className="font-semibold text-[#1a1a2e]">{fmt(totalSaldoInicial)}</span> y ya bajaste{" "}
                  <span className="font-semibold text-green-600">{fmt(reduccionAcumulada)}</span> ({pctReduccion.toFixed(0)}%). Vas muy bien.
                </p>
              ) : (
                <p className="text-sm text-[#1a1a2e]/70 leading-relaxed mb-3">
                  Estás empezando con <span className="font-semibold text-[#1a1a2e]">{fmt(totalPend)}</span> por pagar. Cada abono que confirmes se va a reflejar aquí.
                </p>
              )}
              {siguienteObjetivo && (
                <p className="text-sm bg-[#ffedfa] rounded-xl px-4 py-2.5 text-[#1a1a2e]">
                  <span className="font-semibold text-[#ec7fa9]">Siguiente objetivo:</span> {siguienteObjetivo}
                </p>
              )}
            </div>
          )}

          {activas.length > 0 && (
            <div className={`rounded-2xl border px-5 py-3 flex items-center gap-2 ${pagosListos === activas.length ? "bg-green-50 border-green-200" : "bg-white border-[#ffb8e0]"}`}>
              {pagosListos === activas.length
                ? <Check size={15} className="text-green-600 flex-shrink-0" strokeWidth={2.5} />
                : <Lightbulb size={15} className="text-[#ec7fa9] flex-shrink-0" />
              }
              <p className={`text-sm font-medium ${pagosListos === activas.length ? "text-green-700" : "text-[#1a1a2e]/70"}`}>
                {pagosListos} de {activas.length} pago{activas.length !== 1 ? "s" : ""} del mes listo{pagosListos === activas.length ? "s" : ""}
              </p>
            </div>
          )}

          {/* Tu plan de este mes (4.5) */}
          {activas.length > 0 && (
            <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-5">
              <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb size={12} /> Tu plan de este mes
              </p>

              <p className="text-xs font-semibold text-[#1a1a2e]/50 uppercase tracking-wide mb-2">Mantén al día</p>
              <div className="flex flex-col gap-2 mb-4">
                {activas.map(d => (
                  <button
                    key={d.id}
                    onClick={() => irARegistrarPago(d.id, "cuota")}
                    className="flex items-center justify-between bg-white border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-left hover:bg-white/70 transition-colors"
                  >
                    <span className="text-sm text-[#1a1a2e]">{d.nombre}</span>
                    <span className="text-xs font-semibold text-[#1a1a2e]/60">{fmt(d.cuota_mensual)}/mes →</span>
                  </button>
                ))}
              </div>

              {primeraDeuda ? (
                <>
                  <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-wide mb-2">Acelera esta deuda</p>
                  <button
                    onClick={() => irARegistrarPago(primeraDeuda.id, "abono_capital")}
                    className="w-full flex items-center justify-between bg-[#ec7fa9] rounded-xl px-4 py-3 text-left hover:bg-[#d96d97] transition-colors"
                  >
                    <span className="text-sm text-white">
                      Si te queda dinero extra este mes, ponlo en <span className="font-semibold">{primeraDeuda.nombre}</span>
                      {activas.length > 1 ? <>: {meta.enfoque}</> : null}. Cada peso de más te acorta el tiempo para quedar libre.
                    </span>
                    <span className="text-xs font-semibold text-white flex-shrink-0 ml-3">Abonar →</span>
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#1a1a2e]/70 leading-relaxed">
                  Con tu método <span className="font-semibold text-[#1a1a2e]">{meta.nombre.toLowerCase()}</span> no te enfocas en una sola: si te queda dinero extra, repártelo entre todas tus deudas activas.
                </p>
              )}
            </div>
          )}

          {/* Debt cards */}
          <div className="flex flex-col gap-4">
            {deudas.map((d, i) => {
              const meses = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : null;
              const abonoCapitalCuota = abonoACapitalEstimado(d);
              const done = d.total_pendiente === 0;
              const esPrimera = !done && meta.unaPrioridad && activas.length > 1 && activas[0]?.id === d.id;
              return (
                <div key={d.id} id={`deuda-card-${d.id}`} className={`bg-white rounded-2xl border p-5 ${done ? "border-green-200" : esPrimera ? "border-[#ec7fa9]" : "border-[#ffb8e0]"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100" : esPrimera ? "bg-[#ec7fa9]" : "bg-[#ffedfa]"}`}>
                        {done
                          ? <Check size={14} className="text-green-600" strokeWidth={2.5} />
                          : <span className={`text-xs font-bold ${esPrimera ? "text-white" : "text-[#ec7fa9]"}`}>{i + 1}</span>
                        }
                      </div>
                      <div>
                        {esPrimera && (
                          <span className="text-[10px] font-bold text-[#ec7fa9] uppercase tracking-wider">Empieza aquí</span>
                        )}
                        <p className="font-semibold text-[#1a1a2e] text-sm leading-tight">{d.nombre}</p>
                        <p className="text-xs text-[#1a1a2e]/40 flex items-center gap-1 mt-0.5">
                          <TipoIcon tipo={d.tipo} /> {d.tipo}
                        </p>
                        {!done && (editTasaId === d.id ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="number" step="0.01" value={editTasaValor}
                              onChange={e => setEditTasaValor(e.target.value)}
                              placeholder="Ej: 28.5" autoFocus
                              className="w-16 border border-[#ffb8e0] rounded-lg px-1.5 py-0.5 text-[11px] bg-[#ffedfa] outline-none"
                            />
                            <span className="text-[11px] text-[#1a1a2e]/40">% anual</span>
                            <button onClick={() => actualizarTasa(d.id)} className="text-[#ec7fa9] hover:text-[#d96d97]"><Check size={12} /></button>
                            <button onClick={() => { setEditTasaId(null); setEditTasaValor(""); }} className="text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60"><X size={12} /></button>
                          </div>
                        ) : d.tasa != null ? (
                          <button
                            onClick={() => { setAbonarId(null); setEditSaldoId(null); setEditTasaId(d.id); setEditTasaValor(String(d.tasa)); }}
                            className="text-[10px] text-[#1a1a2e]/40 hover:text-[#ec7fa9] hover:underline mt-0.5"
                          >
                            {d.tasa}% anual · editar
                          </button>
                        ) : (
                          <button
                            onClick={() => { setAbonarId(null); setEditSaldoId(null); setEditTasaId(d.id); setEditTasaValor(""); }}
                            className="text-[10px] text-[#ec7fa9] hover:underline mt-0.5"
                          >
                            + Agregar tasa de interés
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeDeuda(d.id)} className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center">
                      <X size={14} />
                    </button>
                  </div>

                  {done ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <PartyPopper size={15} strokeWidth={2.5} />¡Deuda liquidada! Bajaste {fmt(d.saldo_inicial ?? d.total_pendiente)} en total.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div className="bg-[#ffedfa] rounded-xl py-2.5 px-2">
                          <p className="text-[10px] text-[#1a1a2e]/50 mb-0.5">Saldo</p>
                          <p className="text-sm font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</p>
                        </div>
                        <div className="bg-[#ffedfa] rounded-xl py-2.5 px-2">
                          <p className="text-[10px] text-[#1a1a2e]/50 mb-0.5">Cuota/mes</p>
                          <p className="text-sm font-bold text-[#ec7fa9]">{fmt(d.cuota_mensual)}</p>
                        </div>
                        <div className="bg-[#ffedfa] rounded-xl py-2.5 px-2">
                          <p className="text-[10px] text-[#1a1a2e]/50 mb-0.5">~Meses</p>
                          <p className="text-sm font-bold text-[#1a1a2e]">{meses ?? "—"}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleConfirmado(d.id)}
                        className={`mb-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          confirmadas[d.id]
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-white border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          confirmadas[d.id] ? "bg-green-500 border-green-500" : "border-[#ffb8e0]"
                        }`}>
                          {confirmadas[d.id] && <Check size={12} className="text-white" strokeWidth={3} />}
                        </span>
                        {confirmadas[d.id] ? "Pago de este mes registrado" : "Pendiente este mes"}
                      </button>

                      {abonarId === d.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setAbonarUsar("cuota")}
                              className={`flex-1 text-xs py-2 rounded-xl border font-medium transition-colors ${abonarUsar === "cuota" ? "bg-[#ec7fa9] border-[#ec7fa9] text-white" : "border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}
                            >
                              Pago de mi cuota ({fmt(d.cuota_mensual)})
                            </button>
                            <button
                              onClick={() => setAbonarUsar("abono_capital")}
                              className={`flex-1 text-xs py-2 rounded-xl border font-medium transition-colors ${abonarUsar === "abono_capital" ? "bg-[#ec7fa9] border-[#ec7fa9] text-white" : "border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}
                            >
                              Abono adicional a capital
                            </button>
                          </div>
                          {abonarUsar === "cuota" ? (
                            abonoCapitalCuota !== null ? (
                              <p className="text-xs text-[#1a1a2e]/50 leading-relaxed bg-[#ffedfa] rounded-lg px-3 py-2">
                                Con tu tasa del {d.tasa}% anual, estimamos que{" "}
                                <span className="font-semibold text-[#1a1a2e]">{fmt(abonoCapitalCuota)}</span> de esta cuota reduce tu saldo
                                {abonoCapitalCuota === 0 && " (tu cuota apenas alcanza a cubrir los intereses este mes)"}.
                                Es un estimado — si tu banco muestra otro número, usa &quot;Actualizar saldo real&quot;.
                              </p>
                            ) : (
                              <p className="text-xs text-[#1a1a2e]/50 leading-relaxed bg-[#ffedfa] rounded-lg px-3 py-2">
                                Tu cuota suele incluir intereses y otros cargos, además de lo que reduce el capital.
                                Por eso no vamos a descontar este monto de tu saldo — agrégale una tasa de interés a esta deuda para que podamos estimarlo.
                              </p>
                            )
                          ) : (
                            <>
                              <p className="text-xs text-[#1a1a2e]/50 leading-relaxed bg-[#ffedfa] rounded-lg px-3 py-2">
                                Este dinero se suma a tu cuota y va directo a reducir lo que debes.
                                Confirma en tu banco que quedó aplicado a capital, para que este saldo sea confiable.
                              </p>
                              <input
                                type="number"
                                value={abonarMonto}
                                onChange={e => setAbonarMonto(e.target.value)}
                                placeholder="Monto del abono"
                                autoFocus
                                className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none"
                              />
                            </>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => registrarAbono(d.id)}
                              className="flex-1 bg-[#ec7fa9] text-white text-sm font-medium py-2 rounded-xl hover:bg-[#d96d97] flex items-center justify-center gap-1">
                              <Check size={14} /> Registrar pago
                            </button>
                            <button onClick={() => { setAbonarId(null); setAbonarMonto(""); setAbonarUsar("cuota"); }}
                              className="border border-[#ffb8e0] text-[#1a1a2e]/50 text-sm px-4 py-2 rounded-xl flex items-center">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button onClick={() => { setEditSaldoId(null); setAbonarId(d.id); }}
                            className="text-xs text-[#ec7fa9] font-semibold hover:underline">
                            + Registrar pago
                          </button>
                          {editSaldoId !== d.id && (
                            <button onClick={() => { setAbonarId(null); setEditSaldoId(d.id); setEditSaldoValor(String(d.total_pendiente)); }}
                              className="text-xs text-[#1a1a2e]/40 font-medium hover:text-[#1a1a2e]/70 hover:underline">
                              Actualizar saldo real
                            </button>
                          )}
                        </div>
                      )}

                      {editSaldoId === d.id && (
                        <div className="mt-3 space-y-2 border-t border-[#ffb8e0] pt-3">
                          <p className="text-xs text-[#1a1a2e]/50 leading-relaxed">
                            Amy no puede saber con certeza cuánto de cada pago reduce tu capital.
                            De vez en cuando, revisa tu banco y cuéntanos: <span className="font-semibold text-[#1a1a2e]">¿cuánto debes hoy?</span>
                          </p>
                          <input
                            type="number"
                            value={editSaldoValor}
                            onChange={e => setEditSaldoValor(e.target.value)}
                            placeholder="Saldo real según tu banco"
                            autoFocus
                            className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => actualizarSaldoReal(d.id)}
                              className="flex-1 bg-[#ec7fa9] text-white text-sm font-medium py-2 rounded-xl hover:bg-[#d96d97] flex items-center justify-center gap-1">
                              <Check size={14} /> Actualizar saldo
                            </button>
                            <button onClick={() => { setEditSaldoId(null); setEditSaldoValor(""); }}
                              className="border border-[#ffb8e0] text-[#1a1a2e]/50 text-sm px-4 py-2 rounded-xl flex items-center">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Simple tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <div className="bg-[#ec7fa9] rounded-2xl p-5 text-white">
              <p className="font-bold mb-1.5 text-sm">Paga más del mínimo cuando puedas</p>
              <p className="text-sm text-white/80 leading-relaxed">
                Pagar solo el mínimo de una tarjeta puede hacer que la deuda dure el doble. Cualquier peso extra que pongas acorta el tiempo y los intereses.
              </p>
            </div>
            <div className="bg-[#ffedfa] rounded-2xl border border-[#ffb8e0] p-5">
              <p className="font-bold text-[#1a1a2e] mb-1.5 text-sm">Mientras pagas, no crees deuda nueva</p>
              <p className="text-sm text-[#1a1a2e]/60 leading-relaxed">
                Cada peso nuevo que debes es un paso hacia atrás. Si puedes, pausa las compras a cuotas hasta que tengas más control.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
