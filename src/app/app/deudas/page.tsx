"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { ordenarDeudas, METHOD_META, type DebtMethod } from "@/lib/debtMethods";
import { CreditCard, Landmark, Home, Car, Users, FileText, Check, X, Plus, Lightbulb } from "lucide-react";

type Deuda = { id: string; nombre: string; tipo: string; cuota_mensual: number; total_pendiente: number; tasa: number | null };

const TIPOS = ["Tarjeta de crédito", "Préstamo personal", "Crédito hipotecario", "Crédito de vehículo", "Deuda familiar", "Otro"];

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
  const [abonarUsar, setAbonarUsar] = useState<"cuota" | "custom">("cuota");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data }, { data: perfil }] = await Promise.all([
      supabase.from("deudas").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("debt_method").eq("id", user.id).single(),
    ]);
    const m = (perfil?.debt_method as DebtMethod) || "snowball";
    setMetodo(m);
    if (data) setDeudas(ordenarDeudas(data as Deuda[], m));
    setLoading(false);
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
    const monto = abonarUsar === "cuota" ? deuda.cuota_mensual : parseFloat(abonarMonto);
    if (!monto || monto <= 0) return;
    const nuevo = Math.max(0, deuda.total_pendiente - monto);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deudas").update({ total_pendiente: nuevo }).eq("id", id).eq("user_id", user.id);
    setDeudas(deudas.map(d => d.id === id ? { ...d, total_pendiente: nuevo } : d));
    setAbonarId(null); setAbonarMonto(""); setAbonarUsar("cuota");
  }

  async function removeDeuda(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deudas").delete().eq("id", id).eq("user_id", user.id);
    setDeudas(deudas.filter(d => d.id !== id));
  }

  const totalPend = deudas.reduce((s, d) => s + d.total_pendiente, 0);
  const totalCuotas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const activas = deudas.filter(d => d.total_pendiente > 0);
  const meta = METHOD_META[metodo];
  // En el método equilibrado no hay una sola deuda prioritaria: todas avanzan juntas.
  const primeraDeuda = meta.unaPrioridad && activas.length > 0 ? activas[0] : null;

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

          {/* Where to start */}
          {activas.length > 0 && (
            <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-5 py-4 flex items-start gap-3">
              <Lightbulb size={16} className="text-[#ec7fa9] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#1a1a2e]/70 leading-relaxed">
                {activas.length === 1 ? (
                  <>
                    Paga tu cuota de <span className="font-semibold text-[#1a1a2e]">{primeraDeuda!.nombre}</span> cada mes sin falta, y cuando tengas dinero extra, ponlo ahí. Cada peso de más que abones te acorta el tiempo para quedar libre.
                  </>
                ) : primeraDeuda ? (
                  <>
                    Te recomendamos enfocarte primero en <span className="font-semibold text-[#1a1a2e]">{primeraDeuda.nombre}</span>: {meta.enfoque}. Cuando la termines, usa esa cuota para atacar la siguiente. Así vas agarrando impulso.
                  </>
                ) : (
                  <>
                    Con tu método <span className="font-semibold text-[#1a1a2e]">{meta.nombre.toLowerCase()}</span> no te enfocas en una sola: la idea es que todas avancen juntas. Paga cada cuota sin falta y, si te queda dinero extra, repártelo entre todas.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Debt cards */}
          <div className="flex flex-col gap-4">
            {deudas.map((d, i) => {
              const meses = d.cuota_mensual > 0 ? Math.ceil(d.total_pendiente / d.cuota_mensual) : null;
              const done = d.total_pendiente === 0;
              const esPrimera = !done && meta.unaPrioridad && activas.length > 1 && activas[0]?.id === d.id;
              return (
                <div key={d.id} className={`bg-white rounded-2xl border p-5 ${done ? "border-green-200" : esPrimera ? "border-[#ec7fa9]" : "border-[#ffb8e0]"}`}>
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
                      </div>
                    </div>
                    <button onClick={() => removeDeuda(d.id)} className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center">
                      <X size={14} />
                    </button>
                  </div>

                  {done ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <Check size={15} strokeWidth={2.5} />¡Deuda liquidada!
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

                      {abonarId === d.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setAbonarUsar("cuota")}
                              className={`flex-1 text-xs py-2 rounded-xl border font-medium transition-colors ${abonarUsar === "cuota" ? "bg-[#ec7fa9] border-[#ec7fa9] text-white" : "border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}
                            >
                              Cuota normal ({fmt(d.cuota_mensual)})
                            </button>
                            <button
                              onClick={() => setAbonarUsar("custom")}
                              className={`flex-1 text-xs py-2 rounded-xl border font-medium transition-colors ${abonarUsar === "custom" ? "bg-[#ec7fa9] border-[#ec7fa9] text-white" : "border-[#ffb8e0] text-[#1a1a2e]/60 hover:bg-[#ffedfa]"}`}
                            >
                              Otro monto
                            </button>
                          </div>
                          {abonarUsar === "custom" && (
                            <input
                              type="number"
                              value={abonarMonto}
                              onChange={e => setAbonarMonto(e.target.value)}
                              placeholder="Monto pagado"
                              autoFocus
                              className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm bg-[#ffedfa] outline-none"
                            />
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
                        <button onClick={() => setAbonarId(d.id)}
                          className="text-xs text-[#ec7fa9] font-semibold hover:underline">
                          + Registrar pago
                        </button>
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
