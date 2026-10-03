"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { planHastaProximoIngreso, type Frecuencia } from "@/lib/ciclos";
import { Check, X } from "lucide-react";

type Fuente = { id: string; nombre: string; monto: number; frecuencia: Frecuencia; dia_1: number | null; dia_2: number | null };
type Obl = { id: string; nombre: string; monto: number; dia_pago: number };

const FRECUENCIAS: { value: Frecuencia; label: string }[] = [
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "variable", label: "Irregular (freelance)" },
];

const inputCls = "w-full border border-[#ffb8e0] rounded-xl px-4 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30";

export default function CiclosPage() {
  const fmt = useFmt();
  const [loading, setLoading] = useState(true);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [obligaciones, setObligaciones] = useState<Obl[]>([]);
  const [saldo, setSaldo] = useState("");

  // formulario de fuente
  const [fNombre, setFNombre] = useState("");
  const [fMonto, setFMonto] = useState("");
  const [fFrec, setFFrec] = useState<Frecuencia>("quincenal");
  const [fDia1, setFDia1] = useState("15");
  const [fDia2, setFDia2] = useState("30");

  // formulario de obligacion
  const [oNombre, setONombre] = useState("");
  const [oMonto, setOMonto] = useState("");
  const [oDia, setODia] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [f, o, s] = await Promise.all([
      supabase.from("ingresos_fuentes").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("obligaciones_recurrentes").select("*").eq("user_id", user.id).order("dia_pago"),
      supabase.from("saldo_cuenta").select("saldo").eq("user_id", user.id),
    ]);
    if (f.data) setFuentes(f.data);
    if (o.data) setObligaciones(o.data);
    if (s.data && s.data.length > 0) setSaldo(String(s.data[0].saldo));
    setLoading(false);
  }

  async function addFuente(e: React.FormEvent) {
    e.preventDefault();
    if (!fNombre || !fMonto) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dia1 = fFrec === "variable" ? null : parseInt(fDia1) || null;
    const dia2 = fFrec === "quincenal" ? parseInt(fDia2) || null : null;
    const { data } = await supabase.from("ingresos_fuentes")
      .insert({ user_id: user.id, nombre: fNombre, monto: parseFloat(fMonto), frecuencia: fFrec, dia_1: dia1, dia_2: dia2 })
      .select().single();
    if (data) setFuentes([...fuentes, data]);
    setFNombre(""); setFMonto("");
  }

  async function addObligacion(e: React.FormEvent) {
    e.preventDefault();
    if (!oNombre || !oMonto || !oDia) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("obligaciones_recurrentes")
      .insert({ user_id: user.id, nombre: oNombre, monto: parseFloat(oMonto), dia_pago: parseInt(oDia) })
      .select().single();
    if (data) setObligaciones([...obligaciones, data].sort((a, b) => a.dia_pago - b.dia_pago));
    setONombre(""); setOMonto(""); setODia("");
  }

  async function removeFuente(id: string) {
    const supabase = createClient();
    await supabase.from("ingresos_fuentes").delete().eq("id", id);
    setFuentes(fuentes.filter(f => f.id !== id));
  }

  async function removeObligacion(id: string) {
    const supabase = createClient();
    await supabase.from("obligaciones_recurrentes").delete().eq("id", id);
    setObligaciones(obligaciones.filter(o => o.id !== id));
  }

  async function guardarSaldo(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || saldo === "") return;
    await supabase.from("saldo_cuenta").upsert({ user_id: user.id, saldo: parseFloat(saldo), actualizado_at: new Date().toISOString() });
  }

  // Plan hasta el proximo ingreso (5.4 / 5.7). Usa el saldo escrito a mano (5.8).
  const plan = planHastaProximoIngreso(
    new Date(),
    parseFloat(saldo) || 0,
    fuentes.map(f => ({ nombre: f.nombre, monto: f.monto, frecuencia: f.frecuencia, dia_1: f.dia_1, dia_2: f.dia_2 })),
    obligaciones.map(o => ({ nombre: o.nombre, monto: o.monto, dia_pago: o.dia_pago })),
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Tus ciclos de ingreso
        </h1>
        <p className="text-[#1a1a2e]/50 text-sm mt-1">Cuándo entra tu dinero y cuándo sale</p>
      </div>

      {/* Saldo en cuenta (5.8) */}
      <form onSubmit={guardarSaldo} className="bg-white rounded-2xl border border-[#ffb8e0] p-5 flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto tienes hoy en tu cuenta?</label>
          <input type="number" value={saldo} onChange={e => setSaldo(e.target.value)} placeholder="Ej: 800.000" className={inputCls} />
        </div>
        <button type="submit" className="bg-[#ec7fa9] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Guardar</button>
      </form>

      {/* Plan hasta el proximo ingreso (5.7) */}
      {!loading && (
        <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-wider mb-2">Tu plan hasta el próximo ingreso</p>
          {plan.proximoIngreso ? (
            <>
              <p className="text-sm text-[#1a1a2e]/70 mb-2">
                Tu próximo ingreso es el <span className="font-semibold">{plan.proximoIngreso.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" })}</span> ({fmt(plan.proximoIngreso.monto)}).
              </p>
              {plan.obligacionesAntes.length > 0 ? (
                <ul className="text-sm text-[#1a1a2e]/70 mb-2 space-y-1">
                  {plan.obligacionesAntes.map((e, i) => (
                    <li key={i}>{e.nombre} · {e.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} · {fmt(e.monto)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#1a1a2e]/70 mb-2">No tienes pagos antes de tu próximo ingreso.</p>
              )}
              {plan.faltante > 0 ? (
                <p className="text-sm font-semibold text-red-500">
                  Te faltarían {fmt(plan.faltante)} antes de tu próximo ingreso. Conviene apartarlos como reserva.
                </p>
              ) : (
                <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5"><Check size={14} />Llegas al próximo ingreso con {fmt(plan.saldoAlProximoIngreso)}.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#1a1a2e]/70">Agrega una fuente de ingreso para ver tu plan.</p>
          )}
        </div>
      )}

      {/* Fuentes de ingreso (5.1, 5.2) */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
        <p className="font-semibold text-[#1a1a2e] mb-3">Mis ingresos y cuándo llegan</p>
        <div className="space-y-2 mb-4">
          {fuentes.map(f => (
            <div key={f.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
              <div className="text-sm">
                <p className="font-medium text-[#1a1a2e]">{f.nombre} · {fmt(f.monto)}</p>
                <p className="text-xs text-[#1a1a2e]/50">
                  {FRECUENCIAS.find(x => x.value === f.frecuencia)?.label}
                  {f.frecuencia === "quincenal" ? ` · días ${f.dia_1} y ${f.dia_2}` : f.frecuencia === "mensual" ? ` · día ${f.dia_1}` : ""}
                </p>
              </div>
              <button onClick={() => removeFuente(f.id)} className="text-[#1a1a2e]/30 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addFuente} className="grid grid-cols-2 gap-3">
          <input value={fNombre} onChange={e => setFNombre(e.target.value)} placeholder="Ej: Sueldo" className={inputCls} />
          <input type="number" value={fMonto} onChange={e => setFMonto(e.target.value)} placeholder="Monto" className={inputCls} />
          <select value={fFrec} onChange={e => setFFrec(e.target.value as Frecuencia)} className={inputCls}>
            {FRECUENCIAS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          {fFrec === "quincenal" && (
            <div className="flex gap-2">
              <input type="number" min={1} max={31} value={fDia1} onChange={e => setFDia1(e.target.value)} className={inputCls} />
              <input type="number" min={1} max={31} value={fDia2} onChange={e => setFDia2(e.target.value)} className={inputCls} />
            </div>
          )}
          {fFrec === "mensual" && (
            <input type="number" min={1} max={31} value={fDia1} onChange={e => setFDia1(e.target.value)} placeholder="Día del mes" className={inputCls} />
          )}
          <button type="submit" className="col-span-2 bg-[#ec7fa9] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Agregar ingreso</button>
        </form>
      </div>

      {/* Obligaciones recurrentes (5.3) */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
        <p className="font-semibold text-[#1a1a2e] mb-3">Mis pagos fijos y cuándo se pagan</p>
        <div className="space-y-2 mb-4">
          {obligaciones.map(o => (
            <div key={o.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
              <p className="text-sm text-[#1a1a2e]"><span className="font-medium">{o.nombre}</span> · {fmt(o.monto)} · día {o.dia_pago}</p>
              <button onClick={() => removeObligacion(o.id)} className="text-[#1a1a2e]/30 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addObligacion} className="grid grid-cols-3 gap-3">
          <input value={oNombre} onChange={e => setONombre(e.target.value)} placeholder="Ej: Arriendo" className={inputCls} />
          <input type="number" value={oMonto} onChange={e => setOMonto(e.target.value)} placeholder="Monto" className={inputCls} />
          <input type="number" min={1} max={31} value={oDia} onChange={e => setODia(e.target.value)} placeholder="Día" className={inputCls} />
          <button type="submit" className="col-span-3 bg-[#ec7fa9] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Agregar pago fijo</button>
        </form>
      </div>
    </div>
  );
}
