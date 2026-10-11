"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import MoneyInput from "@/components/MoneyInput";
import { planHastaProximoIngreso, analizarPeriodos, proyectarEventos, type Frecuencia } from "@/lib/ciclos";
import { totalReservasActivas } from "@/lib/capacidad";
import LineaDeTiempo from "@/components/ciclos/LineaDeTiempo";
import DistribucionIngresos from "@/components/ciclos/DistribucionIngresos";
import { Check, X, AlertTriangle } from "lucide-react";

type Fuente = { id: string; nombre: string; monto_1: number; monto_2: number | null; frecuencia: Frecuencia; dia_1: number | null; dia_2: number | null; fecha_inicio: string | null };
type Obl = { id: string; nombre: string; monto: number; dia_pago: number };

function fechaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const FRECUENCIAS: { value: Frecuencia; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "cada_dos_semanas", label: "Cada dos semanas" },
  { value: "quincenal", label: "Quincenal (días fijos del mes, ej. 15 y 30)" },
  { value: "mensual", label: "Mensual" },
  { value: "variable", label: "Irregular (freelance)" },
];

const labelCls = "text-xs text-[#1a1a2e]/60 mb-1 block";
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

  // Configuracion plegada (5.13): los formularios solo se abren al agregar o editar.
  const [abrirIngresos, setAbrirIngresos] = useState(false);
  const [abrirPagos, setAbrirPagos] = useState(false);

  // formulario de fuente
  const [fNombre, setFNombre] = useState("");
  const [fMonto1, setFMonto1] = useState("");
  const [fMonto2, setFMonto2] = useState("");
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
    await sincronizarReservas(user.id, reservasActuales, f.data ?? [], o.data ?? [], parseFloat(s.data?.[0]?.saldo ?? "0") || 0);
    // Releer despues de sincronizar: la reserva recien creada tiene que verse sin recargar.
    const r2 = await supabase.from("reservas_ciclo").select("id, monto, periodo_fin, apartada").eq("user_id", user.id);
    setReservas(r2.data ?? []);
    setLoading(false);
  }

  // Reservas por periodo (5.4, 5.5): recorre todo el horizonte, no solo el proximo
  // ingreso, y guarda o actualiza una reserva por cada periodo ajustado que tenga un
  // ingreso anterior del cual prepararse. 5.6: el primer periodo sin ingreso previo
  // (origenReserva null) NO se guarda como reserva -- no hay nada real que mover
  // todavia, es la etapa de transicion y se explica aparte en la UI, no se contabiliza.
  async function sincronizarReservas(userId: string, existentes: { id: string; monto: number; periodo_fin: string; apartada: boolean }[], f: Fuente[], o: Obl[], saldoActual: number) {
    const supabase = createClient();
    const ajustados = analizarPeriodos(
      new Date(), saldoActual,
      f.map(x => ({ nombre: x.nombre, monto_1: x.monto_1, monto_2: x.monto_2, frecuencia: x.frecuencia, dia_1: x.dia_1, dia_2: x.dia_2, fecha_inicio: x.fecha_inicio })),
      o.map(x => ({ nombre: x.nombre, monto: x.monto, dia_pago: x.dia_pago })),
    );
    const conOrigen = ajustados.filter(a => a.origenReserva != null);
    const finesVigentes = new Set(conOrigen.map(a => fechaISO(a.fin)));

    await Promise.all(conOrigen.map(async (a) => {
      const fin = fechaISO(a.fin);
      const actual = existentes.find(r => r.periodo_fin === fin);
      if (actual) {
        if (actual.monto !== a.faltante) {
          await supabase.from("reservas_ciclo").update({ monto: a.faltante, apartada: false }).eq("id", actual.id);
        }
      } else {
        await supabase.from("reservas_ciclo").insert({ user_id: userId, periodo_inicio: fechaISO(a.inicio), periodo_fin: fin, monto: a.faltante });
      }
    }));
    // Borra reservas de periodos que ya no estan ajustados (cambiaron ingresos/pagos/saldo).
    await Promise.all(existentes.filter(r => !finesVigentes.has(r.periodo_fin)).map(r =>
      supabase.from("reservas_ciclo").delete().eq("id", r.id)
    ));
  }

  async function marcarApartada(id: string, apartada: boolean) {
    const supabase = createClient();
    await supabase.from("reservas_ciclo").update({ apartada }).eq("id", id);
    setReservas(reservas.map(r => r.id === id ? { ...r, apartada } : r));
  }

  useEffect(() => { load(); }, []);

  async function addFuente(e: React.FormEvent) {
    e.preventDefault();
    if (!fNombre || !fMonto1) return;
    if (fFrec === "quincenal" && !fMonto2) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const esPorFecha = fFrec === "semanal" || fFrec === "cada_dos_semanas";
    if (esPorFecha && !fInicio) return;
    const dia1 = fFrec === "variable" || esPorFecha ? null : parseInt(fDia1) || null;
    const dia2 = fFrec === "quincenal" ? parseInt(fDia2) || null : null;
    const { data } = await supabase.from("ingresos_fuentes")
      .insert({
        user_id: user.id, nombre: fNombre, frecuencia: fFrec,
        monto_1: parseFloat(fMonto1), monto_2: fFrec === "quincenal" ? parseFloat(fMonto2) || null : null,
        dia_1: dia1, dia_2: dia2, fecha_inicio: esPorFecha ? fInicio || null : null,
      })
      .select().single();
    if (data) setFuentes([...fuentes, data]);
    setFNombre(""); setFMonto1(""); setFMonto2(""); setFInicio(""); setAbrirIngresos(false);
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
    setONombre(""); setOMonto(""); setODia(""); setAbrirPagos(false);
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

  // Plan hasta el proximo ingreso (5.7). Usa el saldo escrito a mano (5.8).
  const plan = planHastaProximoIngreso(
    new Date(),
    parseFloat(saldo) || 0,
    fuentes.map(f => ({ nombre: f.nombre, monto_1: f.monto_1, monto_2: f.monto_2, frecuencia: f.frecuencia, dia_1: f.dia_1, dia_2: f.dia_2, fecha_inicio: f.fecha_inicio })),
    obligaciones.map(o => ({ nombre: o.nombre, monto: o.monto, dia_pago: o.dia_pago })),
  );

  // Periodos ajustados en todo el horizonte, no solo el proximo ingreso (5.4). Los que
  // tienen un ingreso anterior del cual reservar son 5.5 (y ya viven en `reservas`);
  // el que no tiene origen es el primer ciclo (5.6).
  const ajustados = analizarPeriodos(
    new Date(),
    parseFloat(saldo) || 0,
    fuentes.map(f => ({ nombre: f.nombre, monto_1: f.monto_1, monto_2: f.monto_2, frecuencia: f.frecuencia, dia_1: f.dia_1, dia_2: f.dia_2, fecha_inicio: f.fecha_inicio })),
    obligaciones.map(o => ({ nombre: o.nombre, monto: o.monto, dia_pago: o.dia_pago })),
  );
  const primerCiclo = ajustados.find(a => a.origenReserva == null) ?? null;
  const ajustadosConOrigen = ajustados.filter(a => a.origenReserva != null);

  // Dinero realmente utilizable (5.8): el saldo de hoy, menos lo que ya tiene destino
  // (pagos antes del proximo ingreso + reservas activas de periodos futuros).
  const dineroConDestino = plan.totalObligacionesAntes + totalReservasActivas(reservas);
  const dineroUtilizable = (parseFloat(saldo) || 0) - dineroConDestino;

  // La reserva mas proxima que todavia no se aparta (5.7, 5.9): la siguiente accion
  // concreta, una sola, sin importar cuantos periodos ajustados haya en total.
  const proximaReserva = [...reservas]
    .filter(r => !r.apartada)
    .sort((a, b) => a.periodo_fin.localeCompare(b.periodo_fin))[0] ?? null;

  // Mismos datos que usa el plan, sin segunda captura (5.11, 5.12).
  const eventos = proyectarEventos(
    new Date(),
    fuentes.map(f => ({ nombre: f.nombre, monto_1: f.monto_1, monto_2: f.monto_2, frecuencia: f.frecuencia, dia_1: f.dia_1, dia_2: f.dia_2, fecha_inicio: f.fecha_inicio })),
    obligaciones.map(o => ({ nombre: o.nombre, monto: o.monto, dia_pago: o.dia_pago })),
  );

  const saldoBloque = (
    <form onSubmit={guardarSaldo} className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
      <label className="text-sm font-semibold text-[#1a1a2e] mb-1 block">¿Con cuánto dinero puedes contar hoy?</label>
      <p className="text-xs text-[#1a1a2e]/60 mb-3">
        Amy lo usa como punto de partida para organizar lo que queda hasta tu próximo ingreso. Escribe lo que tienes disponible
        hoy, sin contar el dinero que ya apartaste en una cajita, una bolsita o una reserva. Puedes actualizarlo cuando cambie.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <MoneyInput value={saldo} onChange={setSaldo} placeholder="Ej: 800.000" className={inputCls} />
        </div>
        <button type="submit" className="bg-[#ec7fa9] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Guardar</button>
      </div>
    </form>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Mi plan de ingresos
        </h1>
        <p className="text-[#1a1a2e]/60 text-sm mt-1">
          Aquí Amy organiza tu dinero según cuándo lo recibes y cuándo tienes que usarlo, para ayudarte a llegar tranquila a tu próximo pago.
        </p>
      </div>

      {/* Plan hasta el proximo ingreso (5.7): la cifra protagonista primero (5.8),
          despues el detalle, despues la configuracion mas abajo */}
      {!loading && (
        <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-wider mb-2">Tu plan hasta el próximo ingreso</p>

          {plan.proximoIngreso ? (
            <>
              <p className="text-3xl font-bold text-[#1a1a2e]">{fmt(Math.max(0, dineroUtilizable))}</p>
              <p className="text-sm text-[#1a1a2e]/60 mb-3">
                Puedes usar esto con tranquilidad hasta tu próximo ingreso.
                {dineroConDestino > 0 && <> De los {fmt(parseFloat(saldo) || 0)} que tienes hoy, {fmt(dineroConDestino)} ya tienen destino: pagos antes de tu próximo ingreso y reservas de periodos futuros.</>}
              </p>

              {/* Siguiente accion concreta (5.7): visible sin bajar, sin depender de
                  cuantas tarjetas de periodos ajustados haya mas abajo. */}
              {proximaReserva && (
                <div className="flex items-center justify-between gap-3 bg-white border border-[#ffb8e0] rounded-xl px-4 py-2.5 mb-3">
                  <p className="text-sm text-[#1a1a2e]">
                    Tu próxima acción: aparta <span className="font-semibold">{fmt(proximaReserva.monto)}</span> antes del{" "}
                    {new Date(proximaReserva.periodo_fin + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long" })}
                  </p>
                  <button onClick={() => marcarApartada(proximaReserva.id, true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#ec7fa9] text-[#ec7fa9] bg-white hover:bg-[#ffedfa] flex-shrink-0">
                    Ya la aparté
                  </button>
                </div>
              )}

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

              {/* 5.4: periodos ajustados mas adelante en el horizonte, con recomendacion concreta */}
              {ajustadosConOrigen.map((a, i) => (
                <div key={i} className="mt-3 bg-white border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">
                    Del {a.inicio.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} al {a.fin.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} te quedarías corta: te faltarían {fmt(a.faltante)}.
                    Cuando recibas tu pago del {a.origenReserva!.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" })} ({fmt(a.origenReserva!.monto)}), deja {fmt(a.faltante)} preparados para complementar.
                  </p>
                </div>
              ))}

              {/* 5.6: primer ciclo, sin ingreso anterior del cual reservar todavia */}
              {primerCiclo && (
                <div className="mt-3 bg-white border border-[#ffb8e0] rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-[#1a1a2e]">Estás empezando este ciclo con Amy</p>
                  <p className="text-sm text-[#1a1a2e]/70 mt-1">
                    Todavía no tienes un ingreso anterior del cual preparar dinero, así que es normal que este tramo se sienta ajustado:
                    te faltarían {fmt(primerCiclo.faltante)} antes del {primerCiclo.fin.toLocaleDateString("es-CO", { day: "numeric", month: "long" })}.
                    No es que tu plan esté mal — es la transición. A medida que recibas tus próximos pagos, aparta un poco en cada uno hasta estabilizarte.
                  </p>
                </div>
              )}

              {!primerCiclo && ajustadosConOrigen.length === 0 && (
                <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5 mt-2"><Check size={14} />Vas bien: no se ve ningún periodo ajustado por ahora.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#1a1a2e]/70">Agrega una fuente de ingreso para ver tu plan.</p>
          )}
        </div>
      )}

      {/* Reservas por periodo (5.5, 5.9) */}
      {reservas.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
          <p className="font-semibold text-[#1a1a2e] mb-3">Reservas para tus próximos ingresos</p>
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

      {!loading && <LineaDeTiempo eventos={eventos} />}
      {!loading && <DistribucionIngresos eventos={eventos} periodosAjustados={ajustados} />}

      {saldoBloque}

      {/* Fuentes de ingreso (5.1, 5.2, 5.17) */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-[#1a1a2e]">Mis ingresos y cuándo llegan</p>
            <p className="text-xs text-[#1a1a2e]/60 mt-0.5">
              {fuentes.length === 0 ? "Aún no has agregado ingresos" : `${fuentes.length} ${fuentes.length === 1 ? "ingreso registrado" : "ingresos registrados"}`}
              {plan.proximoIngreso && ` · próximo: ${plan.proximoIngreso.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" })}`}
            </p>
          </div>
          <button type="button" onClick={() => setAbrirIngresos(!abrirIngresos)} className="text-xs text-[#ec7fa9] font-semibold hover:underline flex-shrink-0">
            {abrirIngresos ? "Cerrar" : fuentes.length === 0 ? "Agregar" : "Editar o agregar"}
          </button>
        </div>
        {abrirIngresos && (<>
        <div className="space-y-2 mb-4">
          {fuentes.map(f => (
            <div key={f.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
              <div className="text-sm">
                <p className="font-medium text-[#1a1a2e]">
                  {f.nombre} · {f.frecuencia === "quincenal"
                    ? `${fmt(f.monto_1)} + ${fmt(f.monto_2 ?? f.monto_1)}`
                    : fmt(f.monto_1)}
                </p>
                <p className="text-xs text-[#1a1a2e]/50">
                  {FRECUENCIAS.find(x => x.value === f.frecuencia)?.label}
                  {f.frecuencia === "quincenal" ? ` · días ${f.dia_1} y ${f.dia_2}`
                    : f.frecuencia === "mensual" ? ` · día ${f.dia_1}`
                    : f.frecuencia === "semanal" && f.fecha_inicio ? ` · cada 7 días desde el ${f.fecha_inicio}`
                    : f.frecuencia === "cada_dos_semanas" && f.fecha_inicio ? ` · cada 14 días desde el ${f.fecha_inicio}`
                    : ""}
                </p>
              </div>
              <button onClick={() => removeFuente(f.id)} aria-label="Quitar ingreso" className="text-[#1a1a2e]/30 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addFuente} className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>¿De dónde viene este ingreso?</label>
            <input value={fNombre} onChange={e => setFNombre(e.target.value)} placeholder="Ej: Sueldo" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>¿Cada cuánto te pagan?</label>
            <select value={fFrec} onChange={e => setFFrec(e.target.value as Frecuencia)} className={inputCls}>
              {FRECUENCIAS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </div>

          {fFrec === "quincenal" ? (
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="border border-[#ffb8e0] rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-[#ec7fa9]">Primer pago</p>
                <div>
                  <label className={labelCls}>Día en que lo recibes</label>
                  <input type="number" min={1} max={31} value={fDia1} onChange={e => setFDia1(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Cuánto recibes</label>
                  <MoneyInput value={fMonto1} onChange={setFMonto1} placeholder="Monto" className={inputCls} />
                </div>
              </div>
              <div className="border border-[#ffb8e0] rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-[#ec7fa9]">Segundo pago</p>
                <div>
                  <label className={labelCls}>Día en que lo recibes</label>
                  <input type="number" min={1} max={31} value={fDia2} onChange={e => setFDia2(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Cuánto recibes</label>
                  <MoneyInput value={fMonto2} onChange={setFMonto2} placeholder="Monto" className={inputCls} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Cuánto recibes</label>
              <MoneyInput value={fMonto1} onChange={setFMonto1} placeholder="Monto" className={inputCls} />
            </div>
          )}

          {(fFrec === "semanal" || fFrec === "cada_dos_semanas") && (
            <div>
              <label className={labelCls}>{fFrec === "semanal" ? "Primer día que te pagan" : "Día del primer pago de este ciclo"}</label>
              <input type="date" value={fInicio} onChange={e => setFInicio(e.target.value)} className={inputCls} />
            </div>
          )}
          {fFrec === "mensual" && (
            <div>
              <label className={labelCls}>Día del mes en que lo recibes</label>
              <input type="number" min={1} max={31} value={fDia1} onChange={e => setFDia1(e.target.value)} placeholder="Ej: 30" className={inputCls} />
            </div>
          )}
          <button type="submit" className="col-span-2 bg-[#ec7fa9] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Agregar ingreso</button>
        </form>
        </>)}
      </div>

      {/* Obligaciones recurrentes (5.3) */}
      <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-[#1a1a2e]">Mis pagos fijos y cuándo se pagan</p>
            <p className="text-xs text-[#1a1a2e]/60 mt-0.5">
              {obligaciones.length === 0 ? "Aún no has agregado pagos fijos" : `${obligaciones.length} ${obligaciones.length === 1 ? "pago fijo registrado" : "pagos fijos registrados"}`}
            </p>
          </div>
          <button type="button" onClick={() => setAbrirPagos(!abrirPagos)} className="text-xs text-[#ec7fa9] font-semibold hover:underline flex-shrink-0">
            {abrirPagos ? "Cerrar" : obligaciones.length === 0 ? "Agregar" : "Editar o agregar"}
          </button>
        </div>
        {abrirPagos && (<>
        <div className="space-y-2 mb-4">
          {obligaciones.map(o => (
            <div key={o.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
              <p className="text-sm text-[#1a1a2e]"><span className="font-medium">{o.nombre}</span> · {fmt(o.monto)} · día {o.dia_pago}</p>
              <button onClick={() => removeObligacion(o.id)} aria-label="Quitar pago fijo" className="text-[#1a1a2e]/30 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addObligacion} className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>¿Qué pagas?</label>
            <input value={oNombre} onChange={e => setONombre(e.target.value)} placeholder="Ej: Arriendo" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cuánto pagas</label>
            <MoneyInput value={oMonto} onChange={setOMonto} placeholder="Monto" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Día del mes</label>
            <input type="number" min={1} max={31} value={oDia} onChange={e => setODia(e.target.value)} placeholder="Ej: 5" className={inputCls} />
          </div>
          <button type="submit" className="col-span-3 bg-[#ec7fa9] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#d96d97]">Agregar pago fijo</button>
        </form>
        </>)}
      </div>
    </div>
  );
}
