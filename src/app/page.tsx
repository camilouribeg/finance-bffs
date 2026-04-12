"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "¿Para quién?", href: "#para-quien" },
  { label: "Qué incluye", href: "#que-incluye" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
];

const BENEFITS = [
  "Empiezas a entender en qué se te va cada mes",
  "Dejas de sentirte perdida con tu dinero",
  "Tomas decisiones con más tranquilidad",
  "Dejas de evitar ver tus números",
  "Tienes claridad sin sentirte abrumada",
  "Sientes que por fin tienes control",
];

const SIMPLE = [
  "Sin Excel complicados",
  "Sin fórmulas",
  "Sin procesos largos",
  "Sin tener que saber de finanzas o matemáticas",
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Entras a la plataforma",
    desc: "Creas tu cuenta, es tuya y solo tuya. Tus datos son privados.",
  },
  {
    num: "02",
    title: "Registras tu mes",
    desc: "Anotas lo que te entra y lo que gastas. Finly hace los cálculos por ti. Además, te muestra cómo ahorrar mejor y, si tienes deudas, cómo empezar a salir de ellas.",
  },
  {
    num: "03",
    title: "Ves tu dinero claro",
    desc: "Finly te muestra exactamente a dónde se va tu dinero y qué podrías ajustar.",
  },
  {
    num: "04",
    title: "Empiezas el nuevo mes con claridad",
    desc: "Al inicio de cada mes, Finly te muestra cómo terminó el anterior y te deja todo listo para el siguiente, con saldos actualizados.",
  },
];

const PLANS = [
  {
    name: "Acceso 1 mes",
    price: "$7.99",
    period: "pago único",
    desc: "Pruébalo sin compromiso",
    features: ["Acceso completo por 1 mes", "Dashboard mensual", "Tracking de gastos", "Bolsillos de ahorro"],
    cta: "Empezar ahora",
    highlight: false,
  },
  {
    name: "Plan mensual",
    price: "$5.99",
    period: "/ mes",
    desc: "La opción más flexible",
    features: ["Todo lo del acceso 1 mes", "Historial de meses anteriores", "Cancela cuando quieras", "Actualizaciones incluidas"],
    cta: "Elegir mensual",
    highlight: true,
  },
  {
    name: "Plan anual",
    price: "$49.99",
    period: "/ año",
    desc: "Ahorra más de $21 USD",
    features: ["Todo lo del plan mensual", "Precio bloqueado por 1 año", "Prioridad en soporte", "Acceso a nuevas funciones"],
    cta: "Elegir anual",
    highlight: false,
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#ffedfa]">

      {/* ───── NAVBAR ───── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#ffb8e0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#ec7fa9]" style={{ fontFamily: "var(--font-playfair)" }}>
              Finance BFFs
            </span>
            <span className="text-lg">💕</span>
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm font-medium text-[#1a1a2e]/70 hover:text-[#ec7fa9] transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="/register"
            className="hidden md:inline-flex items-center gap-2 bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
          >
            Crear mi cuenta ✨
          </a>

          <button className="md:hidden p-2 text-[#ec7fa9]" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#ffb8e0] px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#1a1a2e]/70" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="/register" className="bg-[#ec7fa9] text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center" onClick={() => setMenuOpen(false)}>
              Crear mi cuenta ✨
            </a>
          </div>
        )}
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#ffb8e0] opacity-50 blob" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ffb8e0] opacity-30 blob" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#ffb8e0] text-[#ec7fa9] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#ec7fa9] rounded-full inline-block" />
            Preventa abierta — plazas limitadas
          </div>

          {/* Story */}
          <p className="text-[#ec7fa9] font-medium text-lg mb-3">Te entra dinero… pero no sabes en qué se va.</p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Y eso <span className="italic text-[#ec7fa9]">cansa.</span>
          </h1>
          <p className="text-lg text-[#1a1a2e]/60 max-w-xl mx-auto mb-3 leading-relaxed">
            No necesitas hacerlo perfecto ni sola.<br />
            Solo necesitas una forma más simple.
          </p>
          <p className="text-base text-[#1a1a2e]/80 max-w-xl mx-auto mb-10 font-medium">
            Entender tu dinero no tiene que ser complicado.<br />
            Solo necesitas empezar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#ec7fa9] hover:bg-[#d96d97] text-white font-semibold text-base px-8 py-4 rounded-full transition-colors shadow-lg"
            >
              Crear mi cuenta 💕
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#ffedfa] text-[#ec7fa9] font-semibold text-base px-8 py-4 rounded-full border border-[#ffb8e0] transition-colors"
            >
              Ya tengo cuenta
            </a>
          </div>

          <p className="mt-8 text-sm text-[#1a1a2e]/40">
            Por{" "}
            <a href="https://www.instagram.com/financebestfriends" target="_blank" rel="noopener noreferrer" className="text-[#ec7fa9] font-medium hover:underline">
              @financebestfriends
            </a>
          </p>
        </div>
      </section>

      {/* ───── DESCRIPCIÓN ───── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            ¿Qué es <span className="italic text-[#ec7fa9]">Finly</span>?
          </h2>
          <p className="text-lg text-[#1a1a2e]/70 leading-relaxed mb-4">
            Una herramienta mensual donde organizas tu dinero sin enredos.
          </p>
          <p className="text-lg text-[#1a1a2e]/70 leading-relaxed mb-4">
            Registras lo que te entra y lo que gastas, y automáticamente ves todo claro: en qué se va tu dinero, cuánto puedes ahorrar y cómo organizarte mejor.
          </p>
          <p className="text-lg text-[#1a1a2e]/70 leading-relaxed mb-8">
            Incluye dashboards, guías simples y métodos de ahorro, todo pensado para que no tengas que entender fórmulas ni complicarte.
          </p>
          <div className="inline-block bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-8 py-4">
            <p className="text-[#1a1a2e] font-semibold text-lg">
              Tú solo escribes tus números.<br />
              <span className="text-[#ec7fa9]">Finly hace el resto.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ───── BENEFITS ───── */}
      <section id="para-quien" className="py-20 px-6 bg-[#ffedfa]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
              Cuando empiezas a usar Finly,<br />
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

          {/* Simple section */}
          <div className="bg-white rounded-3xl border border-[#ffb8e0] p-8 text-center">
            <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Es mucho más simple de lo que crees
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {SIMPLE.map((s, i) => (
                <div key={i} className="bg-[#ffedfa] rounded-xl p-4">
                  <p className="text-sm text-[#1a1a2e]/70 font-medium">✗ {s}</p>
                </div>
              ))}
            </div>
            <p className="text-[#ec7fa9] font-semibold text-lg">
              Solo registras tus números y todo se ordena para ti
            </p>
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Así de simple funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="bg-[#ffedfa] rounded-2xl border border-[#ffb8e0] p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ec7fa9] mb-4">
                  <span className="text-white font-bold text-sm">{s.num}</span>
                </div>
                <h3 className="font-semibold text-[#1a1a2e] text-lg mb-2">{s.title}</h3>
                <p className="text-[#1a1a2e]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="precios" className="py-20 px-6 bg-[#ffedfa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
              Elige tu plan
            </h2>
            <p className="text-[#1a1a2e]/60">Sin sorpresas. Cancela cuando quieras.</p>
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
                <p className={`font-semibold text-lg mb-1 ${p.highlight ? "text-white" : "text-[#1a1a2e]"}`}>
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
      <footer className="bg-[#1a1a2e] py-12 px-6 text-center">
        <p className="text-2xl font-bold text-[#ec7fa9] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Finance BFFs 💕
        </p>
        <p className="text-white/40 text-sm mb-4">Tu mejor amiga en las finanzas.</p>
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
