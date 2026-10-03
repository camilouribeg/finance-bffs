"use client";

import { useState } from "react";
import { Archive, CreditCard, LayoutDashboard, PiggyBank, ShoppingCart, X } from "lucide-react";

// Guia ligera del menu lateral en la primera visita (roadmap 3.9). No bloquea el dashboard,
// se puede omitir y no vuelve una vez cerrada. Flag en localStorage, por usuaria.
const MODULOS = [
  { icon: LayoutDashboard, nombre: "Mis finanzas", frase: "tu panel del mes" },
  { icon: ShoppingCart, nombre: "Mis gastos", frase: "lo que gastas día a día" },
  { icon: Archive, nombre: "Cajitas", frase: "para gastos grandes que no son todos los meses" },
  { icon: PiggyBank, nombre: "Bolsitas de ahorro", frase: "tus metas y fondos" },
  { icon: CreditCard, nombre: "Deudas", frase: "tu plan para salir de deudas" },
];

export const claveGuia = (userId: string) => `amy_guia_menu_vista_${userId}`;

// Se monta solo cuando ya hay userId (el dashboard lo obtiene de forma asincrona), asi que
// leer localStorage en el inicializador no causa diferencias de hidratacion.
export default function GuiaMenu({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(claveGuia(userId)) !== "1"; } catch { return true; }
  });

  function cerrar() {
    setVisible(false);
    try { localStorage.setItem(claveGuia(userId), "1"); } catch { /* sin localStorage: reaparece, no bloquea */ }
  }

  if (!visible) return null;

  return (
    <div className="bg-[#ffedfa] border border-[#ffb8e0] rounded-2xl px-5 py-4 mb-6" role="region" aria-label="Guía del menú">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">Así te mueves por Amy</p>
          <p className="text-xs text-[#1a1a2e]/60 mt-0.5">Todo lo que necesitas está en el menú de la izquierda.</p>
        </div>
        <button onClick={cerrar} aria-label="Omitir guía" className="text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        {MODULOS.map(({ icon: Icon, nombre, frase }) => (
          <li key={nombre} className="flex items-start gap-2.5 text-sm text-[#1a1a2e]/70">
            <Icon size={15} className="text-[#ec7fa9] mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <span><span className="font-semibold text-[#1a1a2e]">{nombre}</span>: {frase}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <button onClick={cerrar}
          className="bg-[#ec7fa9] hover:bg-[#d96d97] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
          Entendido
        </button>
        <button onClick={cerrar} className="text-xs text-[#1a1a2e]/50 hover:text-[#ec7fa9]">Omitir</button>
      </div>
    </div>
  );
}
