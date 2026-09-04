"use client";

import { useState, useEffect } from "react";
import AmyMockup from "@/components/landing/AmyMockup";

const NAV_LINKS = [
  { label: "¿Qué es Amy?", href: "#que-incluye" },
  { label: "¿Por qué Amy?", href: "#por-que" },
  { label: "¿Cómo funciona?", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
];

// Lo que encontrabamos al intentar aprender de dinero. Van tachados: son el
// "antes" que la cita de abajo resuelve.
const RUIDO = ["Términos complicados", "Hojas de cálculo", "Consejos sin el cómo"];

// El manifiesto es aspiracional; los BENEFITS de abajo son lo concreto que
// pasa al usar Amy. El eco entre ambos es intencional.
//
// Iconos de trazo propios en vez de emoji: el emoji mete su propia paleta y
// su propio estilo, y rompia el tono editorial de la seccion. Todos comparten
// viewBox 24, trazo 1.75 y heredan el rosa por `currentColor`.
const MANIFIESTO = [
  {
    text: "Ahorro que sí dura",
    icon: (
      <>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </>
    ),
  },
  {
    text: "Deudas con un plan",
    icon: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9.2 12.2l1.9 1.9 3.7-3.8" />
      </>
    ),
  },
  {
    text: "Metas con una fecha",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    text: "Finanzas sin susto",
    icon: <path d="M12 20.3s-7.2-4.4-7.2-9.2a4.1 4.1 0 0 1 7.2-2.7 4.1 4.1 0 0 1 7.2 2.7c0 4.8-7.2 9.2-7.2 9.2z" />,
  },
];

const BENEFITS = [
  "Sabes en qué se te va el dinero",
  "Sabes qué hacer primero, sin adivinar",
  "Dejas de evitar mirar tus números",
  "Ahorras con método, no con lo que sobra",
  "Cada meta y cada deuda, con su plan",
  "Decides con más tranquilidad",
];

const SIMPLE = [
  "Sin Excel complicados",
  "Sin fórmulas",
  "Sin jerga financiera",
  "Sin volverte experta en finanzas",
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Le cuentas cómo estás hoy",
    desc: "Cuánto ganas, en qué gastas, qué debes y qué quieres lograr.",
  },
  {
    num: "02",
    title: "Amy organiza y calcula",
    desc: "Gastos fijos, cajitas, ahorro y cuotas de deudas: todo en un solo lugar.",
  },
  {
    num: "03",
    title: "Te dice por dónde empezar",
    desc: "Qué ajustar primero, qué mejorar y cuál es tu siguiente paso.",
  },
  {
    num: "04",
    title: "Mes a mes creas el hábito",
    desc: "Cada mes cierra solo y el siguiente arranca con los saldos al día.",
  },
];

const PRESALE_PERKS = [
  "Tu precio de hoy se queda así para siempre. Aunque mañana suba, tú sigues pagando lo mismo",
  "Acceso prioritario a nuevas funciones antes que cualquier otra persona",
  "Comunidad privada de Finance BFFs 💕",
  "Soporte directo con el equipo",
];

const PLANS = [
  {
    name: "Acceso 1 mes",
    price: "$7.99",
    period: "pago único",
    desc: "Pruébalo por un mes completo",
    features: ["Acceso completo por 1 mes", "Resumen visual de tus finanzas", "Registro de gastos día a día", "Bolsillos de ahorro"],
    cta: "Empezar ahora",
    highlight: false,
    presale: "Precio de preventa",
  },
  {
    name: "Plan mensual",
    price: "$5.99",
    period: "/ mes",
    desc: "La opción más flexible",
    features: ["Todo lo incluido en el acceso de 1 mes", "Historial de meses anteriores", "Cancela cuando quieras", "Actualizaciones incluidas"],
    cta: "Elegir mensual",
    highlight: true,
    presale: "🔒 Tu precio se bloquea para siempre",
  },
  {
    name: "Plan anual",
    price: "$49.99",
    period: "/ año",
    desc: "Ahorra más de $21 USD",
    features: ["Todo lo incluido en el plan mensual", "Tu tarifa no cambia durante 1 año", "Prioridad en soporte", "Acceso a nuevas funciones"],
    cta: "Elegir anual",
    highlight: false,
    presale: "Mejor precio del año",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  // El header gana sombra al bajar, para despegarse del contenido.
  const [scrolled, setScrolled] = useState(false);
  // Seccion visible actualmente, para orientar a la usuaria mientras navega.
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const secciones = NAV_LINKS
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);
    if (secciones.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(`#${visible.target.id}`);
      },
      // La banda superior evita que la seccion cambie demasiado pronto.
      { rootMargin: "-20% 0px -70% 0px" }
    );
    secciones.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#ffedfa]">

      {/* Capa decorativa fija: las manchas se quedan quietas mientras el
          contenido sube por encima, y ese desfase es el que da profundidad al
          bajar. Va detras de todo el contenido pero por delante del fondo rosa
          (z negativo), y nunca intercepta clicks. */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[12%] -left-40 w-[30rem] h-[30rem] bg-[#ffb8e0] opacity-30 blur-3xl blob" />
        <div className="absolute top-[55%] -right-48 w-[34rem] h-[34rem] bg-[#ec7fa9] opacity-15 blur-3xl blob" />
        <div className="absolute -bottom-40 left-[15%] w-[26rem] h-[26rem] bg-[#ffb8e0] opacity-25 blur-3xl blob" />
      </div>

      {/* ───── NAVBAR ───── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? "bg-white/95 border-[#ffb8e0] shadow-sm" : "bg-white/80 border-[#ffb8e0]/60"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>
              Amy
            </span>
            <span className="hidden sm:inline text-xs text-[#1a1a2e]/40 font-medium mt-1">by Finance BFFs 💕</span>
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={activeSection === l.href ? "true" : undefined}
                  className={`relative text-sm font-medium transition-colors ${
                    activeSection === l.href ? "text-[#ec7fa9]" : "text-[#1a1a2e]/70 hover:text-[#ec7fa9]"
                  }`}
                >
                  {l.label}
                  {activeSection === l.href && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-[#ec7fa9]" />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login"
              className="text-sm font-semibold text-[#ec7fa9] hover:text-[#d96d97] transition-colors px-4 py-2.5">
              Iniciar sesión
            </a>
            <a href="/register"
              className="inline-flex items-center gap-2 bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
              Empezar gratis
            </a>
          </div>

          {/* En movil el CTA se mantiene visible: registrarse no deberia exigir
              abrir el menu primero. */}
          <div className="flex md:hidden items-center gap-1">
            <a
              href="/register"
              className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors"
            >
              Empezar gratis
            </a>
            <button
              className="p-2 text-[#ec7fa9]"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              onClick={() => setMenuOpen(!menuOpen)}
            >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="menu-movil" className="md:hidden bg-white border-t border-[#ffb8e0] px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#1a1a2e]/70" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="/login" className="text-sm font-semibold text-[#ec7fa9] text-center" onClick={() => setMenuOpen(false)}>
              Iniciar sesión
            </a>

          </div>
        )}
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden pt-16 pb-28 lg:pt-20 lg:pb-32 px-6">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#ffb8e0] opacity-50 blob" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ffb8e0] opacity-30 blob" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-12 items-center">

          {/* ── Columna de mensaje ── */}
          <div className="text-center lg:text-left">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 bg-white border border-[#ffb8e0] text-[#ec7fa9] text-sm font-medium px-4 py-1.5 rounded-full mb-7 hover:bg-[#ffedfa] transition-colors cursor-pointer animate-fade-in-up opacity-0 [animation-delay:60ms]"
            >
              <span className="w-2 h-2 bg-[#ec7fa9] rounded-full inline-block animate-pulse" />
              Preventa abierta, plazas limitadas →
            </a>

            <h1
              className="text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-5 animate-fade-in-up opacity-0 [animation-delay:140ms]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Entender tu dinero no tiene que ser{" "}
              <span className="italic text-[#ec7fa9]">complicado.</span>
            </h1>

            {/* La emoción va antes que la explicación funcional */}
            <p className="text-lg text-[#1a1a2e]/60 mb-3 leading-relaxed lg:max-w-lg animate-fade-in-up opacity-0 [animation-delay:220ms]">
              Te entra dinero… pero no sabes en qué se va. Y eso cansa.
            </p>
            <p className="text-base text-[#1a1a2e]/80 mb-3 font-medium lg:max-w-lg animate-fade-in-up opacity-0 [animation-delay:280ms]">
              No necesitas volverte experta en finanzas.<br />
              Ni hacerlo sola.
            </p>
            <p className="text-base text-[#1a1a2e]/60 mb-9 lg:max-w-lg leading-relaxed animate-fade-in-up opacity-0 [animation-delay:340ms]">
              Amy organiza tus finanzas, hace los cálculos por ti y te va diciendo qué hacer primero,
              paso a paso, hasta que ver tus números deje de darte susto.
            </p>

            {/* CTA principal dominante · secundario deliberadamente discreto */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center lg:justify-start animate-fade-in-up opacity-0 [animation-delay:420ms]">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold text-lg px-9 py-4.5 rounded-full transition-all shadow-lg shadow-[#ec7fa9]/30 hover:shadow-xl hover:shadow-[#ec7fa9]/40 hover:-translate-y-0.5"
              >
                Empezar gratis
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center text-[#1a1a2e]/50 hover:text-[#ec7fa9] font-medium text-sm px-4 py-3 transition-colors"
              >
                Ya tengo cuenta
              </a>
            </div>

            <p className="mt-4 text-sm text-[#1a1a2e]/45 animate-fade-in-up opacity-0 [animation-delay:480ms]">
              40 días gratis · Sin tarjeta para empezar
            </p>

            <p className="mt-7 text-sm text-[#1a1a2e]/40 animate-fade-in-up opacity-0 [animation-delay:540ms]">
              by{" "}
              <a href="https://www.instagram.com/financebestfriends" target="_blank" rel="noopener noreferrer" className="text-[#ec7fa9] font-medium hover:underline">
                @financebestfriends
              </a>
            </p>
          </div>

          {/* ── Columna de producto ── */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:300ms]">
            <AmyMockup />
          </div>
        </div>
      </section>

      {/* ───── QUÉ ES ───── */}
      {/* Las secciones blancas se disuelven por arriba y por abajo hacia el
          rosa de la pagina: asi ninguna costura entre secciones se ve como un
          corte plano. Las rosas quedan en color solido y encajan sin borde. */}
      <section id="que-incluye" className="py-20 px-6 -mt-14 bg-[linear-gradient(to_bottom,#ffedfa_0px,#ffffff_5rem,#ffffff_calc(100%_-_5rem),#ffedfa_100%)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
              ¿Qué es <span className="italic text-[#ec7fa9]">Amy</span>?
            </h2>
            <p
              className="text-2xl md:text-3xl text-[#1a1a2e] leading-snug max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Tu mejor amiga para entender y manejar mejor tu dinero.
            </p>
          </div>

          {/* Las dos mitades del producto: entender (lo que ya hacía) y
              acompañar (el scope nuevo). El numero grande hace de ancla visual. */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {[
              {
                num: "1",
                label: "Primero",
                title: "Entiendes",
                desc: "Le cuentas cómo estás hoy: cuánto ganas, en qué gastas, qué debes. Amy organiza y calcula por ti.",
              },
              {
                num: "2",
                label: "Después",
                title: "Mejoras",
                desc: "No se queda en los números: te dice qué hacer primero y cómo crear hábitos que sí mantienes.",
              },
            ].map((c) => (
              <div
                key={c.num}
                className="relative bg-[#ffedfa] border border-[#ffb8e0] rounded-3xl p-7 overflow-hidden"
              >
                <span
                  className="absolute -top-3 right-4 text-8xl font-bold text-[#ffb8e0]/50 leading-none select-none"
                  style={{ fontFamily: "var(--font-playfair)" }}
                  aria-hidden="true"
                >
                  {c.num}
                </span>
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec7fa9] mb-1">
                    {c.label}
                  </p>
                  <p
                    className="text-2xl font-bold text-[#1a1a2e] mb-3"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {c.title}
                  </p>
                  <p className="text-[#1a1a2e]/70 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <span className="inline-block text-sm text-[#1a1a2e]/55 bg-[#ffedfa] rounded-full px-5 py-2.5 mb-10">
              ✦ Con metodologías y conocimiento financiero detrás, explicado simple
            </span>

            <div className="inline-block bg-[#ffedfa] border border-[#ffb8e0] rounded-3xl px-8 py-6 md:px-12">
              <p
                className="text-2xl md:text-3xl font-bold text-[#1a1a2e] leading-snug"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Amy hace fácil entender tus finanzas.<br />
                <span className="text-[#ec7fa9]">Y te acompaña a mejorarlas.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── MANIFIESTO ─────
          Va despues del "que es": primero explicamos que es Amy y despues por
          que existe, que es como el relato se entiende mas natural. */}
      <section id="por-que" className="px-6 pt-4 pb-20">
        <div className="relative max-w-3xl mx-auto bg-white border border-[#ffb8e0] rounded-[2rem] p-8 md:p-14 overflow-hidden">
          {/* Mancha suave: rompe el bloque blanco sin competir con el texto. */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#ffedfa] blob" aria-hidden="true" />

          <div className="relative text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec7fa9] mb-5">
              Por qué existimos
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-[#1a1a2e] leading-[1.15] mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Nadie nos enseñó qué hacer con{" "}
              <span className="italic text-[#ec7fa9]">nuestro dinero</span>
            </h2>

            <p className="text-[#1a1a2e]/60 leading-relaxed max-w-md mx-auto mb-7">
              Llegó el primer sueldo y ya se suponía que sabíamos. Y al buscar ayuda, siempre lo
              mismo:
            </p>

            {/* El "antes", tachado — se lee de un vistazo, sin párrafo. */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {RUIDO.map((r, i) => (
                <span
                  key={i}
                  className="text-sm text-[#1a1a2e]/40 line-through decoration-[#ec7fa9]/50 bg-[#ffedfa] rounded-full px-4 py-2"
                >
                  {r}
                </span>
              ))}
            </div>

            <div className="bg-[#ffedfa] rounded-3xl px-8 py-9 md:px-12 md:py-10 mb-10">
              <p className="text-lg md:text-2xl text-[#1a1a2e] leading-snug">
                Somos esa mejor amiga que se sienta contigo, mira tus finanzas y te dice:{" "}
                <span className="italic font-semibold text-[#ec7fa9]">empecemos por aquí.</span>
              </p>
            </div>

            {/* Sin cajas: cuatro ideas cortas no necesitan borde cada una.
                El circulo del icono ya da el ritmo visual. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mb-11">
              {MANIFIESTO.map((m, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="w-12 h-12 rounded-full bg-[#ffedfa] text-[#ec7fa9] grid place-items-center mb-3">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {m.icon}
                    </svg>
                  </span>
                  <p className="text-sm font-medium text-[#1a1a2e]/75 leading-snug text-balance">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            <p
              className="text-xl md:text-2xl font-bold text-[#1a1a2e] leading-snug"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Una buena relación con el dinero también se aprende.
              <br />
              <span className="text-[#ec7fa9]">Y no tienes que aprenderla sola.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ───── BENEFITS ───── */}
      {/* Sin fondo propio: deja pasar la capa decorativa. El rosa lo pone el
          contenedor de la pagina. */}
      <section id="para-quien" className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
              Cuando empiezas a usar Amy,<br />
              <span className="italic text-[#ec7fa9]">pasa esto</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-4 bg-white border border-[#ffb8e0] rounded-2xl p-5">
                <span className="text-[#ec7fa9] text-xl flex-shrink-0">✦</span>
                <p className="text-[#1a1a2e]/80">{b}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-[#ffb8e0] p-8 text-center">
            <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Es mucho más simple de lo que crees
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {SIMPLE.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#ffedfa] rounded-xl p-4 flex items-center justify-center text-center"
                >
                  <p className="text-sm text-[#1a1a2e]/70 font-medium">✗ {s}</p>
                </div>
              ))}
            </div>
            <p className="text-[#ec7fa9] font-semibold text-lg">
              Tú cuentas cómo estás hoy. Amy ordena, calcula y te dice por dónde empezar.
            </p>
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="como-funciona" className="py-20 px-6 bg-[linear-gradient(to_bottom,#ffedfa_0px,#ffffff_5rem,#ffffff_calc(100%_-_5rem),#ffedfa_100%)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
              Así de simple funciona
            </h2>
            <p className="text-[#1a1a2e]/60">Paso a paso, sin que tengas que adivinar el siguiente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="flex gap-4 bg-[#ffedfa] rounded-2xl border border-[#ffb8e0] p-6">
                <span
                  className="text-3xl font-bold text-[#ec7fa9]/40 leading-none flex-shrink-0"
                  style={{ fontFamily: "var(--font-playfair)" }}
                  aria-hidden="true"
                >
                  {s.num}
                </span>
                <div>
                  <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1.5">{s.title}</h3>
                  <p className="text-[#1a1a2e]/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="precios" className="relative overflow-hidden py-20 pb-28 px-6">
        {/* Misma mancha suave del hero: cierra la pagina con el mismo lenguaje
            visual con el que abre. */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white opacity-50 blob" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
              Elige tu plan
            </h2>
            <p className="text-[#1a1a2e]/60">Sin sorpresas. Cancela cuando quieras.</p>
          </div>

          {/* Presale benefits banner */}
          <div className="bg-[#ec7fa9] rounded-3xl p-6 mb-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse" />
              <p className="font-bold text-sm uppercase tracking-widest">Beneficios de entrar en preventa ahora</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESALE_PERKS.map((perk, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-3">
                  <span className="text-white text-base flex-shrink-0">✓</span>
                  <p className="text-white/90 text-sm">{perk}</p>
                </div>
              ))}
            </div>
            <p className="text-white/70 text-xs mt-4 text-center">
              Plazas limitadas. Estos precios son exclusivos de preventa y pueden cambiar en cualquier momento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div
                key={i}
                className={`rounded-3xl p-7 flex flex-col ${
                  p.highlight
                    ? "bg-[#ec7fa9] text-white shadow-xl scale-105"
                    : "bg-white border border-[#ffb8e0]"
                }`}
              >
                {p.highlight && (
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-3">
                    ✦ Más popular
                  </div>
                )}
                <div className={`text-xs font-semibold mb-2 px-3 py-1 rounded-full inline-block w-fit ${
                  p.highlight ? "bg-white/20 text-white" : "bg-[#ffedfa] text-[#ec7fa9]"
                }`}>
                  {p.presale}
                </div>
                <p className={`font-semibold text-lg mb-1 mt-2 ${p.highlight ? "text-white" : "text-[#1a1a2e]"}`}>
                  {p.name}
                </p>
                <p className={`text-sm mb-4 ${p.highlight ? "text-white/70" : "text-[#1a1a2e]/50"}`}>
                  {p.desc}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${p.highlight ? "text-white" : "text-[#1a1a2e]"}`} style={{ fontFamily: "var(--font-playfair)" }}>
                    {p.price}
                  </span>
                  <span className={`text-sm ml-1 ${p.highlight ? "text-white/70" : "text-[#1a1a2e]/50"}`}>
                    {p.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-2 mb-8 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className={`text-sm flex items-center gap-2 ${p.highlight ? "text-white/90" : "text-[#1a1a2e]/70"}`}>
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/register"
                  className={`text-center font-semibold py-3 rounded-full transition-colors text-sm ${
                    p.highlight
                      ? "bg-white text-[#ec7fa9] hover:bg-[#ffedfa]"
                      : "bg-[#ec7fa9] text-white hover:bg-[#d96d97]"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      {/* Las esquinas redondeadas dejan ver el rosa detras: el bloque oscuro
          cierra la pagina en vez de cortarla en seco. */}
      <footer className="bg-[#1a1a2e] rounded-t-[2.5rem] py-14 px-6 text-center">
        <p className="text-2xl font-bold text-[#ec7fa9] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
          Amy
        </p>
        <p className="text-white/30 text-xs mb-1">by Finance BFFs 💕</p>
        <p className="text-white/40 text-sm mb-4">
          Porque una buena relación con el dinero también se aprende.
        </p>
        <a
          href="https://www.instagram.com/financebestfriends"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#ec7fa9] hover:text-[#ffb8e0] text-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @financebestfriends
        </a>
        <p className="mt-6 text-white/20 text-xs">© {new Date().getFullYear()} Finance BFFs. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
