/**
 * Fuente única de verdad para las metodologías de pago de deudas.
 *
 * El onboarding le pregunta a la usuaria con qué método se identifica y lo
 * guarda en `profiles.debt_method`, prometiéndole que lo verá reflejado en su
 * panel. Esta lógica vive aquí para que el panel y el onboarding no puedan
 * volver a divergir.
 */

export type DebtMethod = "snowball" | "avalanche" | "balanced";

/** Lo mínimo que necesita el ordenamiento; sirve para el tipo del panel y el del onboarding. */
type Ordenable = { total_pendiente: number; tasa?: number | string | null };

const num = (v: number | string | null | undefined) =>
  typeof v === "number" ? v : parseFloat(v ?? "") || 0;

export const METHOD_META: Record<
  DebtMethod,
  { emoji: string; nombre: string; enfoque: string; unaPrioridad: boolean }
> = {
  snowball: {
    emoji: "❄️",
    nombre: "Bola de nieve",
    enfoque: "es la más pequeña, así que es la que más rápido vas a liquidar",
    unaPrioridad: true,
  },
  avalanche: {
    emoji: "🏔️",
    nombre: "Avalancha",
    enfoque: "es la que más intereses te está cobrando, así que es la que más dinero te ahorra",
    unaPrioridad: true,
  },
  balanced: {
    emoji: "⚖️",
    nombre: "Equilibrada",
    enfoque: "",
    // En este método no hay una sola deuda prioritaria: todas avanzan juntas.
    unaPrioridad: false,
  },
};

/** Ordena las deudas según el método. `balanced` conserva el orden recibido. */
export function ordenarDeudas<T extends Ordenable>(deudas: T[], metodo: DebtMethod): T[] {
  const copia = [...deudas];
  if (metodo === "snowball") {
    return copia.sort((a, b) => a.total_pendiente - b.total_pendiente);
  }
  if (metodo === "avalanche") {
    return copia.sort((a, b) => {
      const ta = num(a.tasa);
      const tb = num(b.tasa);
      // A igual tasa, primero la de mayor saldo (más intereses en términos absolutos).
      return tb !== ta ? tb - ta : b.total_pendiente - a.total_pendiente;
    });
  }
  return copia;
}
