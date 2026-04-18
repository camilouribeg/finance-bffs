"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Search, Zap, Archive, PiggyBank, Target } from "lucide-react";

type ListItem = { id: string; nombre: string; valor: number };
type CajitaOB = { id: string; nombre: string; emoji: string; monto_total: number; meses: number; };
type BolsitaOB = { id: string; nombre: string; emoji: string; tipo: "fondos" | "metas"; cuota_mensual?: number; meta?: number; fecha_meta?: string; importancia: number; };
type DeudaItem = {
  id: string;
  nombre: string;
  tipo: string;
  cuota_mensual: number;
  total_pendiente: number;
  tasa: string;
};

const CAJITAS_SUGERIDAS = [
  { nombre: "SOAT", emoji: "🚗", monto: 400000, meses: 12 },
  { nombre: "Impuesto vehicular", emoji: "🚙", monto: 500000, meses: 12 },
  { nombre: "Seguro del carro", emoji: "🛡️", monto: 1200000, meses: 12 },
  { nombre: "Impuesto predial", emoji: "🏠", monto: 800000, meses: 12 },
  { nombre: "Matrícula escolar", emoji: "🎓", monto: 2000000, meses: 12 },
  { nombre: "Vacaciones", emoji: "✈️", monto: 3000000, meses: 12 },
];

const EMOJIS_BOLSITA = ["🐷","✈️","🏠","🎓","💻","👗","💍","🎉","🐾","🌱","🚑","🎸","🏋️","📚","🛍️"];

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
    pregunta: "¿Qué sientes cuando piensas en pagar tus deudas?",
    opciones: [
      { id: "A", texto: "Quiero ver una deuda desaparecer pronto, aunque sea pequeña" },
      { id: "B", texto: "Prefiero pagar lo menos posible en intereses, aunque tome más tiempo" },
      { id: "C", texto: "Me siento mejor si veo que todas avanzan al mismo tiempo" },
    ],
  },
  {
    pregunta: "¿Qué te da más impulso para seguir?",
    opciones: [
      { id: "A", texto: "Tachar una deuda de la lista y concentrarme en la siguiente" },
      { id: "B", texto: "Saber que estoy tomando la decisión más inteligente con mi dinero" },
      { id: "C", texto: "Sentir que ninguna deuda se me está yendo de las manos" },
    ],
  },
  {
    pregunta: "¿Cómo te describes a la hora de manejar tu dinero?",
    opciones: [
      { id: "A", texto: "Me funciona mejor una cosa a la vez, paso a paso" },
      { id: "B", texto: "Busco siempre la opción más eficiente y racional" },
      { id: "C", texto: "Me va mejor cuando todo está equilibrado y sin urgencias" },
    ],
  },
];

type Step =
  | "welcome"
  | "ingresos"
  | "gastos"
  | "finly_detective"
  | "deudas"
  | "deuda_intro"
  | "no_puede_intro"
  | "deuda_quiz"
  | "deuda_resultado"
  | "cajitas_onboarding"
  | "ahorro_puede"
  | "ahorro_tipo"
  | "bolsitas_crear"
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

  // Step 4a: Quiz
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [debtMethod, setDebtMethod] = useState<"snowball" | "avalanche" | "balanced" | null>(null);

  // Step 4b: Cajitas onboarding
  const [cajitasOB, setCajitasOB] = useState<CajitaOB[]>([]);
  const [cajNombre, setCajNombre] = useState("");
  const [cajEmoji, setCajEmoji] = useState("📦");
  const [cajMonto, setCajMonto] = useState("");
  const [cajMeses, setCajMeses] = useState("12");

  // Step 4c: Ahorro
  const [selectedAhorro, setSelectedAhorro] = useState<number | null>(null);

  // Step 4d: Bolsitas onboarding
  const [bolsitasOB, setBolsitasOB] = useState<BolsitaOB[]>([]);
  const [bolTipo, setBolTipo] = useState<"fondos" | "metas">("fondos");
  const [bolNombre, setBolNombre] = useState("");
  const [bolEmoji, setBolEmoji] = useState("🐷");
  const [bolCuota, setBolCuota] = useState("");
  const [bolMeta, setBolMeta] = useState("");
  const [bolFecha, setBolFecha] = useState("");
  const [bolImportancia, setBolImportancia] = useState(3);

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
      // Sin capacidad → Rompe-deudas intro → quiz
      setStep("no_puede_intro");
    } else if (finalDeudas.length > 1) {
      // Más de una deuda → intro + quiz para elegir metodología
      setStep("deuda_intro");
    } else if (finalDeudas.length === 1) {
      // Una sola deuda → sin quiz, ir a cajitas
      const disponiblePostGF = totalIngresos - totalGastos;
      if (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) {
        setStep("finly_detective");
      } else {
        setStep("cajitas_onboarding");
      }
    } else {
      // Sin deudas → ir a cajitas (con detector de gastos altos)
      const disponiblePostGF = totalIngresos - totalGastos;
      if (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) {
        setStep("finly_detective");
      } else {
        setStep("cajitas_onboarding");
      }
    }
  }

  function goCajitasToAhorro() {
    setStep("cajitas_onboarding");
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

  async function finalSave(opts: { ahorroMonto?: number; method?: string; cajitas?: CajitaOB[]; bolsillos?: BolsitaOB[]; }) {
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

      // Save cajitas
      if (opts.cajitas && opts.cajitas.length > 0) {
        const now2 = new Date();
        await supabase.from("cajitas").insert(
          opts.cajitas.map(c => {
            const fechaPago = new Date(now2.getFullYear(), now2.getMonth() + c.meses, 1);
            return { user_id: userId, nombre: c.nombre, emoji: c.emoji, monto_total: c.monto_total, actual: 0, fecha_pago: fechaPago.toISOString().split("T")[0] };
          })
        );
      }

      // Save bolsillos
      if (opts.bolsillos && opts.bolsillos.length > 0) {
        await supabase.from("bolsillos").insert(
          opts.bolsillos.map(b => ({
            user_id: userId, nombre: b.nombre, emoji: b.emoji, tipo: b.tipo,
            meta: b.meta || 0, actual: 0,
            cuota_mensual: b.cuota_mensual || null,
            fecha_meta: b.fecha_meta || null,
            importancia: b.importancia,
            celebrado: false,
          }))
        );
      } else if (opts.ahorroMonto) {
        // Bolsita general de ahorro
        await supabase.from("bolsillos").insert({
          user_id: userId, nombre: "Ahorro mensual", emoji: "🐷",
          tipo: "fondos", meta: opts.ahorroMonto * 12,
          actual: 0, cuota_mensual: opts.ahorroMonto, importancia: 3, celebrado: false,
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

  const totalCajitasOBMensual = cajitasOB.reduce((s, c) => s + Math.ceil(c.monto_total / Math.max(1, c.meses)), 0);
  const capacidadNeta = capacidad - totalCajitasOBMensual;

  function addCajitaOB() {
    if (!cajNombre || !cajMonto) return;
    setCajitasOB([...cajitasOB, { id: Date.now().toString(), nombre: cajNombre, emoji: cajEmoji, monto_total: parseFloat(cajMonto), meses: parseInt(cajMeses) || 12 }]);
    setCajNombre(""); setCajMonto(""); setCajEmoji("📦"); setCajMeses("12");
  }

  function addBolsitaOB() {
    if (!bolNombre) return;
    if (bolTipo === "fondos" && !bolCuota) return;
    if (bolTipo === "metas" && (!bolMeta || !bolFecha)) return;
    setBolsitasOB([...bolsitasOB, {
      id: Date.now().toString(), nombre: bolNombre, emoji: bolEmoji, tipo: bolTipo,
      cuota_mensual: bolTipo === "fondos" ? parseFloat(bolCuota) : undefined,
      meta: bolTipo === "metas" ? parseFloat(bolMeta) : undefined,
      fecha_meta: bolTipo === "metas" ? bolFecha : undefined,
      importancia: bolImportancia,
    }]);
    setBolNombre(""); setBolEmoji("🐷"); setBolCuota(""); setBolMeta(""); setBolFecha(""); setBolImportancia(3);
  }

  const stepNum = step === "welcome" ? 0
    : step === "ingresos" ? 1
    : step === "gastos" ? 2
    : step === "finly_detective" ? 2
    : step === "deudas" ? 3
    : step === "deuda_intro" ? 3
    : step === "deuda_quiz" ? 3
    : step === "deuda_resultado" ? 3
    : step === "no_puede_intro" ? 3
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
              <div className="mb-5 flex justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec7fa9" opacity="0.8"/></svg></div>
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
                Empecemos por tu dinero
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
                            className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] flex items-center"><Pencil size={12} /></button>
                          <button onClick={() => setIngresosOtros(ingresosOtros.filter(i => i.id !== item.id))}
                            className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={12} /></button>
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
                Ahora, lo que pagas cada mes
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
                          className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] flex items-center"><Pencil size={12} /></button>
                        <button onClick={() => setGastosFijos(gastosFijos.filter(g => g.id !== item.id))}
                          className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={12} /></button>
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
                💡 Aquí van los que pagas <strong>todos los meses</strong>. No incluyas cuotas de deudas ni gastos anuales como seguros o impuestos, para esos tenemos una sección especial.
              </div>
            </div>
          )}

          {/* ─── FINLY DETECTIVE ─── */}
          {step === "finly_detective" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-blue-600 text-sm font-bold flex items-center gap-1.5"><Search size={13} />Finly Detective</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                Tus gastos fijos están tomando mucho espacio
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-sm text-[#1a1a2e]/70 leading-relaxed space-y-2">
                <p>¡Oops! Con lo que registraste, tus gastos fijos están usando más del 65% de tus ingresos.</p>
                <p>Eso deja muy poco margen para deudas, ahorro y gastos del día a día.</p>
                <p className="text-blue-700 font-medium">Pero no te preocupes, para eso existe Finly Detective: vamos a revisar juntas cada gasto y encontrar dónde puede haber un respiro.</p>
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
                <button onClick={() => setStep("cajitas_onboarding")}
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
                Tus deudas, sin miedo
              </h2>
              <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl px-4 py-3 text-xs text-[#1a1a2e]/60 mb-5">
                💡 Aquí van todas tus deudas: tarjetas, créditos, préstamos o lo que le debas a alguien. No te preocupes si no tienes todos los datos exactos, empieza con lo que sabes.
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
                          className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] flex items-center"><Pencil size={12} /></button>
                        <button onClick={() => setDeudas(deudas.filter(x => x.id !== d.id))}
                          className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={12} /></button>
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
                      Tasa de interés, el porcentaje que te cobra el banco
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
                    + ¿Sabes tu tasa de interés? (opcional, si no la sabes no importa)
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
                Este es tu punto de partida
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-2 leading-relaxed">
                Con lo que registraste, Finly analizó tu situación y te propone diferentes formas de ahorrar.
              </p>
              <p className="text-sm text-[#ec7fa9] font-medium mb-6">
                Puedes elegir la que mejor se adapte a ti.
              </p>

              <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm mb-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#1a1a2e]/60">Después de gastos y deudas</span>
                  <span className="font-semibold text-[#1a1a2e]">{fmt(capacidad)}/mes</span>
                </div>
                {totalCajitasOBMensual > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#1a1a2e]/60">Reserva cajitas mensuales</span>
                    <span className="font-semibold text-orange-400">- {fmt(totalCajitasOBMensual)}/mes</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#ffb8e0] pt-1 mt-1">
                  <span className="text-[#1a1a2e]/60 font-medium">Disponible para ahorrar</span>
                  <span className="font-bold text-[#ec7fa9]">{fmt(capacidadNeta)}/mes</span>
                </div>
              </div>

              <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Selecciona la opción que más te guste 👇</p>

              <div className="space-y-3 mb-6">
                {savingsOptions.map((opt) => {
                  const monto = Math.round(capacidadNeta * opt.pct);
                  const restante = capacidadNeta - monto;
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
                            {opt.label} {opt.highlight && "✦"}
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
                <button type="button" onClick={() => setStep("cajitas_onboarding")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button
                  onClick={() => selectedAhorro !== null && setStep("ahorro_tipo")}
                  disabled={selectedAhorro === null}
                  className={`${btnPink} flex-[2]`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* ─── NO PUEDE AHORRAR: FINLY ROMPE-DEUDAS ─── */}
          {step === "no_puede_intro" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-600 text-sm font-bold flex items-center gap-1.5"><Zap size={13} />Finly Rompe-deudas</span>
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

          {/* ─── DEUDA INTRO (cuando puede ahorrar pero tiene deudas) ─── */}
          {step === "deuda_intro" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-600 text-sm font-bold flex items-center gap-1.5"><Zap size={13} />Finly Rompe-deudas</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Tener deudas no es malo
              </h2>
              <div className="text-sm text-[#1a1a2e]/70 leading-relaxed space-y-3 mb-6 bg-[#ffedfa] rounded-2xl p-5">
                <p>Las deudas muchas veces nos ayudan a cumplir metas que de otra forma tomarían años: una casa, un carro, estudios o un proyecto de vida.</p>
                <p>El problema no es tenerlas. <strong>El problema es no tener un plan para pagarlas.</strong></p>
                <p className="text-[#ec7fa9] font-medium">Para eso existe Finly Rompe-deudas. Vamos a ayudarte a salir de tus deudas más rápido usando metodologías financieras probadas.</p>
                <p>Pero primero, necesitamos entender cómo eres tú. Porque no todas las personas manejan sus finanzas igual y el mejor método depende de tu personalidad.</p>
              </div>
              <div className="bg-white border border-[#ffb8e0] rounded-2xl px-5 py-4 mb-4 text-center">
                <p className="text-xs text-[#1a1a2e]/50 mb-1">Vamos a hacer un test rápido</p>
                <p className="text-sm font-semibold text-[#1a1a2e]">3 preguntas · menos de 1 minuto</p>
                <p className="text-xs text-[#ec7fa9] mt-1">para encontrar la estrategia perfecta para ti 🎯</p>
              </div>
              <button
                onClick={() => setStep("deuda_quiz")}
                className={`${btnPink} w-full mb-3`}
              >
                Hacer el test →
              </button>
              <button
                type="button"
                onClick={() => {
                  const disponiblePostGF = totalIngresos - totalGastos;
                  if (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) {
                    setStep("finly_detective");
                  } else {
                    setStep("cajitas_onboarding");
                  }
                }}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors"
              >
                Omitir por ahora, hacer el test después
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

              {capacidad <= 0 ? (
                // Sin capacidad de ahorro → guardar directo con el método
                <button
                  onClick={() => finalSave({ method: debtMethod })}
                  disabled={saving}
                  className={`${btnPink} w-full`}
                >
                  {saving ? "Guardando..." : "Empezar con este método →"}
                </button>
              ) : (
                // Con capacidad → continuar al paso de ahorro
                <button
                  onClick={() => {
                    const disponiblePostGF = totalIngresos - totalGastos;
                    if (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) {
                      setStep("finly_detective");
                    } else {
                      setStep("cajitas_onboarding");
                    }
                  }}
                  className={`${btnPink} w-full`}
                >
                  Ahora veamos cuánto puedes ahorrar →
                </button>
              )}
            </div>
          )}

          {/* ─── CAJITAS ONBOARDING ─── */}
          {step === "cajitas_onboarding" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
                <Archive size={20} className="text-[#ec7fa9]" />¿Tienes gastos grandes una vez al año?
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-5 leading-relaxed">
                Cosas como el SOAT, impuestos, seguros o vacaciones. Con las cajitas reservas un poquito cada mes para que no te pillen por sorpresa.
              </p>

              {cajitasOB.length > 0 && (
                <div className="space-y-2 mb-4">
                  {cajitasOB.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{c.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a2e]">{c.nombre}</p>
                          <p className="text-xs text-[#1a1a2e]/40">{fmt(c.monto_total)} en {c.meses} meses · {fmt(Math.ceil(c.monto_total / c.meses))}/mes</p>
                        </div>
                      </div>
                      <button onClick={() => setCajitasOB(cajitasOB.filter(x => x.id !== c.id))} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                  <div className="flex justify-between px-1 text-xs text-[#1a1a2e]/50 font-medium pt-1">
                    <span>Reserva mensual total</span>
                    <span className="text-[#ec7fa9] font-bold">{fmt(totalCajitasOBMensual)}/mes</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-[#1a1a2e]/50 font-semibold mb-2">Sugerencias rápidas</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {CAJITAS_SUGERIDAS.filter(s => !cajitasOB.find(c => c.nombre === s.nombre)).map((s) => (
                  <button key={s.nombre} type="button"
                    onClick={() => setCajitasOB([...cajitasOB, { id: Date.now().toString(), nombre: s.nombre, emoji: s.emoji, monto_total: s.monto, meses: s.meses }])}
                    className="flex items-center gap-1.5 bg-white border border-[#ffb8e0] rounded-full px-3 py-1.5 text-xs text-[#1a1a2e]/70 hover:border-[#ec7fa9] hover:text-[#ec7fa9] transition-all">
                    {s.emoji} {s.nombre}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-4 bg-[#ffedfa] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#1a1a2e]/60 mb-2">Agregar cajita personalizada</p>
                <div className="flex gap-2">
                  <select value={cajEmoji} onChange={e => setCajEmoji(e.target.value)}
                    className="border border-[#ffb8e0] rounded-xl px-2 py-2.5 text-sm bg-white outline-none w-16">
                    {["📦","🚗","🏠","✈️","🎓","🛡️","🏋️","🎁","💊","🐾"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input value={cajNombre} onChange={e => setCajNombre(e.target.value)} placeholder="Nombre" className={`${inputCls} flex-1`} />
                </div>
                <div className="flex gap-2">
                  <input type="number" value={cajMonto} onChange={e => setCajMonto(e.target.value)} placeholder="Monto total" className={`${inputCls} flex-1`} />
                  <select value={cajMeses} onChange={e => setCajMeses(e.target.value)}
                    className="border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-white outline-none w-36">
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                  </select>
                </div>
                <button type="button" onClick={addCajitaOB} disabled={!cajNombre || !cajMonto}
                  className="w-full border border-[#ec7fa9] text-[#ec7fa9] font-semibold py-2 rounded-xl text-sm hover:bg-white disabled:opacity-40 transition-colors">
                  + Agregar cajita
                </button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("deudas")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button onClick={goCajitasToAhorro} className={`${btnPink} flex-[2] text-sm`}>
                  {cajitasOB.length === 0 ? "No tengo, continuar →" : "Continuar →"}
                </button>
              </div>
            </div>
          )}

          {/* ─── AHORRO TIPO ─── */}
          {step === "ahorro_tipo" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-2 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
                <PiggyBank size={20} className="text-[#ec7fa9]" />¿Cómo quieres organizar tu ahorro?
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-6 leading-relaxed">
                Vas a ahorrar <strong className="text-[#ec7fa9]">{fmt(selectedAhorro ?? 0)}/mes</strong>. Elige cómo quieres manejarlo.
              </p>

              <div className="space-y-4 mb-6">
                <button type="button" onClick={() => setStep("bolsitas_crear")}
                  className="w-full text-left border-2 border-[#ffb8e0] rounded-2xl p-5 hover:border-[#ec7fa9] hover:bg-[#ffedfa] transition-all group">
                  <div className="flex items-start gap-4">
                    <PiggyBank size={28} className="text-[#ec7fa9] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-bold text-[#1a1a2e] text-base group-hover:text-[#ec7fa9] transition-colors">Bolsitas con propósito</p>
                      <p className="text-xs text-[#1a1a2e]/60 mt-1 leading-relaxed">Divides tu ahorro en bolsitas según para qué es: emergencias, viaje, ropa, metas... Tú decides cuántas y para qué. Ideal si te gusta tener todo organizado.</p>
                    </div>
                  </div>
                </button>

                <button type="button"
                  onClick={() => finalSave({ ahorroMonto: selectedAhorro ?? 0, method: debtMethod ?? undefined, cajitas: cajitasOB })}
                  disabled={saving}
                  className="w-full text-left border-2 border-[#ffb8e0] rounded-2xl p-5 hover:border-[#ec7fa9] hover:bg-[#ffedfa] transition-all group">
                  <div className="flex items-start gap-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ec7fa9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    <div>
                      <p className="font-bold text-[#1a1a2e] text-base group-hover:text-[#ec7fa9] transition-colors">Una sola bolsita general</p>
                      <p className="text-xs text-[#1a1a2e]/60 mt-1 leading-relaxed">Todo tu ahorro en un solo lugar, sin dividirlo. Simple y sin complicarte. Puedes agregar bolsitas más adelante cuando quieras.</p>
                    </div>
                  </div>
                </button>
              </div>

              <button type="button" onClick={() => setStep("ahorro_puede")}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors">
                ← Atrás
              </button>
            </div>
          )}

          {/* ─── BOLSITAS CREAR ─── */}
          {step === "bolsitas_crear" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
                <PiggyBank size={20} className="text-[#ec7fa9]" />Crea tus bolsitas
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-5 leading-relaxed">
                Ahorro mensual: <strong className="text-[#ec7fa9]">{fmt(selectedAhorro ?? 0)}/mes</strong>. Distribúyelo como quieras.
              </p>

              {bolsitasOB.length > 0 && (
                <div className="space-y-2 mb-4">
                  {bolsitasOB.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{b.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a2e]">{b.nombre}</p>
                          <p className="text-xs text-[#1a1a2e]/40">
                            {b.tipo === "fondos" ? `${fmt(b.cuota_mensual ?? 0)}/mes` : `Meta ${fmt(b.meta ?? 0)} · ${b.fecha_meta}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setBolsitasOB(bolsitasOB.filter(x => x.id !== b.id))} className="text-[#1a1a2e]/20 hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#ffedfa] rounded-2xl p-4 mb-4">
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setBolTipo("fondos")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${bolTipo === "fondos" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60"}`}>
                    <PiggyBank size={14} />Mis fondos
                  </button>
                  <button type="button" onClick={() => setBolTipo("metas")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${bolTipo === "metas" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60"}`}>
                    <Target size={14} />Mis metas
                  </button>
                </div>

                {bolTipo === "fondos" && (
                  <p className="text-xs text-[#1a1a2e]/50 mb-3">Ahorro sin fecha límite. Defines cuánto apartas cada mes. Ej: fondo de emergencias, ropa, tecnología.</p>
                )}
                {bolTipo === "metas" && (
                  <p className="text-xs text-[#1a1a2e]/50 mb-3">Tienes un monto objetivo y una fecha. Finly calcula cuánto necesitas ahorrar cada mes. Ej: viaje a México en diciembre.</p>
                )}

                <div className="flex gap-2 mb-2">
                  <select value={bolEmoji} onChange={e => setBolEmoji(e.target.value)}
                    className="border border-[#ffb8e0] rounded-xl px-2 py-2.5 text-sm bg-white outline-none w-16">
                    {EMOJIS_BOLSITA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input value={bolNombre} onChange={e => setBolNombre(e.target.value)} placeholder="Nombre de la bolsita"
                    className={`${inputCls} flex-1`} />
                </div>

                {bolTipo === "fondos" && (
                  <input type="number" value={bolCuota} onChange={e => setBolCuota(e.target.value)}
                    placeholder="¿Cuánto apartas al mes?" className={`${inputCls} mb-2`} />
                )}
                {bolTipo === "metas" && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="number" value={bolMeta} onChange={e => setBolMeta(e.target.value)} placeholder="Meta total" className={inputCls} />
                    <input type="date" value={bolFecha} onChange={e => setBolFecha(e.target.value)} className={inputCls} />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#1a1a2e]/50">Importancia:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setBolImportancia(n)}
                      className={`transition-all ${n <= bolImportancia ? "text-[#ec7fa9]" : "text-[#ffb8e0]"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={n <= bolImportancia ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  ))}
                </div>

                <button type="button" onClick={addBolsitaOB}
                  disabled={!bolNombre || (bolTipo === "fondos" && !bolCuota) || (bolTipo === "metas" && (!bolMeta || !bolFecha))}
                  className="w-full border border-[#ec7fa9] text-[#ec7fa9] font-semibold py-2 rounded-xl text-sm hover:bg-white disabled:opacity-40 transition-colors">
                  + Agregar bolsita
                </button>
              </div>

              <button
                onClick={() => finalSave({ method: debtMethod ?? undefined, cajitas: cajitasOB, bolsillos: bolsitasOB.length > 0 ? bolsitasOB : undefined, ahorroMonto: bolsitasOB.length === 0 ? (selectedAhorro ?? 0) : undefined })}
                disabled={saving}
                className={`${btnPink} w-full mb-3`}
              >
                {saving ? "Guardando..." : "¡Listo, empecemos! →"}
              </button>
              <button type="button" onClick={() => setStep("ahorro_tipo")}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors">
                ← Atrás
              </button>
            </div>
          )}

          {/* ─── GUARDANDO ─── */}
          {step === "guardando" && (
            <div className="p-12 text-center">
              <div className="mb-4 animate-bounce flex justify-center"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec7fa9" opacity="0.8"/></svg></div>
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
