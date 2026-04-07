"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "¿Para quién?", href: "#para-quien" },
  { label: "Qué incluye", href: "#que-incluye" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Preventa", href: "#preventa" },
];

const PAIN_POINTS = [
  {
    emoji: "💸",
    text: "El dinero te dura menos de lo que entra y no sabes exactamente por qué.",
  },
  {
    emoji: "😰",
    text: "Llegas a fin de mes con la cuenta casi en cero y sin haber ahorrado nada.",
  },
  {
    emoji: "📊",
    text: "Intentaste Excel pero lo abandonaste a la semana porque era muy complicado.",
  },
  {
    emoji: "🛍️",
    text: "Gastos pequeños que 'no cuestan nada' terminan sumando muchísimo.",
  },
];

const FEATURES = [
  {
    icon: "📋",
    title: "Dashboard mensual",
    desc: "Ve en un solo lugar tus ingresos, gastos, ahorro y deudas. Todo calculado automáticamente.",
  },
  {
    icon: "📅",
    title: "Tracking diario de gastos",
    desc: "Registra cada gasto por categoría. Filtra, agrupa y descubre en qué se va tu dinero de verdad.",
  },
  {
    icon: "🐷",
    title: "Bolsillos de ahorro",
    desc: "Crea metas de ahorro personalizadas — viaje, emergencias, lo que sueñes — y síguelas en tiempo real.",
  },
  {
    icon: "💳",
    title: "Control de deudas",
    desc: "Registra tus deudas, cuotas y saldo pendiente. Sabe exactamente cuánto debes y cuándo terminas.",
  },
  {
    icon: "📐",
    title: "Método 60/30/10",
    desc: "Tu dinero automáticamente dividido: 60% necesidades, 30% estilo de vida, 10% ahorro.",
  },
  {
    icon: "✅",
    title: "Checklist mensual",
    desc: "Recibe recordatorios de los pasos clave antes de que termine el mes para que no se te escape nada.",
  },
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
    desc: "Ingresas tus ingresos y gastos. La plataforma hace todos los cálculos por ti.",
  },
  {
    num: "03",
    title: "Tomas control",
    desc: "Ves exactamente a dónde va tu dinero y decides con claridad qué cambiar.",
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to email list / Stripe presale
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fff8f9]">
      {/* ───── NAVBAR ───── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#ffd6e0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#ff2d78]" style={{ fontFamily: "var(--font-playfair)" }}>
              Finance BFFs
            </span>
            <span className="text-lg">💕</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-[#1a1a2e]/70 hover:text-[#ff2d78] transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#preventa"
            className="hidden md:inline-flex items-center gap-2 bg-[#ff2d78] hover:bg-[#e0255f] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
          >
            Unirme a la preventa ✨
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#ff2d78]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#ffd6e0] px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#1a1a2e]/70 hover:text-[#ff2d78] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#preventa"
              className="inline-flex items-center justify-center gap-2 bg-[#ff2d78] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              Unirme a la preventa ✨
            </a>
          </div>
        )}
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        {/* Background blobs */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 bg-[#ffd6e0] opacity-60 blob"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ffb6c9] opacity-40 blob"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#fff0f3] border border-[#ffd6e0] text-[#ff2d78] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#ff2d78] rounded-full animate-pulse-soft inline-block" />
            Preventa abierta — plazas limitadas
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-[#1a1a2e] leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tu mejor amiga{" "}
            <span className="italic text-[#ff2d78]">en las finanzas</span>
          </h1>

          <p className="text-lg md:text-xl text-[#1a1a2e]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plataforma de finanzas personales diseñada para mujeres. Sin Excel,
            sin estrés, sin juicio. Solo tú, tu dinero y claridad total.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#preventa"
              className="inline-flex items-center justify-center gap-2 bg-[#ff2d78] hover:bg-[#e0255f] text-white font-semibold text-base px-8 py-4 rounded-full transition-colors shadow-lg shadow-pink-200"
            >
              Quiero mi acceso con descuento 💕
            </a>
            <a
              href="#que-incluye"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#fff0f3] text-[#ff2d78] font-semibold text-base px-8 py-4 rounded-full border border-[#ffd6e0] transition-colors"
            >
              Ver qué incluye
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-10 text-sm text-[#1a1a2e]/40">
            Creada por{" "}
            <a
              href="https://www.instagram.com/financebestfriends"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff2d78] font-medium hover:underline"
            >
              @financebestfriends
            </a>{" "}
            — finanzas con cariño 💖
          </p>
        </div>

        {/* Floating app mockup cards */}
        <div className="relative max-w-4xl mx-auto mt-16 grid grid-cols-3 gap-4 px-4">
          <div className="animate-float bg-white rounded-2xl shadow-lg p-5 border border-[#ffd6e0]" style={{ animationDelay: "0s" }}>
            <p className="text-xs text-[#ff2d78] font-semibold uppercase tracking-wide mb-1">Ingresos del mes</p>
            <p className="text-2xl font-bold text-[#1a1a2e]">$3.200.000</p>
            <p className="text-xs text-green-500 mt-1">↑ vs mes anterior</p>
          </div>
          <div className="animate-float bg-[#ff2d78] rounded-2xl shadow-lg p-5" style={{ animationDelay: "0.5s" }}>
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-1">Ahorro este mes</p>
            <p className="text-2xl font-bold text-white">$320.000</p>
            <p className="text-xs text-white/70 mt-1">10% de tus ingresos 🎉</p>
          </div>
          <div className="animate-float bg-white rounded-2xl shadow-lg p-5 border border-[#ffd6e0]" style={{ animationDelay: "1s" }}>
            <p className="text-xs text-[#ff2d78] font-semibold uppercase tracking-wide mb-1">Disponible</p>
            <p className="text-2xl font-bold text-[#1a1a2e]">$480.000</p>
            <p className="text-xs text-[#1a1a2e]/50 mt-1">Para lo que quieras ✨</p>
          </div>
        </div>
      </section>

      {/* ───── PAIN POINTS ───── */}
      <section id="para-quien" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ¿Te suena familiar?
            </h2>
            <p className="text-[#1a1a2e]/60 text-lg">
              Si dijiste "sí" a alguna de estas, Finance BFFs es para ti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-[#fff8f9] border border-[#ffd6e0] rounded-2xl p-6"
              >
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <p className="text-[#1a1a2e]/80 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center bg-[#fff0f3] border border-[#ffd6e0] rounded-2xl p-8">
            <p
              className="text-2xl font-bold text-[#ff2d78] mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              No necesitas ser experta en finanzas.
            </p>
            <p className="text-[#1a1a2e]/70 text-lg">
              Solo necesitas la herramienta correcta — y alguien que te acompañe sin juzgarte.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="que-incluye" className="py-20 px-6 bg-[#fff8f9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Todo lo que incluye{" "}
              <span className="italic text-[#ff2d78]">la plataforma</span>
            </h2>
            <p className="text-[#1a1a2e]/60 text-lg max-w-2xl mx-auto">
              No es un Excel. No es un PDF. Es una herramienta viva que trabaja contigo
              todos los días.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-[#ffd6e0] rounded-2xl p-6 hover:shadow-lg hover:shadow-pink-100 transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#1a1a2e] text-lg mb-2">{f.title}</h3>
                <p className="text-[#1a1a2e]/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Así de simple funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fff0f3] border-2 border-[#ff2d78] mb-4">
                  <span
                    className="text-2xl font-bold text-[#ff2d78]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {s.num}
                  </span>
                </div>
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute translate-x-full -translate-y-8 text-[#ffd6e0] text-2xl">
                    →
                  </div>
                )}
                <h3 className="font-semibold text-[#1a1a2e] text-lg mb-2">{s.title}</h3>
                <p className="text-[#1a1a2e]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRESALE CTA ───── */}
      <section id="preventa" className="py-20 px-6 bg-[#ff2d78] relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-72 h-72 bg-white opacity-5 blob"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 bg-white opacity-5 blob"
          aria-hidden="true"
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-white/80 font-medium uppercase tracking-widest text-sm mb-4">
            🔒 Preventa exclusiva
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Sé de las primeras
          </h2>
          <p className="text-white/80 text-lg mb-2">
            Acceso anticipado + precio especial de lanzamiento.
          </p>
          <p className="text-white/60 text-sm mb-10">
            Sin compromisos. Te avisamos cuando abrimos la plataforma.
          </p>

          {submitted ? (
            <div className="bg-white/20 backdrop-blur rounded-2xl p-8 text-white">
              <p className="text-3xl mb-3">💕</p>
              <p className="text-xl font-semibold mb-2">¡Ya estás en la lista, BFF!</p>
              <p className="text-white/80 text-sm">
                Te escribiremos al correo cuando abramos. Estamos muy emocionadas de tenerte.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="flex-1 bg-white text-[#1a1a2e] placeholder-[#1a1a2e]/40 rounded-full px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="bg-[#1a1a2e] hover:bg-black text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm whitespace-nowrap"
              >
                ¡Apúntame! ✨
              </button>
            </form>
          )}

          <p className="mt-6 text-white/50 text-xs">
            Sin spam. Solo noticias de Finance BFFs. Puedes cancelar cuando quieras.
          </p>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#1a1a2e] py-12 px-6 text-center">
        <p
          className="text-2xl font-bold text-[#ff85a1] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Finance BFFs 💕
        </p>
        <p className="text-white/40 text-sm mb-4">
          Tu mejor amiga en las finanzas.
        </p>
        <a
          href="https://www.instagram.com/financebestfriends"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#ff85a1] hover:text-[#ff2d78] text-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @financebestfriends
        </a>
        <p className="mt-6 text-white/20 text-xs">
          © {new Date().getFullYear()} Finance BFFs. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
