"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import MoneyInput from "@/components/MoneyInput";
import { Pencil, Check, X, Search, Zap, Archive, PiggyBank, Target, ChevronDown } from "lucide-react";
import { MONEDAS } from "@/lib/monedas";

type ListItem = { id: string; nombre: string; valor: number; divisaOriginal?: string; valorOriginal?: number };
type CajitaOB = { id: string; nombre: string; emoji: string; monto_total: number; meses: number; fecha_pago?: string; };
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
];

const EMOJIS_BOLSITA = ["👜","✈️","🏠","🎓","💻","👗","💍","🎉","🐾","🌱","🚑","🎸","🏋️","📚","🛍️"];

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

const PAISES = [
  { nombre: "Colombia", emoji: "🇨🇴", divisa: "COP", locale: "es-CO" },
  { nombre: "México", emoji: "🇲🇽", divisa: "MXN", locale: "es-MX" },
  { nombre: "Argentina", emoji: "🇦🇷", divisa: "ARS", locale: "es-AR" },
  { nombre: "Chile", emoji: "🇨🇱", divisa: "CLP", locale: "es-CL" },
  { nombre: "Perú", emoji: "🇵🇪", divisa: "PEN", locale: "es-PE" },
  { nombre: "Ecuador", emoji: "🇪🇨", divisa: "USD", locale: "es-EC" },
  { nombre: "Venezuela", emoji: "🇻🇪", divisa: "USD", locale: "es-VE" },
  { nombre: "Guatemala", emoji: "🇬🇹", divisa: "GTQ", locale: "es-GT" },
  { nombre: "Costa Rica", emoji: "🇨🇷", divisa: "CRC", locale: "es-CR" },
  { nombre: "Panamá", emoji: "🇵🇦", divisa: "USD", locale: "es-PA" },
  { nombre: "República Dominicana", emoji: "🇩🇴", divisa: "DOP", locale: "es-DO" },
  { nombre: "Bolivia", emoji: "🇧🇴", divisa: "BOB", locale: "es-BO" },
  { nombre: "Paraguay", emoji: "🇵🇾", divisa: "PYG", locale: "es-PY" },
  { nombre: "Uruguay", emoji: "🇺🇾", divisa: "UYU", locale: "es-UY" },
  { nombre: "Honduras", emoji: "🇭🇳", divisa: "HNL", locale: "es-HN" },
  { nombre: "El Salvador", emoji: "🇸🇻", divisa: "USD", locale: "es-SV" },
  { nombre: "Nicaragua", emoji: "🇳🇮", divisa: "NIO", locale: "es-NI" },
  { nombre: "Puerto Rico", emoji: "🇵🇷", divisa: "USD", locale: "es-PR" },
  { nombre: "España", emoji: "🇪🇸", divisa: "EUR", locale: "es-ES" },
  { nombre: "Estados Unidos", emoji: "🇺🇸", divisa: "USD", locale: "en-US" },
  { nombre: "Otro", emoji: "🌎", divisa: "USD", locale: "en-US" },
];

const RANGOS_EDAD = ["18-24", "25-34", "35-44", "45-54", "55+"];

type Step =
  | "perfil_inicial"
  | "welcome"
  | "ingresos"
  | "gastos"
  | "amy_detective"
  | "deudas"
  | "deuda_intro"
  | "no_puede_intro"
  | "deuda_quiz"
  | "deuda_resultado"
  | "ahorro_intro"
  | "cajitas_onboarding"
  | "ahorro_puede"
  | "ahorro_tipo"
  | "bolsitas_crear"
  | "guardando";

const METHOD_INFO = {
  snowball: {
    emoji: "❄️",
    nombre: "Bola de nieve",
    autor: "Dave Ramsey",
    desc: "Vas a enfocarte primero en la deuda más pequeña. Cuando la elimines, ese logro te va a dar el impulso para atacar la siguiente. Lo que vamos a hacer es ordenar tus deudas de menor a mayor y ir tachándolas una por una. Más adelante vas a ver esto organizado en tu panel.",
    sort: (a: DeudaItem, b: DeudaItem) => a.total_pendiente - b.total_pendiente,
  },
  avalanche: {
    emoji: "🏔️",
    nombre: "Avalancha",
    autor: "Suze Orman",
    desc: "Vas a enfocarte primero en la deuda que más te cuesta en intereses. Esto es lo más inteligente para ahorrar dinero a largo plazo. Lo que vamos a hacer es atacar primero la deuda más cara y bajar los intereses que pagas cada mes. Más adelante vas a ver esto organizado en tu panel.",
    sort: (a: DeudaItem, b: DeudaItem) => {
      const ta = parseFloat(a.tasa) || 0;
      const tb = parseFloat(b.tasa) || 0;
      return tb !== ta ? tb - ta : b.total_pendiente - a.total_pendiente;
    },
  },
  balanced: {
    emoji: "⚖️",
    nombre: "Equilibrada",
    autor: "T. Harv Eker",
    desc: "Aquí no te enfocas en una sola deuda. Vas a avanzar en varias al mismo tiempo de forma estable, sin sentir que nada se te sale de control. Lo que vamos a hacer es distribuir tus pagos para que todas tus deudas avancen juntas. Más adelante vas a ver esto organizado en tu panel.",
    sort: () => 0,
  },
};

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("perfil_inicial");
  const [userId, setUserId] = useState<string | null>(null);
  const [reinforcement, setReinforcement] = useState("");
  const reinforcementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 1: Ingresos
  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresosOtros, setIngresosOtros] = useState<ListItem[]>([]);
  const [nuevoIngNombre, setNuevoIngNombre] = useState("");
  const [nuevoIngValor, setNuevoIngValor] = useState("");
  const [nuevoIngOtraMoneda, setNuevoIngOtraMoneda] = useState(false);
  const [nuevoIngDivisa, setNuevoIngDivisa] = useState("USD");
  const [nuevoIngValorOriginal, setNuevoIngValorOriginal] = useState("");

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
  const [cajMeses, setCajMeses] = useState("2");
  const [cajFecha, setCajFecha] = useState("");

  // Step 4c: Ahorro
  const [selectedAhorro, setSelectedAhorro] = useState<number | null>(null);

  // Step 4d: Bolsitas onboarding
  const [bolsitasOB, setBolsitasOB] = useState<BolsitaOB[]>([]);
  const [bolTipo, setBolTipo] = useState<"fondos" | "metas">("fondos");
  const [bolNombre, setBolNombre] = useState("");
  const [bolEmoji, setBolEmoji] = useState("👜");
  const [bolCuota, setBolCuota] = useState("");
  const [bolMeta, setBolMeta] = useState("");
  const [bolFecha, setBolFecha] = useState("");
  const [bolImportancia, setBolImportancia] = useState(3);
  const [editingBolCuota, setEditingBolCuota] = useState(false);

  const [saving, setSaving] = useState(false);

  // Pre-onboarding profile
  const [paisSeleccionado, setPaisSeleccionado] = useState<typeof PAISES[0] | null>(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("");
  const [edadRango, setEdadRango] = useState("");

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
      if (profile?.onboarding_completed) {
        try { localStorage.removeItem(`amy_onboarding_draft_${user.id}`); } catch {}
        window.location.href = "/app";
      }
    }
    init();
  }, []);

  // Guardado de progreso (roadmap 3.1): el borrador vive en localStorage. Sobrevive
  // salir y volver en el mismo navegador; no cruza dispositivos (decisión consciente).
  const draftRestored = useRef(false);
  const draftKey = userId ? `amy_onboarding_draft_${userId}` : null;

  useEffect(() => {
    if (!draftKey || draftRestored.current) return;
    draftRestored.current = true;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.step && d.step !== "perfil_inicial") {
        setStep(d.step === "guardando" ? "bolsitas_crear" : d.step);
      }
      if (typeof d.ingresoFijo === "string") setIngresoFijo(d.ingresoFijo);
      if (Array.isArray(d.ingresosOtros)) setIngresosOtros(d.ingresosOtros);
      if (Array.isArray(d.gastosFijos)) setGastosFijos(d.gastosFijos);
      if (Array.isArray(d.deudas)) setDeudas(d.deudas);
      if (typeof d.quizStep === "number") setQuizStep(d.quizStep);
      if (Array.isArray(d.quizAnswers)) setQuizAnswers(d.quizAnswers);
      if (d.debtMethod) setDebtMethod(d.debtMethod);
      if (Array.isArray(d.cajitasOB)) setCajitasOB(d.cajitasOB);
      if (typeof d.selectedAhorro === "number") setSelectedAhorro(d.selectedAhorro);
      if (Array.isArray(d.bolsitasOB)) setBolsitasOB(d.bolsitasOB);
      if (d.paisSeleccionado) {
        setPaisSeleccionado(d.paisSeleccionado);
        try {
          localStorage.setItem("amy_pais", JSON.stringify({
            ...d.paisSeleccionado,
            divisa: d.monedaSeleccionada || d.paisSeleccionado.divisa,
          }));
        } catch {}
      }
      if (d.monedaSeleccionada) setMonedaSeleccionada(d.monedaSeleccionada);
      if (d.edadRango) setEdadRango(d.edadRango);
    } catch {
      // borrador corrupto: empezar de cero
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftRestored.current || step === "perfil_inicial" || step === "guardando") return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        step, ingresoFijo, ingresosOtros, gastosFijos, deudas,
        quizStep, quizAnswers, debtMethod,
        cajitasOB, selectedAhorro, bolsitasOB,
        paisSeleccionado, monedaSeleccionada, edadRango,
      }));
    } catch {
      // cuota de localStorage llena u otro error: no bloquear el onboarding
    }
  }, [draftKey, step, ingresoFijo, ingresosOtros, gastosFijos, deudas, quizStep,
      quizAnswers, debtMethod, cajitasOB, selectedAhorro, bolsitasOB,
      paisSeleccionado, monedaSeleccionada, edadRango]);

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
    const loc = paisSeleccionado?.locale ?? "es-CO";
    const cur = monedaSeleccionada || paisSeleccionado?.divisa || "COP";
    return new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
  }

  // El país se guarda en localStorage al final del primer paso, pero el hook de
  // MoneyInput lo lee una sola vez al montar; le pasamos el país en vivo. La moneda es
  // independiente del país (alguien puede vivir en Colombia y cobrar en USD).
  const monedaProps = { locale: paisSeleccionado?.locale, currency: monedaSeleccionada || paisSeleccionado?.divisa };

  function showReinforcement(_msg: string, onContinue: () => void) {
    onContinue();
  }

  // List helpers
  function addIngreso() {
    if (!nuevoIngNombre || !nuevoIngValor) return;
    const item: ListItem = { id: Date.now().toString(), nombre: nuevoIngNombre, valor: parseFloat(nuevoIngValor) };
    if (nuevoIngOtraMoneda && nuevoIngValorOriginal) {
      item.divisaOriginal = nuevoIngDivisa;
      item.valorOriginal = parseFloat(nuevoIngValorOriginal);
    }
    setIngresosOtros([...ingresosOtros, item]);
    setNuevoIngNombre(""); setNuevoIngValor(""); setNuevoIngValorOriginal(""); setNuevoIngOtraMoneda(false);
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
    // Auto-add ingreso if form fields are filled but user forgot to click "+ Agregar"
    if (nuevoIngNombre && nuevoIngValor) {
      setIngresosOtros(prev => [...prev, { id: Date.now().toString(), nombre: nuevoIngNombre, valor: parseFloat(nuevoIngValor) }]);
      setNuevoIngNombre(""); setNuevoIngValor("");
    }
    showReinforcement("Listo, vamos bien ✨", () => setStep("gastos"));
  }

  function goToDeudas() {
    // Auto-add gasto if form fields are filled but user forgot to click "+ Agregar"
    if (nuevoGastNombre && nuevoGastValor) {
      setGastosFijos(prev => [...prev, { id: Date.now().toString(), nombre: nuevoGastNombre, valor: parseFloat(nuevoGastValor) }]);
      setNuevoGastNombre(""); setNuevoGastValor("");
    }
    showReinforcement("Esto ya te da más claridad 💡", () => setStep("deudas"));
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

    let nextStep: Step;
    if (finalCapacidad <= 0) {
      nextStep = "no_puede_intro";
    } else if (finalDeudas.length > 1) {
      nextStep = "deuda_intro";
    } else {
      const disponiblePostGF = totalIngresos - totalGastos;
      nextStep = (totalIngresos > 0 && disponiblePostGF < 0.35 * totalIngresos) ? "amy_detective" : "ahorro_intro";
    }

    showReinforcement("Lo estás haciendo mejor de lo que crees 💪", () => setStep(nextStep));
  }

  function goCajitasToAhorro() {
    setStep("ahorro_puede");
  }

  function quizBack() {
    if (quizStep > 0) {
      setQuizStep(quizStep - 1);
    } else {
      setStep("deuda_intro");
    }
  }

  function answerQuiz(answer: string) {
    // slice hasta quizStep: si volvió atrás y responde de nuevo, reemplaza en vez de acumular
    const newAnswers = [...quizAnswers.slice(0, quizStep), answer];
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
        ingresos_otros: ingresosOtros.map(i => ({
          id: i.id, descripcion: i.nombre, valor: i.valor,
          ...(i.divisaOriginal ? { divisa_original: i.divisaOriginal, valor_original: i.valorOriginal } : {}),
        })),
        gastos_fijos: gastosFijos.reduce((s, g) => s + g.valor, 0),
        gastos_fijos_items: gastosFijos.map(g => ({ id: g.id, nombre: g.nombre, valor: g.valor })),
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
            const fechaPago = c.fecha_pago
              ? `${c.fecha_pago}-01`
              : new Date(now2.getFullYear(), now2.getMonth() + c.meses, 1).toISOString().split("T")[0];
            return { user_id: userId, nombre: c.nombre, emoji: c.emoji, monto_total: c.monto_total, actual: 0, fecha_pago: fechaPago };
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
          user_id: userId, nombre: "Ahorro mensual", emoji: "👜",
          tipo: "fondos", meta: opts.ahorroMonto * 12,
          actual: 0, cuota_mensual: opts.ahorroMonto, importancia: 3, celebrado: false,
        });
      }

      const completeRes = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method: opts.method }),
      });

      if (!completeRes.ok) {
        throw new Error("No se pudo completar el onboarding.");
      }

      try { localStorage.removeItem(`amy_onboarding_draft_${userId}`); } catch {}
      window.location.href = "/app";
    } catch {
      setSaving(false);
    }
  }

  const totalCajitasOBMensual = cajitasOB.reduce((s, c) => s + Math.ceil(c.monto_total / Math.max(1, c.meses)), 0);
  const capacidadNeta = capacidad - totalCajitasOBMensual;

  const bolsitasUsadoMensual = (() => {
    const fondos = bolsitasOB.filter(b => b.tipo === "fondos").reduce((s, b) => s + (b.cuota_mensual ?? 0), 0);
    const metas = bolsitasOB.filter(b => b.tipo === "metas" && b.meta && b.fecha_meta).reduce((s, b) => {
      const [fy, fm] = b.fecha_meta!.split("-").map(Number);
      const now2 = new Date();
      const meses = Math.max(1, (fy - now2.getFullYear()) * 12 + (fm - 1 - now2.getMonth()));
      return s + Math.ceil((b.meta ?? 0) / meses);
    }, 0);
    return fondos + metas;
  })();
  const bolsitasDisponible = (selectedAhorro ?? 0) - bolsitasUsadoMensual;
  const bolCuotaRecomendada = bolsitasDisponible > 0 && bolTipo === "fondos"
    ? Math.round((bolImportancia / 15) * bolsitasDisponible)
    : 0;

  function addCajitaOB() {
    if (!cajNombre || !cajMonto) return;
    setCajitasOB([...cajitasOB, { id: Date.now().toString(), nombre: cajNombre, emoji: cajEmoji, monto_total: parseFloat(cajMonto), meses: parseInt(cajMeses) || 12, fecha_pago: cajFecha || undefined }]);
    setCajNombre(""); setCajMonto(""); setCajEmoji("📦"); setCajMeses("2");
  }

  function addBolsitaOB() {
    if (!bolNombre) return;
    if (bolTipo === "fondos" && !bolCuota) return;
    if (bolTipo === "metas" && (!bolMeta || !bolFecha)) return;
    if (bolTipo === "fondos") {
      const cuota = parseFloat(bolCuota);
      if (cuota > bolsitasDisponible) return;
    }
    if (bolTipo === "metas") {
      const [fy, fm] = bolFecha.split("-").map(Number);
      const now2 = new Date();
      const meses = Math.max(1, (fy - now2.getFullYear()) * 12 + (fm - 1 - now2.getMonth()));
      const costo = Math.ceil(parseFloat(bolMeta) / meses);
      if (costo > bolsitasDisponible) return;
    }
    setBolsitasOB([...bolsitasOB, {
      id: Date.now().toString(), nombre: bolNombre, emoji: bolEmoji, tipo: bolTipo,
      cuota_mensual: bolTipo === "fondos" ? parseFloat(bolCuota) : undefined,
      meta: bolTipo === "metas" ? parseFloat(bolMeta) : undefined,
      fecha_meta: bolTipo === "metas" ? bolFecha : undefined,
      importancia: bolImportancia,
    }]);
    setBolNombre(""); setBolEmoji("👜"); setBolCuota(""); setBolMeta(""); setBolFecha(""); setBolImportancia(3); setEditingBolCuota(false);
  }

  const stepNum = step === "perfil_inicial" ? 0
    : step === "welcome" ? 0
    : step === "ingresos" ? 1
    : step === "gastos" ? 2
    : step === "amy_detective" ? 2
    : step === "deudas" ? 3
    : step === "deuda_intro" ? 3
    : step === "deuda_quiz" ? 3
    : step === "deuda_resultado" ? 3
    : step === "no_puede_intro" ? 3
    : 4;

  const inputCls = "w-full border border-[#ffb8e0] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa] transition-all";
  const btnPink = "bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#ffedfa] flex flex-col items-center justify-center px-4 py-4 sm:py-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb8e0] opacity-30 blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb8e0] opacity-20 blob pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <a href="/" className="inline-block">
            <span className="text-2xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>Amy</span>
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

        {/* Reinforcement toast */}
        {reinforcement && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#ffb8e0] rounded-2xl px-6 py-3 shadow-lg text-sm font-medium text-[#ec7fa9] whitespace-nowrap">
            {reinforcement}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-[#ffb8e0] overflow-hidden">

          {/* ─── PERFIL INICIAL ─── */}
          {step === "perfil_inicial" && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🌎</div>
                <h2 className="text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Antes de empezar
                </h2>
                <p className="text-sm text-[#1a1a2e]/60 mt-1 leading-relaxed">
                  Necesitamos dos datos rápidos para personalizar tu experiencia.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a2e]/70 mb-2">¿De qué país eres?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PAISES.map((p) => (
                      <button
                        key={p.nombre}
                        type="button"
                        onClick={() => { setPaisSeleccionado(p); setMonedaSeleccionada(p.divisa); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          paisSeleccionado?.nombre === p.nombre
                            ? "bg-[#ec7fa9] text-white border-[#ec7fa9]"
                            : "bg-white border-[#ffb8e0] text-[#1a1a2e]/70 hover:border-[#ec7fa9] hover:bg-[#ffedfa]"
                        }`}
                      >
                        <span>{p.emoji}</span>
                        <span className="truncate">{p.nombre}</span>
                      </button>
                    ))}
                  </div>
                  {paisSeleccionado?.nombre === "Otro" && (
                    <p className="text-xs text-[#1a1a2e]/40 mt-2">
                      No pasa nada — elige abajo en qué moneda manejas tu dinero.
                    </p>
                  )}
                </div>

                {paisSeleccionado && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e]/70 mb-2">¿En qué moneda manejas tu dinero?</label>
                    <div className="relative">
                      <select
                        value={monedaSeleccionada}
                        onChange={(e) => setMonedaSeleccionada(e.target.value)}
                        className="w-full appearance-none border border-[#ffb8e0] rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-[#1a1a2e] bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] transition-all cursor-pointer"
                      >
                        {MONEDAS.map((m) => (
                          <option key={m.code} value={m.code}>{m.code} · {m.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ec7fa9]" />
                    </div>
                    <p className="text-xs text-[#1a1a2e]/40 mt-1.5">
                      Por defecto usamos la de tu país, pero si cobras en otra —por ejemplo dólares— la puedes cambiar aquí.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#1a1a2e]/70 mb-2">¿En qué rango de edad estás?</label>
                  <div className="flex flex-wrap gap-2">
                    {RANGOS_EDAD.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEdadRango(r)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          edadRango === r
                            ? "bg-[#ec7fa9] text-white border-[#ec7fa9]"
                            : "bg-white border-[#ffb8e0] text-[#1a1a2e]/70 hover:border-[#ec7fa9] hover:bg-[#ffedfa]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!paisSeleccionado}
                onClick={() => {
                  if (paisSeleccionado) {
                    localStorage.setItem("amy_pais", JSON.stringify({ ...paisSeleccionado, divisa: monedaSeleccionada || paisSeleccionado.divisa }));
                  }
                  if (edadRango) localStorage.setItem("amy_edad", edadRango);
                  setStep("welcome");
                }}
                className="w-full mt-8 bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Continuar →
              </button>
              {!paisSeleccionado && (
                <p className="text-xs text-center text-[#1a1a2e]/40 mt-2">Selecciona tu país para continuar</p>
              )}
            </div>
          )}

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
                <p>Voy guardando tu avance, así que puedes salir y volver cuando quieras. 🌸</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("perfil_inicial")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button
                  onClick={() => setStep("ingresos")}
                  className={`${btnPink} flex-[2] text-base`}
                >
                  Empecemos juntas →
                </button>
              </div>
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-sm font-medium text-[#1a1a2e]/70">Ingreso principal del mes</label>
                    <span className="text-[10px] font-semibold text-[#ec7fa9] bg-[#ffedfa] border border-[#ffb8e0] rounded-full px-2 py-0.5">
                      {paisSeleccionado?.emoji} {monedaSeleccionada || paisSeleccionado?.divisa}
                    </span>
                  </div>
                  <MoneyInput
                    {...monedaProps}
                    value={ingresoFijo}
                    onChange={setIngresoFijo}
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
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#ec7fa9]">{fmt(item.valor)}</p>
                            {item.divisaOriginal && item.valorOriginal != null && (
                              <p className="text-[10px] text-[#1a1a2e]/40">
                                {item.valorOriginal.toLocaleString(paisSeleccionado?.locale ?? "es-CO")} {item.divisaOriginal}
                              </p>
                            )}
                          </div>
                          <button onClick={() => {
                            setNuevoIngNombre(item.nombre); setNuevoIngValor(String(item.valor));
                            if (item.divisaOriginal) { setNuevoIngOtraMoneda(true); setNuevoIngDivisa(item.divisaOriginal); setNuevoIngValorOriginal(String(item.valorOriginal ?? "")); }
                            setIngresosOtros(ingresosOtros.filter(i => i.id !== item.id));
                          }}
                            className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] flex items-center"><Pencil size={12} /></button>
                          <button onClick={() => setIngresosOtros(ingresosOtros.filter(i => i.id !== item.id))}
                            className="text-[#1a1a2e]/20 hover:text-red-400 flex items-center"><X size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs text-[#1a1a2e]/50 mb-2 flex items-center gap-2">
                    ¿Tienes otros ingresos? (freelance, arriendos, etc.)
                    <span className="text-[10px] font-semibold text-[#ec7fa9] bg-[#ffedfa] border border-[#ffb8e0] rounded-full px-2 py-0.5 flex-shrink-0">
                      {paisSeleccionado?.emoji} {monedaSeleccionada || paisSeleccionado?.divisa}
                    </span>
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input type="text" value={nuevoIngNombre} onChange={(e) => setNuevoIngNombre(e.target.value)}
                        placeholder="¿De dónde?"
                        onKeyDown={(e) => e.key === "Enter" && addIngreso()}
                        className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                      {!nuevoIngOtraMoneda && (
                        <MoneyInput {...monedaProps} value={nuevoIngValor} onChange={setNuevoIngValor}
                          placeholder="Valor"
                          onKeyDown={(e) => e.key === "Enter" && addIngreso()}
                          className="w-28 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                      )}
                    </div>

                    {!nuevoIngOtraMoneda ? (
                      <button type="button" onClick={() => setNuevoIngOtraMoneda(true)}
                        className="text-left text-xs text-[#ec7fa9] font-medium hover:underline w-fit">
                        ¿Es en otra moneda?
                      </button>
                    ) : (
                      <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#1a1a2e]/60">Ingreso en otra moneda</p>
                          <button type="button" onClick={() => { setNuevoIngOtraMoneda(false); setNuevoIngValorOriginal(""); }}
                            className="text-[#1a1a2e]/30 hover:text-[#ec7fa9] text-xs flex items-center gap-1"><X size={11} />quitar</button>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select value={nuevoIngDivisa} onChange={(e) => setNuevoIngDivisa(e.target.value)}
                              className="w-full appearance-none border border-[#ffb8e0] rounded-xl pl-3 pr-8 py-2.5 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 cursor-pointer">
                              {MONEDAS.map((m) => <option key={m.code} value={m.code}>{m.code}</option>)}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ec7fa9]" />
                          </div>
                          <input type="text" inputMode="decimal" value={nuevoIngValorOriginal}
                            onChange={(e) => setNuevoIngValorOriginal(e.target.value.replace(/[^0-9.]/g, ""))}
                            placeholder={`¿Cuánto ganas en ${nuevoIngDivisa}?`}
                            className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#1a1a2e]/50 block mb-1">
                            ¿Cuánto es eso en {MONEDAS.find(m => m.code === (monedaSeleccionada || paisSeleccionado?.divisa))?.nombre.toLowerCase() ?? "tu moneda"}?
                          </label>
                          <MoneyInput {...monedaProps} value={nuevoIngValor} onChange={setNuevoIngValor}
                            placeholder="Valor convertido"
                            onKeyDown={(e) => e.key === "Enter" && addIngreso()}
                            className="w-full border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                        </div>
                      </div>
                    )}

                    <button type="button" onClick={addIngreso}
                      className="w-full bg-[#ec7fa9] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#d96d97] transition-colors text-sm">+ Agregar</button>
                  </div>
                  <p className="text-xs text-[#1a1a2e]/40 mt-1.5">Completa los campos y toca <strong>+ Agregar</strong> por cada ingreso extra</p>
                </div>

                {totalIngresos > 0 && (
                  <div className="bg-[#ec7fa9]/10 border border-[#ec7fa9]/30 rounded-xl px-4 py-2.5 text-sm">
                    <span className="text-[#1a1a2e]/60">Total ingresos: </span>
                    <span className="font-bold text-[#ec7fa9]">{fmt(totalIngresos)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep("welcome")}
                  className="flex-1 border border-[#ffb8e0] text-[#1a1a2e]/60 font-semibold py-3.5 rounded-xl hover:bg-[#ffedfa] text-sm transition-colors">
                  ← Atrás
                </button>
                <button
                  onClick={goToGastos}
                  disabled={!ingresoFijo && ingresosOtros.length === 0}
                  className={`${btnPink} flex-[2]`}
                >
                  Siguiente →
                </button>
              </div>
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

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="text" value={nuevoGastNombre} onChange={(e) => setNuevoGastNombre(e.target.value)}
                    placeholder="Nombre del gasto"
                    onKeyDown={(e) => e.key === "Enter" && addGasto()}
                    className="flex-1 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                  <MoneyInput {...monedaProps} value={nuevoGastValor} onChange={setNuevoGastValor}
                    placeholder="Valor"
                    onKeyDown={(e) => e.key === "Enter" && addGasto()}
                    className="w-28 border border-[#ffb8e0] rounded-xl px-3 py-2.5 text-sm bg-[#ffedfa] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30" />
                </div>
                <button type="button" onClick={addGasto}
                  className="w-full bg-[#ec7fa9] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#d96d97] transition-colors text-sm">+ Agregar</button>
              </div>
              <p className="text-xs text-[#1a1a2e]/40 mt-1.5 mb-4">Completa los campos y toca <strong>+ Agregar</strong> por cada gasto fijo</p>

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
          {step === "amy_detective" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-blue-600 text-sm font-bold flex items-center gap-1.5"><Search size={13} />Amy Detective</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                Tus gastos fijos están tomando mucho espacio
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-sm text-[#1a1a2e]/70 leading-relaxed space-y-2">
                <p>¡Oops! Con lo que registraste, tus gastos fijos están usando más del 65% de tus ingresos.</p>
                <p>Eso deja muy poco margen para deudas, ahorro y gastos del día a día.</p>
                <p className="text-blue-700 font-medium">Pero no te preocupes, para eso existe Amy Detective: vamos a revisar juntas cada gasto y encontrar dónde puede haber un respiro.</p>
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
                <button onClick={() => setStep("ahorro_intro")}
                  className="flex-[2] bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                  Entendido, continuar →
                </button>
              </div>
            </div>
          )}

          {/* ─── DEUDAS ─── */}
          {step === "deudas" && (
            <div className="p-8">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Tus deudas, sin miedo
                </h2>
                <button
                  type="button"
                  onClick={goToAhorro}
                  className="text-xs text-[#ec7fa9] border border-[#ffb8e0] rounded-full px-3 py-1.5 hover:bg-[#ffedfa] transition-colors whitespace-nowrap ml-3 font-medium"
                >
                  No tengo deudas →
                </button>
              </div>
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
                    <MoneyInput {...monedaProps} value={dCuota} onChange={setDCuota}
                      placeholder="Ej: 300.000"
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[#1a1a2e]/50 mb-1 block">¿Cuánto debes en total?</label>
                    <MoneyInput {...monedaProps} value={dTotal} onChange={setDTotal}
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
                    className="text-xs text-[#ec7fa9] border border-[#ffb8e0] bg-[#ffedfa] rounded-xl px-4 py-2 hover:bg-[#ffb8e0] transition-colors w-full text-left">
                    + Agregar tasa de interés <span className="text-[#1a1a2e]/40">(opcional, si no la sabes no importa)</span>
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
            </div>
          )}

          {/* ─── AHORRO: PUEDE ─── */}
          {step === "ahorro_puede" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Este es tu punto de partida
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-2 leading-relaxed">
                Con lo que registraste, Amy analizó tu situación y te propone diferentes formas de ahorrar.
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
                <span className="text-red-600 text-sm font-bold flex items-center gap-1.5"><Zap size={13} />Amy Rompe-deudas</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Primero, vamos a ordenar esto juntas 🤝
              </h2>
              <div className="text-sm text-[#1a1a2e]/70 leading-relaxed space-y-3 mb-6 bg-[#ffedfa] rounded-2xl p-5">
                <p>Por ahora, tus gastos y deudas superan tus ingresos.</p>
                <p><strong>Y no pasa nada. Esto es más común de lo que crees.</strong></p>
                <p>En este momento, no tiene sentido presionarte a ahorrar.</p>
                <p>Lo que sí vamos a hacer es enfocarnos en algo más importante: <strong>salir de tus deudas de forma inteligente.</strong> Eso es libertad.</p>
                <p>{deudas.length > 1 ? "Amy Rompe-deudas te va a mostrar el mejor camino para ti." : "Por ahora lo más importante es enfocarte en pagar esa deuda."}</p>
              </div>
              <button
                onClick={() => deudas.length > 1 ? setStep("deuda_quiz") : finalSave({})}
                disabled={saving}
                className={`${btnPink} w-full`}
              >
                {saving ? "Guardando..." : deudas.length > 1 ? "Vamos a encontrar la mejor forma para ti →" : "Entendido, empecemos →"}
              </button>
              <button type="button" onClick={() => setStep("deudas")} disabled={saving}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 mt-1 transition-colors disabled:opacity-40">
                ← Atrás
              </button>
            </div>
          )}

          {/* ─── DEUDA INTRO (cuando puede ahorrar pero tiene deudas) ─── */}
          {step === "deuda_intro" && (
            <div className="p-8">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-600 text-sm font-bold flex items-center gap-1.5"><Zap size={13} />Amy Rompe-deudas</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
                Tener deudas no es malo
              </h2>
              <div className="text-sm text-[#1a1a2e]/70 leading-relaxed space-y-3 mb-6 bg-[#ffedfa] rounded-2xl p-5">
                <p>Las deudas muchas veces nos ayudan a cumplir metas que de otra forma tomarían años: una casa, un carro, estudios o un proyecto de vida.</p>
                <p>El problema no es tenerlas. <strong>El problema es no tener un plan para pagarlas.</strong></p>
                <p className="text-[#ec7fa9] font-medium">Para eso existe Amy Rompe-deudas. Vamos a ayudarte a salir de tus deudas más rápido usando metodologías financieras probadas.</p>
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
                    setStep("amy_detective");
                  } else {
                    setStep("ahorro_intro");
                  }
                }}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors"
              >
                Omitir por ahora, hacer el test después
              </button>
              <button type="button" onClick={() => setStep("deudas")}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors">
                ← Atrás
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

              <div className="space-y-3 mb-4">
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
              <button type="button" onClick={quizBack}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 transition-colors">
                ← Atrás
              </button>
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
                  Metodología recomendada para ti
                </p>
                <p className="text-base font-bold text-[#1a1a2e]">
                  {METHOD_INFO[debtMethod].emoji} Metodología {METHOD_INFO[debtMethod].nombre}
                </p>
                <p className="text-xs text-[#1a1a2e]/40 mt-0.5">
                  por {METHOD_INFO[debtMethod].autor}
                </p>
                <p className="text-xs text-[#1a1a2e]/60 mt-2 leading-relaxed">
                  {METHOD_INFO[debtMethod].desc}
                </p>
              </div>

              {deudas.length > 0 && (
                <div className="mb-5">
                  {debtMethod === "balanced" ? (
                    <>
                      <p className="text-xs font-semibold text-[#1a1a2e]/50 uppercase tracking-wide mb-3">
                        Tus deudas
                      </p>
                      <div className="space-y-2 mb-3">
                        {deudas.map((d) => (
                          <div key={d.id} className="flex-1 bg-[#ffedfa] rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#1a1a2e]">{d.nombre}</span>
                            <span className="text-sm font-bold text-[#1a1a2e]">{fmt(d.total_pendiente)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#ec7fa9]/80 bg-[#ffedfa] rounded-xl px-4 py-2.5 text-center">
                        Con esta metodología todas avanzan al mismo tiempo ✨
                      </p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      setStep("amy_detective");
                    } else {
                      setStep("ahorro_intro");
                    }
                  }}
                  className={`${btnPink} w-full`}
                >
                  Ahora veamos cuánto puedes ahorrar →
                </button>
              )}
              <button type="button" disabled={saving}
                onClick={() => { setQuizStep(QUIZ.length - 1); setStep("deuda_quiz"); }}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 mt-1 transition-colors disabled:opacity-40">
                ← Atrás
              </button>
            </div>
          )}

          {/* ─── CAJITAS ONBOARDING ─── */}
          {step === "ahorro_intro" && (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <PiggyBank size={52} className="text-[#ec7fa9]" strokeWidth={1.25} />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                Ahora vamos con tus ahorros
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-6 leading-relaxed">
                En Amy vas a organizar tu dinero en dos tipos de bolsitas. Cada una tiene un propósito diferente.
              </p>
              <div className="space-y-3 mb-8 text-left">
                <div className="bg-white border border-[#ffb8e0] rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">Cajitas</p>
                    <p className="text-xs text-[#1a1a2e]/60 mt-0.5 leading-relaxed">Gastos fijos grandes que no pasan todos los meses, como el SOAT, el impuesto predial o la matrícula. Amy los divide en cuotas mensuales y los descuenta de tu presupuesto para que cuando llegue el momento ya tengas el dinero listo.</p>
                  </div>
                </div>
                <div className="bg-white border border-[#ffb8e0] rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-2xl">👜</span>
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">Bolsitas de ahorro</p>
                    <p className="text-xs text-[#1a1a2e]/60 mt-0.5 leading-relaxed">Para tus metas y sueños: vacaciones, un fondo de emergencia, o lo que quieras. Amy te muestra exactamente cuánto ahorrar cada mes para llegar a tu meta y te ayuda a crear el hábito de ahorrar sin que se sienta difícil.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep("cajitas_onboarding")} className={`${btnPink} w-full`}>
                Empecemos con las cajitas →
              </button>
              <button type="button" onClick={() => setStep("deudas")}
                className="w-full text-center text-sm text-[#1a1a2e]/40 hover:text-[#1a1a2e]/60 py-2 mt-1 transition-colors">
                ← Atrás
              </button>
            </div>
          )}

          {step === "cajitas_onboarding" && (
            <div className="p-8">
              <p className="text-xs font-bold text-[#ec7fa9] uppercase tracking-widest mb-2">Empecemos con las cajitas</p>
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
                <Archive size={20} className="text-[#ec7fa9]" />¿Tienes gastos grandes que no llegan todos los meses?
              </h2>
              <p className="text-sm text-[#1a1a2e]/60 mb-5 leading-relaxed">
                Cosas como el SOAT, impuestos, seguros o matrícula. Amy divide el total en cuotas mensuales y las descuenta de tu presupuesto automáticamente. Así cuando llegue el gasto ya tienes el dinero listo.
              </p>

              {cajitasOB.length > 0 && (
                <div className="space-y-2 mb-4">
                  {cajitasOB.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-[#ffedfa] rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{c.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a2e]">{c.nombre}</p>
                          <p className="text-xs text-[#1a1a2e]/40">{fmt(c.monto_total)} · {fmt(Math.ceil(c.monto_total / c.meses))}/mes{c.fecha_pago ? ` · vence ${new Date(`${c.fecha_pago}-02`).toLocaleDateString("es-CO", { month: "short", year: "numeric" })}` : ""}</p>
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

              <p className="text-xs text-[#1a1a2e]/50 font-semibold mb-1">Sugerencias rápidas</p>
              <p className="text-xs text-[#1a1a2e]/40 mb-2">Toca una para pre-llenar el formulario y ajusta los valores antes de agregar</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {CAJITAS_SUGERIDAS.filter(s => !cajitasOB.find(c => c.nombre === s.nombre)).map((s) => (
                  <button key={s.nombre} type="button"
                    onClick={() => { setCajNombre(s.nombre); setCajEmoji(s.emoji); setCajMonto(String(s.monto)); setCajMeses(String(s.meses)); }}
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
                  <MoneyInput {...monedaProps} value={cajMonto} onChange={setCajMonto} placeholder="Monto total" className={`${inputCls} flex-1`} />
                  <div className="flex flex-col gap-1 w-44">
                    <label className="text-xs text-[#1a1a2e]/50 font-medium">¿Cada cuánto te llega ese gasto?</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={cajMeses}
                      onChange={e => setCajMeses(e.target.value)}
                      placeholder="Ej: 12"
                      className={`${inputCls}`}
                    />
                    <p className="text-[10px] text-[#1a1a2e]/40 leading-tight">2=bimestral · 3=trimestral · 6=semestral · 12=anual</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#1a1a2e]/50 font-medium">¿En qué mes te llega ese gasto?</label>
                  <input
                    type="month"
                    value={cajFecha}
                    onChange={e => setCajFecha(e.target.value)}
                    className={`${inputCls} mt-1 w-full`}
                  />
                  <p className="text-[10px] text-[#1a1a2e]/40 mt-1">Así Amy sabe cuándo tienes que tener el dinero listo.</p>
                </div>
                <button type="button" onClick={() => { addCajitaOB(); setCajFecha(""); }} disabled={!cajNombre || !cajMonto}
                  className="w-full border border-[#ec7fa9] text-[#ec7fa9] font-semibold py-2 rounded-xl text-sm hover:bg-white disabled:opacity-40 transition-colors">
                  + Agregar cajita
                </button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("ahorro_intro")}
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
              <p className="text-sm text-[#1a1a2e]/60 mb-3 leading-relaxed">
                Ahorro mensual: <strong className="text-[#ec7fa9]">{fmt(selectedAhorro ?? 0)}/mes</strong>. Distribúyelo como quieras.
              </p>
              <div className={`rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between text-sm ${bolsitasDisponible < 0 ? "bg-red-50 border border-red-200" : bolsitasDisponible === 0 ? "bg-orange-50 border border-orange-200" : "bg-[#ec7fa9]/10 border border-[#ec7fa9]/30"}`}>
                <span className={bolsitasDisponible < 0 ? "text-red-500 font-medium" : bolsitasDisponible === 0 ? "text-orange-500 font-medium" : "text-[#1a1a2e]/60"}>
                  {bolsitasDisponible <= 0 ? "¡Dinero completamente repartido!" : "Dinero disponible para repartir"}
                </span>
                <span className={`font-bold ${bolsitasDisponible < 0 ? "text-red-500" : bolsitasDisponible === 0 ? "text-orange-500" : "text-[#ec7fa9]"}`}>{fmt(bolsitasDisponible)}/mes</span>
              </div>

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

              {bolsitasDisponible <= 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-center">
                  <p className="text-sm text-orange-600 font-medium">Ya repartiste todo tu dinero de ahorro</p>
                  <p className="text-xs text-orange-500 mt-0.5">Elimina una bolsita para agregar otra, o continúa así.</p>
                </div>
              )}

              <div className={`bg-[#ffedfa] rounded-2xl p-4 mb-4 ${bolsitasDisponible <= 0 ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setBolTipo("fondos")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${bolTipo === "fondos" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60"}`}>
                    <PiggyBank size={14} />Ahorro continuo
                  </button>
                  <button type="button" onClick={() => setBolTipo("metas")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${bolTipo === "metas" ? "bg-[#ec7fa9] text-white" : "bg-white border border-[#ffb8e0] text-[#1a1a2e]/60"}`}>
                    <Target size={14} />Meta con fecha
                  </button>
                </div>

                {bolTipo === "fondos" && (
                  <div className="bg-white border border-[#ffb8e0] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-xs font-semibold text-[#ec7fa9] mb-0.5">Ahorro continuo, sin fecha límite</p>
                    <p className="text-xs text-[#1a1a2e]/60 leading-relaxed">Apartas una cantidad fija cada mes, sin un objetivo específico. Ideal para el fondo de emergencias, ropa, tecnología o cualquier cosa que quieras ir acumulando sin prisa.</p>
                  </div>
                )}
                {bolTipo === "metas" && (
                  <div className="bg-white border border-[#ffb8e0] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-xs font-semibold text-[#ec7fa9] mb-0.5">Meta con fecha, Amy hace el cálculo</p>
                    <p className="text-xs text-[#1a1a2e]/60 leading-relaxed">Tienes un sueño con precio y fecha. Le dices a Amy cuánto necesitas y para cuándo, y ella te dice exactamente cuánto apartar cada mes para llegar a tiempo. Ej: viaje a México en diciembre, computador nuevo en marzo.</p>
                  </div>
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
                  <div className="mb-2">
                    {bolCuota && !editingBolCuota ? (
                      <div className="flex items-center justify-between bg-[#ec7fa9]/10 border border-[#ec7fa9]/40 rounded-xl px-3 py-2.5">
                        <div>
                          <p className="text-xs text-[#1a1a2e]/50">Apartando</p>
                          <p className="text-base font-bold text-[#ec7fa9]">{fmt(parseFloat(bolCuota))}/mes</p>
                        </div>
                        <button type="button" onClick={() => setEditingBolCuota(true)}
                          className="p-1.5 text-[#1a1a2e]/40 hover:text-[#ec7fa9] rounded-lg hover:bg-white transition-colors">
                          <Pencil size={14} />
                        </button>
                      </div>
                    ) : editingBolCuota ? (
                      <div className="flex gap-2">
                        <MoneyInput {...monedaProps} value={bolCuota} onChange={setBolCuota}
                          autoFocus
                          placeholder={bolCuotaRecomendada > 0 ? String(bolCuotaRecomendada) : "Monto mensual"}
                          className={`${inputCls} flex-1 ${bolCuota && parseFloat(bolCuota) > bolsitasDisponible ? "border-red-400" : ""}`} />
                        <button type="button" onClick={() => setEditingBolCuota(false)} disabled={!bolCuota}
                          className="bg-[#ec7fa9] text-white px-3 py-2.5 rounded-xl hover:bg-[#d96d97] disabled:opacity-40 flex items-center">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : bolCuotaRecomendada > 0 ? (
                      <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-xl px-3 py-2.5">
                        <p className="text-xs text-[#1a1a2e]/50 mb-1.5">Amy recomienda apartar</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-[#ec7fa9]">{fmt(bolCuotaRecomendada)}<span className="text-xs font-normal text-[#1a1a2e]/40">/mes</span></p>
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => { setBolCuota(String(bolCuotaRecomendada)); setEditingBolCuota(false); }}
                              className="bg-[#ec7fa9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#d96d97] flex items-center gap-1">
                              <Check size={12} />Aceptar
                            </button>
                            <button type="button" onClick={() => { setBolCuota(String(bolCuotaRecomendada)); setEditingBolCuota(true); }}
                              className="border border-[#ffb8e0] bg-white text-[#1a1a2e]/40 px-2.5 py-1.5 rounded-lg hover:text-[#ec7fa9] flex items-center">
                              <Pencil size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <MoneyInput {...monedaProps} value={bolCuota} onChange={setBolCuota}
                        placeholder="¿Cuánto apartas al mes?"
                        className={inputCls} />
                    )}
                    {bolCuota && parseFloat(bolCuota) > bolsitasDisponible && (
                      <p className="text-xs text-red-500 mt-1">Excede el dinero disponible. Máximo: {fmt(bolsitasDisponible)}/mes</p>
                    )}
                  </div>
                )}
                {bolTipo === "metas" && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <MoneyInput {...monedaProps} value={bolMeta} onChange={setBolMeta} placeholder="Meta total" className={inputCls} />
                    <input type="date" value={bolFecha} onChange={e => setBolFecha(e.target.value)} className={inputCls} />
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-[#1a1a2e]/50 mb-1.5">¿Qué tan importante es esta bolsita?</p>
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => { setBolImportancia(n); if (bolTipo === "fondos") { setBolCuota(""); setEditingBolCuota(false); } }}
                        className={`transition-all ${n <= bolImportancia ? "text-[#ec7fa9]" : "text-[#ffb8e0]"}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={n <= bolImportancia ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={addBolsitaOB}
                  disabled={
                    !bolNombre ||
                    (bolTipo === "fondos" && (!bolCuota || parseFloat(bolCuota) > bolsitasDisponible)) ||
                    (bolTipo === "metas" && (!bolMeta || !bolFecha))
                  }
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
