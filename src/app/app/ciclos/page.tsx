"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import { planHastaProximoIngreso, type Frecuencia } from "@/lib/ciclos";
import { Check, X } from "lucide-react";

type Fuente = { id: string; nombre: string; monto: number; frecuencia: Frecuencia; dia_1: number | null; dia_2: number | null; fecha_inicio: string | null };
type Obl = { id: string; nombre: string; monto: number; dia_pago: number };

function fechaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const FRECUENCIAS: { value: Frecuencia; label: string }[] = [
  { value: "semanal", label: "Semanal" },
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
  // Solo la recarga mas reciente puede escribir la reserva: las viejas que terminan tarde no la pisan.
  const loadSeq = useRef(0);
  const [reservas, setReservas] = useState<{ id: string; monto: number; periodo_fin: string; apartada: boolean }[]>([]);

  // formulario de fuente
  const [fNombre, setFNombre] = useState("");
  const [fMonto, setFMonto] = useState("");
  const [fFrec, setFFrec] = useState<Frecuencia>("quincenal");
  const [fDia1, setFDia1] = useState("15");
  const [fDia2, setFDia2] = useState("30");
  const [fInicio, setFInicio] = useState("");

  // formulario de obligacion
  const [oNombre, setONombre] = useState("");
  const [oMonto, setOMonto] = useState("");
  const [oDia, setODia] = useState("");


  async function load() {
    const seq = ++loadSeq.current;
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
    const r = await supabase.from("reservas_ciclo").select("id, monto, periodo_fin, apartada").eq("user_id", user.id);
    const reservasActuales = r.data ?? [];
    setReservas(reservasActuales);
    if (seq !== loadSeq.current) return;
    await sincronizarReserva(user.id, reservasActuales, f.data ?? [], o.data ?? [], parseFloat(s.data?.[0]?.saldo ?? "0") || 0);
    // Releer despues de sincronizar: la reserva recien creada tiene que verse sin recargar.
    const r2 = await supabase.from("reservas_ciclo").select("id, monto, periodo_fin, apartada").eq("user_id", user.id);
    setReservas(r2.data ?? []);
    setLoading(false);
  }

  // Reserva del periodo actual (5.5): si el plan muestra un faltante, se guarda o actualiza
  // la reserva hasta el proximo ingreso. Si ya no hay faltante, la reserva se borra.
  // 5.6: solo cuenta una reserva que existe de verdad; nunca se inventa una del primer ciclo.
  async function sincronizarReserva(userId: string, existentes: { id: string; monto: number; periodo_fin: string; apartada: boolean }[], f: Fuente[], o: Obl[], saldoActual: number) {
    const supabase = createClient();
    const plan = planHastaProximoIngreso(
      new Date(), saldoActual,
      f.map(x => ({ nombre: x.nombre, monto: x.monto, frecuencia: x.frecuencia, dia_1: x.dia_1, dia_2: x.dia_2, fecha_inicio: x.fecha_inicio })),
      o.map(x => ({ nombre: x.nombre, monto: x.monto, dia_pago: x.dia_pago })),
    );
    if (!plan.proximoIngreso) return;
    const fin = fechaISO(plan.proximoIngreso.fecha);
    const actual = existentes.find(r => r.periodo_fin === fin);
    if (plan.faltante > 0) {
      if (actual) {
        if (actual.monto !== plan.faltante) {
          await supabase.from("reservas_ciclo").update({ monto: plan.faltante, apartada: false }).eq("id", actual.id);
        }
      } else {
        await supabase.from("reservas_ciclo").insert({ user_id: userId, periodo_inicio: fechaISO(new Date()), periodo_fin: fin, monto: plan.faltante });
      }
    } else if (actual) {
      await supabase.from("reservas_ciclo").delete().eq("id", actual.id);
    }
  }

  async function marcarApartada(id: string, apartada: boolean) {
    const supabase = createClient();
    await supabase.from("reservas_ciclo").update({ apartada }).eq("id", id);
    setReservas(reservas.map(r => r.id === id ? { ...r, apartada } : r));
  }

  useEffect(() => { load(); }, []);

  async function addFuente(e: React.FormEvent) {
    e.preventDefault();
    if (!fNombre || !fMonto) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (fFrec === "semanal" && !fInicio) return;
    const dia1 = fFrec === "variable" || fFrec === "semanal" ? null : parseInt(fDia1) || null;
    const dia2 = fFrec === "quincenal" ? parseInt(fDia2) || null : null;
    const { data } = await supabase.from("ingresos_fuentes")
      .insert({ user_id: user.id, nombre: fNombre, monto: parseFloat(fMonto), frecuencia: fFrec, dia_1: dia1, dia_2: dia2, fecha_inicio: fFrec === "semanal" ? fInicio || null : null })
      .select().single();
    if (data) setFuentes([...fuentes, data]);
    setFNombre(""); setFMonto(""); setFInicio("");
    load();
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
    load();
  }

  async function removeFuente(id: string) {
    const supabase = createClient();
    await supabase.from("ingresos_fuentes").delete().eq("id", id);
    setFuentes(fuentes.filter(f => f.id !== id));
    load();
  }

  async function removeObligacion(id: string) {
    const supabase = createClient();
    await supabase.from("obligaciones_recurrentes").delete().eq("id", id);
    setObligaciones(obligaciones.filter(o => o.id !== id));
    load();
  }

  async function guardarSaldo(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || saldo === "") return;
    await supabase.from("saldo_cuenta").upsert({ user_id: user.id, saldo: parseFloat(saldo), actualizado_at: new Date().toISOString() });
    load();
  }

  // Plan hasta el proximo ingreso (5.4 / 5.7). Usa el saldo escrito a mano (5.8).
  const plan = planHastaProximoIngreso(
    new Date(),
    parseFloat(saldo) || 0,
    fuentes.map(f => ({ nombre: f.nombre, monto: f.monto, frecuencia: f.frecuencia, dia_1: f.dia_1, dia_2: f.dia_2, fecha_inicio: f.fecha_inicio })),
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

      {/* Reservas del periodo (5.5, 5.9) */}
      {reservas.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="font-semibold text-[#1a1a2e] mb-3">Reservas para tu próximo ingreso</p>
          <div className="space-y-2">
            {reservas.map(r => (
              <div key={r.id} className={`flex items-center justify-between rounded-xl px-4 py-2.5 border ${r.apartada ? "bg-green-50 border-green-200" : "bg-[#ffedfa] border-[#ffb8e0]"}`}>
                <p className="text-sm text-[#1a1a2e]">
                  Aparta <span className="font-semibold">{fmt(r.monto)}</span> antes del{" "}
                  {new Date(r.periodo_fin + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long" })}
                </p>
                <button onClick={() => marcarApartada(r.id, !r.apartada)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${r.apartada ? "border-green-300 text-green-700 bg-white" : "border-[#ec7fa9] text-[#ec7fa9] bg-white hover:bg-[#ffedfa]"}`}>
                  {r.apartada ? "✓ Apartada" : "Ya la aparté"}
                </button>
              </div>
            ))}
          </div>
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
                  {f.frecuencia === "quincenal" ? ` · días ${f.dia_1} y ${f.dia_2}` : f.frecuencia === "mensual" ? ` · día ${f.dia_1}` : f.frecuencia === "semanal" && f.fecha_inicio ? ` · cada 7 días desde el ${f.fecha_inicio}` : ""}
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
          {fFrec === "semanal" && (
            <div>
              <label className="text-xs text-[#1a1a2e]/50 mb-1 block">Primer día que te pagan</label>
              <input type="date" value={fInicio} onChange={e => setFInicio(e.target.value)} className={inputCls} />
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
