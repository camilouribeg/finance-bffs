// "Que hacer ahora" en Mis finanzas (roadmap 3.6). Funcion pura: recibe lo que el dashboard
// ya cargo y devuelve los pasos priorizados. No calcula dinero; los montos llegan ya
// resueltos desde transferencia.ts / capacidad.ts.

import type { ResumenTransferencia } from "./transferencia";

export type Paso = {
  id: "cajitas" | "bolsitas" | "crear-bolsitas" | "gastos";
  titulo: string;
  detalle: string;
  href: string;
  cta: string;
  hecho: boolean;
  // Monto a separar en el banco, cuando aplica. El componente lo formatea con useFmt.
  monto?: number;
};

export type EntradaPasos = {
  cajitas: ResumenTransferencia;
  bolsitas: ResumenTransferencia;
  hayBolsitas: boolean;
  disponible: number;
  semanaAlDia: boolean;
};

export const MAX_PASOS_VISIBLES = 3;

export function proximosPasos(e: EntradaPasos): { pendientes: Paso[]; hechos: Paso[] } {
  const pasos: Paso[] = [];

  if (e.cajitas.hay) {
    pasos.push({
      id: "cajitas",
      titulo: e.cajitas.completa ? "Separaste el dinero de tus cajitas" : "Separa el dinero de tus cajitas en el banco",
      detalle: e.cajitas.completa
        ? "Listo por este mes."
        : "Amy ya lo reservó en tu presupuesto; falta que lo muevas tú en tu banco.",
      href: "/app/cajitas",
      cta: "Ver cuánto separar",
      hecho: e.cajitas.completa,
      monto: e.cajitas.total,
    });
  }

  if (e.bolsitas.hay) {
    pasos.push({
      id: "bolsitas",
      titulo: e.bolsitas.completa ? "Separaste el dinero de tus bolsitas" : "Separa el dinero de tus bolsitas en el banco",
      detalle: e.bolsitas.completa
        ? "Listo por este mes."
        : "Es tu ahorro del mes: muévelo a su bolsita en tu banco.",
      href: "/app/ahorro",
      cta: "Ver cuánto separar",
      hecho: e.bolsitas.completa,
      monto: e.bolsitas.total,
    });
  } else if (e.disponible > 0) {
    pasos.push({
      id: "crear-bolsitas",
      titulo: "Crea tus bolsitas de ahorro",
      detalle: "Te queda dinero libre. Ponle un propósito para que no se diluya.",
      href: "/app/ahorro",
      cta: "Crear una bolsita",
      hecho: false,
    });
  }

  pasos.push({
    id: "gastos",
    titulo: e.semanaAlDia ? "Tus gastos de esta semana están al día" : "Cuéntale a Amy en qué gastaste esta semana",
    detalle: e.semanaAlDia
      ? "Gracias por mantenerlo al día."
      : "Son un par de minutos, y con voz es todavía más fácil.",
    href: "/app/gastos",
    cta: "Registrar mis gastos",
    hecho: e.semanaAlDia,
  });

  return {
    pendientes: pasos.filter(p => !p.hecho).slice(0, MAX_PASOS_VISIBLES),
    hechos: pasos.filter(p => p.hecho),
  };
}
