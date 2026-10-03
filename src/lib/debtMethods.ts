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
  {
    emoji: string;
    nombre: string;
    enfoque: string;
    unaPrioridad: boolean;
    /** Como funciona el metodo, en general (roadmap 4.19). */
    descripcion: string;
    /**
     * Autor/fuente, verificado antes de publicar (roadmap 4.19) — evitar presentar
     * como autor único a quien no lo sea. Bola de nieve: Dave Ramsey la popularizó,
     * no la inventó. Avalancha: concepto financiero genérico, sin autor único claro.
     * Equilibrada: no es un método externo, es el diseño propio de Amy.
     */
    atribucion: string;
  }
> = {
  snowball: {
    emoji: "❄️",
    nombre: "Bola de nieve",
    enfoque: "es la más pequeña, así que es la que más rápido vas a liquidar",
    unaPrioridad: true,
    descripcion: "Pagas primero la deuda más pequeña, sin importar su tasa de interés. Al liquidarla, sumas esa cuota a la siguiente deuda más pequeña — como una bola de nieve que crece.",
    atribucion: "Popularizado por el educador financiero Dave Ramsey — no lo inventó, pero lo hizo conocido. Prioriza la motivación de ver deudas desaparecer rápido por encima del ahorro en intereses.",
  },
  avalanche: {
    emoji: "🏔️",
    nombre: "Avalancha",
    enfoque: "es la que más intereses te está cobrando, así que es la que más dinero te ahorra",
    unaPrioridad: true,
    descripcion: "Pagas primero la deuda con la tasa de interés más alta, sin importar el monto. Es la forma matemáticamente más eficiente de pagar menos intereses en total.",
    atribucion: "Es un principio financiero de uso general, sin un autor único identificable — simplemente la estrategia que minimiza el interés total pagado.",
  },
  balanced: {
    emoji: "⚖️",
    nombre: "Equilibrada",
    enfoque: "",
    // En este método no hay una sola deuda prioritaria: todas avanzan juntas.
    unaPrioridad: false,
    descripcion: "Avanzas en todas tus deudas al mismo tiempo, sin priorizar ninguna sobre las demás. Ideal si prefieres ver progreso parejo en vez de enfocarte en una sola.",
    atribucion: "Es el enfoque propio de Amy: un punto medio para quien no quiere elegir entre la motivación de la bola de nieve y el ahorro en intereses de la avalancha.",
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
