"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type ListItem = { id: string; nombre: string; valor: number };
type DeudaItem = {
  id: string;
  nombre: string;
  tipo: string;
  cuota_mensual: number;
  total_pendiente: number;
  tasa: string;
};

const DEUDA_TIPOS = [
  "Tarjeta de crédito",
  "Préstamo personal",
  "Crédito hipotecario",
  "Crédito de vehículo",
  "Deuda familiar",
  "Otro",
];

const QUIZ = [
  {
    pregunta: "Cuando piensas en tus deudas, ¿qué prefieres sentir?",
    opciones: [
      { id: "A", texto: "Ver cómo una deuda desaparece completamente pronto" },
      { id: "B", texto: "Saber que estoy pagando lo menos posible en intereses" },
      { id: "C", texto: "Sentir que avanzo en todas mis deudas al mismo tiempo" },
    ],
  },
  {
    pregunta: "¿Qué te motivaría más a continuar?",
    opciones: [
      { id: "A", texto: "Cerrar capítulos: eliminar una deuda y pasar a la siguiente" },
      { id: "B", texto: "Que mi dinero trabaje de la forma más eficiente posible" },
      { id: "C", texto: "No sentir que descuido ninguna de mis deudas" },
    ],
  },
  {
    pregunta: "¿Cómo describes tu relación con el dinero?",
    opciones: [
      { id: "A", texto: "Me va mejor con una meta a la vez, paso a paso" },
      { id: "B", texto: "Me gusta tomar las decisiones más racionales" },
      { id: "C", texto: "Prefiero ir tranquila, sin presión ni urgencias" },
    ],
  },
];

type Step =
  | "welcome"
  | "ingresos"
  | "gastos"
  | "finly_detective"
  | "deudas"
  | "ahorro_puede"
  | "no_puede_intro"
  | "deuda_quiz"
  | "deuda_resultado"
  | "guardando";

const METHOD_INFO = {
  snowball: {
    emoji: "❄️",
    nombre: "Bola de nieve",
    desc: "Vas a enfocarte primero en la deuda más pequeña. Cuando avances en esta, ese progreso te va a ayudar a seguir con las siguientes.",
    sort: (a: DeudaItem, b: DeudaItem) => a.total_pendiente - b.total_pendiente,
  },
  avalanche: {
    emoji: "🏔️",
    nombre: "Avalancha",
    desc: "Vas a enfocarte primero en la deuda que más te cuesta en intereses. Esto te ayuda a optimizar tu dinero a largo plazo.",
    sort: (a: DeudaItem, b: DeudaItem) => {
      const ta = parseFloat(a.tasa) || 0;
      const tb = parseFloat(b.tasa) || 0;
      return tb !== ta ? tb - ta : b.total_pendiente - a.total_pendiente;
    },
  },
  balanced: {
    emoji: "⚖️",
    nombre: "Equilibrado",
    desc: "Aquí no te enfocas en una sola deuda. La idea es avanzar en varias al mismo tiempo, de forma más estable.",
    sort: () => 0,
  },
};

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [userId, setUserId] = useState<string | null>(null);
  const [reinforcement, setReinforcement] = useState("");
  const reinforcementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 1: Ingresos
  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresosOtros, setIngresosOtros] = useState<ListItem[]>([]);
  const [nuevoIngNombre, setNuevoIngNombre] = useState("");
  const [nuevoIngValor, setNuevoIngValor] = useState("");

  // Step 2: Gastos fijos
  const [gastosFijos, setGastosFijos] = useState<ListItem[]>([]);
  const [nuevoGastNombre, setNuevoGastNombre] = useState("");
  const [nuevoGastValor, setNuevoGastValor] = useState("");

  // Step 3: Deudas
  const [deudas, setDeudas] = useState<DeudaItem[]>([]);
  const [dNombre, setDNombre] = useState("");
  const [dTipo, setDTipo] = useState("Tarjeta de crédito");
  const [dCuota, setDCuota] = useState("");
  const [dTotal, setDTotal] = useState("");
  const [dTasa, setDTasa] = useState("");
  const [mostrarTasa, setMostrarTasa] = useState(false);
  const [tasaTipo, setTasaTipo] = useState("NMV");
  const [mostrarOtrasTasas, setMostrarOtrasTasas] = useState(false);

  // Step 4a: Selected savings amount
  const [selectedAhorro, setSelectedAhorro] = useState<number | null>(null);

  // Step 4b: Quiz
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [debtMethod, setDebtMethod] = useState<"snowball" | "avalanche" | "balanced" | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();
      if (profile?.onboarding_completed) { window.location.href = "/app"; }
    }
    init();
  }, []);

  // Calculations
  const totalIngresos = (parseFloat(ingresoFijo) || 0) + ingresosOtros.reduce((s, i) => s + i.valor, 0);
  const totalGastos = gastosFijos.reduce((s, g) => s + g.valor, 0);
  const totalDeudas = deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const capacidad = totalIngresos - totalGastos - totalDeudas;

  const savingsOptions = [
    { label: "Opción recomendada", pct: 0.30, highlight: true, desc: "Este es el monto que más te ayudaría a avanzar y tomar control más rápido." },
    { label: "Opción intermedia", pct: 0.20, highlight: false, desc: "Un equilibrio entre avanzar y mantener flexibilidad." },
    { label: "Opción flexible", pct: 0.10, highlight: false, desc: "Una forma más ligera de empezar, si prefieres ir paso a paso." },
  ];

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  function showReinforcement(msg: string) {
    setReinforcement(msg);
    if (reinforcementTimer.current) clearTimeout(reinforcementTimer.current);
    reinforcementTimer.current = setTimeout(() => setReinforcement(""), 4000);
  }

  // List helpers
  function addIngreso() {
    if (!nuevoIngNombre || !nuevoIngValor) return;
    setIngresosOtros([...ingresosOtros, { id: Date.now().toString(), nombre: nuevoIngNombre, valor: parseFloat(nuevoIngValor) }]);
    setNuevoIngNombre(""); setNuevoIngValor("");
  }

  function addGasto() {
    if (!nuevoGastNombre || !nuevoGastValor) return;
    setGastosFijos([...gastosFijos, { id: Date.now().toString(), nombre: nuevoGastNombre, valor: parseFloat(nuevoGastValor) }]);
    setNuevoGastNombre(""); setNuevoGastValor("");
  }

  function addDeuda() {
    if (!dNombre || !dCuota || !dTotal) return;
    setDeudas([...deudas, {
      id: Date.now().toString(),
      nombre: dNombre, tipo: dTipo,
      cuota_mensual: parseFloat(dCuota),
      total_pendiente: parseFloat(dTotal),
      tasa: dTasa,
    }]);
    setDNombre(""); setDCuota(""); setDTotal(""); setDTasa(""); setMostrarTasa(false);
  }

  // Navigation
  function goToGastos() {
    showReinforcement("Listo, vamos bien ✨");
    setStep("gastos");
  }

  function goToDeudas() {
    showReinforcement("Esto ya te da más claridad 💡");
    setStep("deudas");
  }

  function goToAhorro() {
    // Auto-add debt if form fields are filled but user forgot to click "+ Agregar"
    let finalDeudas = deudas;
    if (dNombre && dCuota && dTotal) {
      const pendingDeuda = {
        id: Date.now().toString(),
        nombre: dNombre, tipo: dTipo,
        cuota_mensual: parseFloat(dCuota),
        total_pendiente: parseFloat(dTotal),
        tasa: dTasa,
      };
      finalDeudas = [...deudas, pendingDeuda];
      setDeudas(finalDeudas);
      setDNombre(""); setDCuota(""); setDTotal(""); setDTasa(""); setMostrarTasa(false);
    }

    const finalTotalDeudas = finalDeudas.reduce((s, d) => s + d.cuota_mensual, 0);
    const finalCapacidad = totalIngresos - totalGastos - finalTotalDeudas;

    showReinforcement("Lo estás haciendo mejor de lo que crees 💪");

    if (finalCapacidad <= 0) {
      setStep("no_puede_intro");
    } else {
      // Check Finly Detective: gastos fijos > 65% of income
      const disponiblePostGF = totalIngresos - totalGastos;
      if (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) {
        setStep("finly_detective");
      } else {
        setStep("ahorro_puede");
      }
    }
  }

  function answerQuiz(answer: string) {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (quizStep < QUIZ.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const counts = { A: 0, B: 0, C: 0 };
      newAnswers.forEach(a => { counts[a as keyof typeof counts]++; });
      let method: "snowball" | "avalanche" | "balanced";
      if (counts.A > counts.B && counts.A > counts.C) method = "snowball";
      else if (counts.B > counts.A && counts.B > counts.C) method = "avalanche";
      else method = "balanced";
      setDebtMethod(method);
      setStep("deuda_resultado");
    }
  }

  async function finalSave(opts: { ahorroMonto?: number; method?: string }) {
    if (!userId) return;
    setSaving(true);
    setStep("guardando");
    const supabase = createClient();
    const now = new Date();

    try {
      await supabase.from("dashboard_mensual").upsert({
        user_id: userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        ingreso_fijo: parseFloat(ingresoFijo) || 0,
        ingresos_otros: ingresosOtros.map(i => ({ id: i.id, descripcion: i.nombre, valor: i.valor })),
        gastos_fijos: gastosFijos.reduce((s, g) => s + g.valor, 0),
        gastos_fijos_items: gastosFijos.map(g => ({ id: g.id, descripcion: g.nombre, valor: g.valor })),
        gastos_variables_items: [],
      }, { onConflict: "user_id,month,year" });

      if (deudas.length > 0) {
        await supabase.from("deudas").insert(
          deudas.map(d => ({
            user_id: userId,
            nombre: d.nombre, tipo: d.tipo,
            cuota_mensual: d.cuota_mensual,
            total_pendiente: d.total_pendiente,
            tasa: d.tasa ? parseFloat(d.tasa) : null,
          }))
        );
      }

      if (opts.ahorroMonto) {
        await supabase.from("bolsillos").insert({
          user_id: userId,
          nombre: "Ahorro mensual",
          meta: opts.ahorroMonto,
          actual: 0,
        });
      }

      await supabase.from("profiles").update({
        onboarding_completed: true,
        ...(opts.method ? { debt_method: opts.method } : {}),
      }).eq("id", userId);

      window.location.href = "/app";
    } catch {
      setSaving(false);
    }
  }

  const stepNum = step === "welcome" ? 0
    : step === "ingresos" ? 1
    : step === "gastos" ? 2
    : step === "finly_detective" ? 2
    : step === "deudas" ? 3
    : 4;

  const inputCls = "w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa] transition-all";
  const btnPink = "bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#ffedfa] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb8e0] opacity-30 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb8e0] opacity-20 blob pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <a href="/" className="inline-block">
            <span className="text-2xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>Finly</span>
            <span className="text-xs text-[#1a1a2e]/40 font-medium ml-2">by Finance BFFs 💕</span>
          </a>
        </div>

        {/* Progress bar (only for steps 1-4) */}
        {stepNum > 0 && step !== "guardando" && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#1a1a2e]/40 mb-2">
              <span>Ingresos</span><span>Gastos</span><span>Deudas</span><span>Ahorro</span>
            </div>
            <div className="h-1.5 bg-[#ffb8e0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ec7fa9] rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(stepNum, 4) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Reinforcement banner */}
        {reinforcement && (
          <div className="mb-4 bg-white border border-[#ffb8e0] rounded-2xl px-5 py-3 text-center text-sm font-semibold text-[#ec7fa9] animate-pulse">
            {reinforcement}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-[#ffb8e0] overflow-hidden">

          {/* ─── WELCOME ─── */}
          {step === "welcome" && (
            <div className="p-8 text-center">
              <div className="text-5xl mb-5">💕</div>
              <h1 className="text-2xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                ¡Bienvenida!
              </h1>
              <div className="text-[#1a1a2e]/70 text-base leading-relaxed space-y-3 mb-8 text-left bg-[#ffedfa] rounded-2xl p-5">
                <p>Este es un proceso que vamos a hacer <strong>juntas</strong>.</p>
                <p>No tienes que saber de finanzas ni hacerlo perfecto.</p>
                <p>Yo te voy a ir guiando <strong>paso a paso</strong>.</p>
                <p>Confía en el proceso. 🌸</p>
              </div>
              <button
                onClick={() => setStep("ingresos")}
                className={`${btnPink} w-full text-base`}
              >
                Empecemos juntas →
              </button>
            </div>
          )}

          {/* ─── INGRESOS ─── */}
          {step === "ingresos" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Empecemos por tu dinero 💰
              </h2>
              <div className="text-sm text-[#1a1a2e]/60 leading-relaxed mb-6 space-y-2">
                <p>Aquí vas a anotar todos tus ingresos del mes.</p>
                <p>Puede ser tu salario, ingresos extra o cualquier otro ingreso.</p>
                <p className="text-[#ec7fa9] font-medium">Si solo tienes uno, no pasa nada. Es más común de lo que crees.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5">Ingreso principal del mes</label>
                  <input
                    type="number"
                    value={ingresoFijo}
                    onChange={(e) => setIngresoFijo(e.target.value)}
                    placeholder="Ej: 3.000.000"
                    className={inputCls}
                  />
                </div>

                {ingresosOtros.length > 0 && (
                  <div className="space-y-2">
                    {ingresosOtros.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                        <span className="text-sm text-[#1a1a2e]">{item.nombre}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#ec7fa9]">{fmt(item.valor)}</span>
                          <button onClick={() => { setNuevoIngNombre(item.nombre); setNuevoIngValor(String(item.valor)); setIngresosOtros(ingresosOtros.filter(i => i.id !== item.id)); }}
                            className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] text-xs">✏️</button>
                          <button onClick={() => setIngresosOtros(ingresosOtros.filter(i => i.id !== item.id))}
                            className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs text-[#1a1a2e]/50 mb-2">¿Tienes otros ingresos? (freelance, arriendos, etc.)</p>
                  <div className="flex gap-2">
                    <input type="text" value={nuevoIngNombre} onChange={(e) => setNuevoIngNombre(e.target.value)}
                      placeholder="¿De dónde?"
                      onKeyDown={(e) => e.key === "Enter" && addIngreso()}
                      className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                    <input type="number" value={nuevoIngValor} onChange={(e) => setNuevoIngValor(e.target.value)}
                      placeholder="Valor"
                      onKeyDown={(e) => e.key === "Enter" && addIngreso()}
                      className="w-32 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                    <button type="button" onClick={addIngreso}
                      className="bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] font-bold px-4 rounded-xl hover:bg-[#ffb8e0] transition-colors text-sm">+</button>
                  </div>
                </div>

                {totalIngresos > 0 && (
                  <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm">
                    <span className="text-[#1a1a2e]/60">Total ingresos: </span>
                    <span className="font-bold text-[#ec7fa9]">{fmt(totalIngresos)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={goToGastos}
                disabled={!ingresoFijo && ingresosOtros.length === 0}
                className={`${btnPink} w-full mt-6`}
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* ─── GASTOS FIJOS ─── */}
          {step === "gastos" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Ahora, lo que pagas cada mes 📋
              </h2>
              <div className="text-sm text-[#1a1a2e]/60 leading-relaxed mb-6 space-y-2">
                <p>Estos son los gastos que pagas todos los meses, casi siempre por el mismo valor.</p>
                <p className="text-[#1a1a2e]/50">Por ejemplo: arriendo, servicios, suscripciones o internet.</p>
              </div>

              {gastosFijos.length > 0 && (
                <div className="space-y-2 mb-4">
                  {gastosFijos.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                      <span className="text-sm text-[#1a1a2e]">{item.nombre}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#ec7fa9]">{fmt(item.valor)}</span>
                        <button onClick={() => { setNuevoGastNombre(item.nombre); setNuevoGastValor(String(item.valor)); setGastosFijos(gastosFijos.filter(g => g.id !== item.id)); }}
                          className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] text-xs">✏️</button>
                        <button onClick={() => setGastosFijos(gastosFijos.filter(g => g.id !== item.id))}
                          className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <input type="text" value={nuevoGastNombre} onChange={(e) => setNuevoGastNombre(e.target.value)}
                  placeholder="Nombre del gasto"
                  onKeyDown={(e) => e.key === "Enter" && addGasto()}
                  className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                <input type="number" value={nuevoGastValor} onChange={(e) => setNuevoGastValor(e.target.value)}
                  placeholder="Valor"
                  onKeyDown={(e) => e.key === "Enter" && addGasto()}
                  className="w-32 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                <button type="button" onClick={addGasto}
                  className="bg-[#ffedfa] border border-[#ffb8e0] text-[#ec7fa9] font-bold px-4 rounded-xl hover:bg-[#ffb8e0] transition-colors text-sm">+</button>
              </div>

              {totalGastos > 0 && (
                <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm mb-4">
                  <span className="text-[#1a1a2e]/60">Total gastos fijos: </span>
                  <span className="font-bold text-[#ec7fa9]">{fmt(totalGastos)}</span>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep("ingresos")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button onClick={goToDeudas}
                  className={`${btnPink} flex-[2] text-sm`}>
                  Siguiente →
                </button>
              </div>
              <div className="mt-2 bg-[#ffedfa] rounded-xl px-3 py-2 text-xs text-[#1a1a2e]/60">
                💡 Aquí van los que pagas <strong>todos los meses</strong>. No incluyas cuotas de deudas ni gastos anuales como seguros o impuestos — para esos tenemos una sección especial.
              </div>
            </div>
          )}

          {/* ─── FINLY DETECTIVE ─── */}
          {step === "finly_detective" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-blue-600 text-sm font-bold">🔍 Finly Detective</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                Tus gastos fijos están tomando mucho espacio
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-sm text-[#1a1a2e]/70 leading-relaxed space-y-2">
                <p>¡Oops! Con lo que registraste, tus gastos fijos están usando más del 65% de tus ingresos.</p>
                <p>Eso deja muy poco margen para deudas, ahorro y gastos del día a día.</p>
                <p className="text-blue-700 font-medium">Pero no te preocupes — para eso existe Finly Detective: vamos a revisar juntas cada gasto y encontrar dónde puede haber un respiro.</p>
              </div>
              <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[#1a1a2e]/60">Tus ingresos</span>
                  <span className="font-semibold text-[#ec7fa9]">{(parseFloat(String(totalIngresos)) || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#1a1a2e]/60">Gastos fijos</span>
                  <span className="font-semibold text-red-400">{totalGastos.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-[#ffb8e0]">
                  <span className="text-[#1a1a2e]/60">Disponible después de GF</span>
                  <span className={`font-bold ${totalIngresos - totalGastos < 0 ? "text-red-500" : "text-[#ec7fa9]"}`}>
                    {(totalIngresos - totalGastos).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#1a1a2e]/50 mb-5 text-center">
                Puedes volver atrás y revisar tus gastos, o continuar y hacerlo después desde la app.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("gastos")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Revisar gastos
                </button>
                <button onClick={() => setStep("ahorro_puede")}
                  className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                  Entendido, continuar →
                </button>
              </div>
            </div>
          )}

          {/* ─── DEUDAS ─── */}
          {step === "deudas" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Tus deudas, sin miedo 💳
              </h2>
              <div className="text-sm text-[#1a1a2e]/60 leading-relaxed mb-6 space-y-2">
                <p>Aquí vamos a poner todo lo que debes. Puede ser a un banco, una tarjeta o incluso a una persona.</p>
                <p className="text-[#ec7fa9] font-medium">No te preocupes si no tienes toda la información clara, puedes empezar con lo que sabes.</p>
              </div>

              {deudas.length > 0 && (
                <div className="space-y-2 mb-4">
                  {deudas.map((d) => (
                    <div key={d.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e]">{d.nombre}</p>
                        <p className="text-xs text-[#1a1a2e]/40">{d.tipo} · cuota {fmt(d.cuota_mensual)}/mes</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#ec7fa9]">{fmt(d.total_pendiente)}</span>
                        <button onClick={() => { setDNombre(d.nombre); setDTipo(d.tipo); setDCuota(String(d.cuota_mensual)); setDTotal(String(d.total_pendiente)); setDTasa(d.tasa || ""); if (d.tasa) setMostrarTasa(true); setDeudas(deudas.filter(x => x.id !== d.id)); }}
                          className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] text-xs">✏️</button>
                        <button onClick={() => setDeudas(deudas.filter(x => x.id !== d.id))}
                          className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 mb-2">
                <input type="text" value={dNombre} onChange={(e) => setDNombre(e.target.value)}
                  placeholder="¿A quién le debes? (nombre o tipo)"
                  className={inputCls} />
                <select value={dTipo} onChange={(e) => setDTipo(e.target.value)}
                  className="w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 bg-[#ffedfa]">
                  {DEUDA_TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto pagas al mes?</label>
                    <input type="number" value={dCuota} onChange={(e) => setDCuota(e.target.value)}
                      placeholder="Ej: 300.000"
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto debes en total?</label>
                    <input type="number" value={dTotal} onChange={(e) => setDTotal(e.target.value)}
                      placeholder="Ej: 5.000.000"
                      className={inputCls} />
                  </div>
                </div>
                {mostrarTasa ? (
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">
                      Tasa de interés — el porcentaje que te cobra el banco
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={dTasa} onChange={(e) => setDTasa(e.target.value)}
                        placeholder="Ej: 2.5"
                        className={`${inputCls} flex-1`} />
                      <select value={tasaTipo} onChange={(e) => { setTasaTipo(e.target.value); if (e.target.value === "otras") setMostrarOtrasTasas(true); }}
                        className="border border-[#ffb8e0] rounded-xl px-3 py-3 text-sm bg-[#ffedfa] outline-none">
                        <optgroup label="Más comunes">
                          <option value="NMV">% mensual (N.M.V.)</option>
                          <option value="EA">% E.A.</option>
                          <option value="NAMV">% nominal anual (N.A.M.V.)</option>
                          <option value="NTV">% trimestral (N.T.V.)</option>
                        </optgroup>
                        {mostrarOtrasTasas && (
                          <optgroup label="Otras">
                            <option value="EM">% efectiva mensual (E.M.)</option>
                            <option value="ET">% efectiva trimestral (E.T.)</option>
                            <option value="ES">% efectiva semestral (E.S.)</option>
                            <option value="NATV">% nominal anual trimestre vencido (N.A.T.V.)</option>
                            <option value="NASV">% nominal anual semestre vencido (N.A.S.V.)</option>
                            <option value="NSV">% nominal semestral (N.S.V.)</option>
                          </optgroup>
                        )}
                        {!mostrarOtrasTasas && (
                          <option value="otras">Otras tasas ▼</option>
                        )}
                      </select>
                      <button type="button" onClick={() => { setMostrarTasa(false); setDTasa(""); setTasaTipo("NMV"); setMostrarOtrasTasas(false); }}
                        className="text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 whitespace-nowrap">✕</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setMostrarTasa(true)}
                    className="text-xs text-[#ec7fa9] hover:underline">
                    + ¿Sabes tu tasa de interés? (opcional — si no la sabes, no importa)
                  </button>
                )}
              </div>
              <button type="button" onClick={addDeuda}
                disabled={!dNombre || !dCuota || !dTotal}
                className="w-full border border-[#ec7fa9] text-[#ec7fa9] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#ffedfa] disabled:opacity-40 transition-colors mb-4">
                + Agregar deuda
              </button>

              {totalDeudas > 0 && (
                <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm mb-4">
                  <span className="text-[#1a1a2e]/60">Cuotas mensuales totales: </span>
                  <span className="font-bold text-[#ec7fa9]">{fmt(totalDeudas)}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("gastos")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button onClick={goToAhorro}
                  className={`${btnPink} flex-[2] text-sm`}>
                  Siguiente →
                </button>
              </div>
              <p className="text-sm text-[#ec7fa9] font-medium text-center mt-2 bg-[#ffedfa] rounded-xl px-3 py-2">
                ¿No tienes deudas? ¡Qué bien! Puedes saltar este paso sin problema →
              </p>
            </div>
          )}

          {/* ─── AHORRO: PUEDE ─── */}
          {step === "ahorro_puede" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Este es tu punto de partida 🌱
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-2 leading-relaxed">
                Con lo que registraste, Finly analizó tu situación y te propone diferentes formas de ahorrar.
              </p>
              <p className="text-sm text-[#ec7fa9] font-medium mb-6">
                Puedes elegir la que mejor se adapte a ti.
              </p>

              <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm mb-4">
                <span className="text-[#1a1a2e]/60">Lo que te sobra después de gastos y deudas: </span>
                <span className="font-bold text-[#ec7fa9]">{fmt(capacidad)}/mes</span>
              </div>

              <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Selecciona la opción que más te guste 👇</p>

              <div className="space-y-3 mb-6">
                {savingsOptions.map((opt) => {
                  const monto = Math.round(capacidad * opt.pct);
                  const restante = capacidad - monto;
                  const isSelected = selectedAhorro === monto;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedAhorro(monto)}
                      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                        isSelected
                          ? "border-[#ec7fa9] bg-[#ec7fa9]/10"
                          : opt.highlight
                          ? "border-[#ec7fa9] bg-white"
                          : "border-[#ffb8e0] bg-white hover:border-[#ec7fa9]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-wide mb-1">
                            {opt.label} {opt.highlight && "⭐"}
                          </p>
                          <p className="text-lg font-bold text-[#1a1a2e]">Ahorrar {fmt(monto)} al mes</p>
                          <p className="text-xs text-[#1a1a2e]/50 mt-1">{opt.desc}</p>
                          <p className="text-xs text-green-600 font-medium mt-2">
                            Te quedan {fmt(restante)} libres para el mes
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ml-3 flex items-center justify-center ${
                          isSelected ? "border-[#ec7fa9] bg-[#ec7fa9]" : "border-[#ffb8e0]"
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-center text-[#1a1a2e]/40 mb-4">
                Puedes cambiar esto más adelante. Lo importante es empezar.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("deudas")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button
                  onClick={() => selectedAhorro !== null && finalSave({ ahorroMonto: selectedAhorro })}
                  disabled={selectedAhorro === null || saving}
                  className={`${btnPink} flex-[2]`}
                >
                  {saving ? "Guardando..." : "¡Empecemos! →"}
                </button>
              </div>
            </div>
          )}

          {/* ─── NO PUEDE AHORRAR: FINLY ROMPE-DEUDAS ─── */}
          {step === "no_puede_intro" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-600 text-sm font-bold">💪 Finly Rompe-deudas</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Primero, vamos a ordenar esto juntas 🤝
              </h2>
              <div className="text-sm text-[#1a1a2e]/70 leading-relaxed space-y-3 mb-6 bg-[#ffedfa] rounded-2xl p-5">
                <p>Por ahora, tus gastos y deudas superan tus ingresos.</p>
                <p><strong>Y no pasa nada. Esto es más común de lo que crees.</strong></p>
                <p>En este momento, no tiene sentido presionarte a ahorrar.</p>
                <p>Lo que sí vamos a hacer es enfocarnos en algo más importante: <strong>salir de tus deudas de forma inteligente.</strong> Eso es libertad.</p>
                <p>Finly Rompe-deudas te va a mostrar el mejor camino para ti.</p>
              </div>
              <button
                onClick={() => setStep("deuda_quiz")}
                className={`${btnPink} w-full`}
              >
                Vamos a encontrar la mejor forma para ti →
              </button>
            </div>
          )}

          {/* ─── QUIZ ─── */}
          {step === "deuda_quiz" && (
            <div className="p-8">
              <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-widest mb-1">
                Pregunta {quizStep + 1} de {QUIZ.length}
              </p>
              <div className="h-1 bg-[#ffb8e0] rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#ec7fa9] rounded-full transition-all duration-500"
                  style={{ width: `${((quizStep + 1) / QUIZ.length) * 100}%` }} />
              </div>

              <div className="text-sm text-[#1a1a2e]/60 leading-relaxed mb-1">
                No todas las personas manejan sus deudas igual.
              </div>
              <h2 className="text-lg font-bold text-[#1a1a2e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                {QUIZ[quizStep].pregunta}
              </h2>

              <div className="space-y-3">
                {QUIZ[quizStep].opciones.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => answerQuiz(opt.id)}
                    className="w-full text-left border-2 border-[#ffb8e0] rounded-2xl p-4 text-sm text-[#1a1a2e]/80 hover:border-[#ec7fa9] hover:bg-[#ffedfa] transition-all font-medium"
                  >
                    {opt.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── RESULTADO DEUDA ─── */}
          {step === "deuda_resultado" && debtMethod && (
            <div className="p-8">
              <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-widest mb-2">Tu plan personalizado</p>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Tu plan para salir de deudas
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-6 leading-relaxed">
                Así es como vamos a organizar tus deudas. No tienes que hacerlo perfecto, lo importante es ir avanzando.
              </p>

              <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-2xl p-4 mb-5">
                <p className="text-xs font-semibold text-[#ec7fa9] uppercase tracking-wide mb-1">
                  Método recomendado para ti
                </p>
                <p className="text-base font-bold text-[#1a1a2e]">
                  {METHOD_INFO[debtMethod].emoji} Método {METHOD_INFO[debtMethod].nombre}
                </p>
                <p className="text-xs text-[#1a1a2e]/60 mt-2 leading-relaxed">
                  {METHOD_INFO[debtMethod].desc}
                </p>
              </div>

              {deudas.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-[#1a1a2e]/50 uppercase tracking-wide mb-3">
                    Orden sugerido
                  </p>
                  <div className="space-y-2">
                    {[...deudas].sort(METHOD_INFO[debtMethod].sort).map((d, i) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0 ? "bg-[#ec7fa9] text-white" : "bg-[#ffedfa] text-[#ec7fa9]"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-[#ffedfa] rounded-xl px-4 py-2.5 flex items-center justify-between">
                          <span className="text-sm font-medium text-[#1a1a2e]">
                            {d.nombre}
                            {i === 0 && <span className="ml-2 text-xs text-[#ec7fa9]">← empieza aquí</span>}
                          </span>
                          <span className="text-sm font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-[#1a1a2e]/40 mb-4">
                Vamos a organizar tus deudas con este método, paso a paso. 🌸
              </p>

              <button
                onClick={() => finalSave({ method: debtMethod })}
                disabled={saving}
                className={`${btnPink} w-full`}
              >
                {saving ? "Guardando..." : "Empezar con este método →"}
              </button>
            </div>
          )}

          {/* ─── GUARDANDO ─── */}
          {step === "guardando" && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4 animate-bounce">💕</div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                Aquí es donde todo empieza a tener sentido
              </h2>
              <p className="text-[#1a1a2e]/50 text-sm">Preparando tu espacio...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
