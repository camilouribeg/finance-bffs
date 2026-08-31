/**
 * Mockup de alta fidelidad del producto para el Hero de la landing.
 *
 * Los montos son ficticios y están escritos a mano a propósito: es una pieza
 * de marketing, no un dato real de la usuaria, así que no usa `useFmt` (que
 * adapta la divisa a cada país). Las cifras respetan la fórmula del producto:
 * Dinero libre = Ingresos − Gastos fijos − Cajitas − Bolsillos − Cuotas deudas
 */

const RESUMEN = [
  { label: "Gastos fijos", monto: "$1.450.000", pct: 38, color: "#ec7fa9" },
  { label: "Cajitas", monto: "$320.000", pct: 8, color: "#ffb8e0" },
  { label: "Bolsillos", monto: "$400.000", pct: 11, color: "#f9a8cd" },
  { label: "Cuotas deudas", monto: "$530.000", pct: 14, color: "#d96d97" },
];

export default function AmyMockup() {
  return (
    <div
      className="relative w-full max-w-md mx-auto lg:mx-0"
      role="img"
      aria-label="Vista previa del panel de Amy: resumen del mes con el dinero libre disponible y una recomendación personalizada."
    >
      {/* Tarjeta principal del panel */}
      <div className="relative rounded-3xl bg-white border border-[#ffb8e0] shadow-[0_18px_50px_-12px_rgba(236,127,169,0.35)] overflow-hidden">
        {/* Barra superior */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#ffedfa] bg-white/90">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffb8e0]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffedfa]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffedfa]" />
          <span className="ml-2 text-xs font-medium text-[#1a1a2e]/40">Mis finanzas · Marzo</span>
        </div>

        {/* pb generoso: reserva el espacio que ocupa la burbuja de Amy, que
            flota encima. Sin esto tapaba las ultimas filas del desglose. */}
        <div className="p-5 pb-36 sm:pb-32">
          {/* Dinero libre — el número protagonista */}
          <div className="rounded-2xl bg-[#ffedfa] border border-[#ffb8e0] p-5 mb-5">
            <p className="text-xs font-medium text-[#1a1a2e]/50 mb-1">Tu dinero libre este mes</p>
            <p
              className="text-4xl font-bold text-[#1a1a2e] leading-none mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              $1.100.000
            </p>
            <p className="text-xs text-[#1a1a2e]/50">
              de <span className="font-semibold text-[#1a1a2e]/70">$3.800.000</span> que te entraron
            </p>
          </div>

          {/* Desglose */}
          <div className="space-y-3">
            {RESUMEN.map((r) => (
              <div key={r.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm text-[#1a1a2e]/70">{r.label}</span>
                  <span className="text-sm font-semibold text-[#1a1a2e]">{r.monto}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#ffedfa] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Burbuja de recomendación de Amy — la superposición da profundidad */}
      <div className="absolute bottom-3 left-3 right-3 sm:-left-6 sm:right-6 rounded-2xl bg-white border border-[#ffb8e0] shadow-[0_12px_32px_-8px_rgba(236,127,169,0.4)] p-4 animate-float">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ec7fa9] text-white grid place-items-center text-sm font-bold">
            A
          </span>
          <div>
            <p className="text-xs font-semibold text-[#ec7fa9] mb-0.5">Amy dice</p>
            <p className="text-sm text-[#1a1a2e]/80 leading-snug">
              Este mes te sobra más que el pasado. Si guardas $300.000 en tu cajita, llegas completa a
              diciembre 💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
