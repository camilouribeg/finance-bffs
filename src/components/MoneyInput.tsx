"use client";

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { usePais } from "@/lib/useFmt";

// useLayoutEffect avisa en SSR; en el cliente sí queremos que corra antes del paint
// para reposicionar el cursor sin parpadeo.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Valor crudo: solo dígitos, o "" cuando está vacío. */
  value: string;
  /** Recibe el valor crudo (solo dígitos). */
  onChange: (raw: string) => void;
  /** Forzar locale/divisa (onboarding, antes de que `amy_pais` exista en localStorage). */
  locale?: string;
  currency?: string;
};

/**
 * Campo de dinero: muestra el signo de la divisa y separadores de miles mientras
 * la usuaria escribe, sin flechas nativas. Guarda el valor como string de dígitos
 * para que el resto del código siga usando `parseFloat` sin cambios.
 */
export default function MoneyInput({ value, onChange, locale, currency, ...rest }: Props) {
  const pais = usePais();

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale ?? pais.locale, {
        style: "currency",
        currency: currency ?? pais.divisa,
        maximumFractionDigits: 0,
        currencyDisplay: "narrowSymbol",
      }),
    [locale, currency, pais.locale, pais.divisa],
  );

  const ref = useRef<HTMLInputElement>(null);
  const caretDigits = useRef<number | null>(null);
  // Fuerza un render aunque el padre no cambie de estado (p. ej. la usuaria teclea
  // una letra): así el <input> controlado vuelve a mostrar el valor formateado.
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  const digits = (value ?? "").replace(/\D/g, "");
  const display = digits ? nf.format(Number(digits)) : "";

  // Tras cada tecla, deja el cursor después de la misma cantidad de dígitos que había antes.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || caretDigits.current == null) return;
    const target = caretDigits.current;
    caretDigits.current = null;

    let pos = 0;
    let seen = 0;
    while (pos < el.value.length && seen < target) {
      if (/\d/.test(el.value[pos])) seen++;
      pos++;
    }
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      // input desmontado o sin soporte
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    caretDigits.current = el.value.slice(0, caret).replace(/\D/g, "").length;
    onChange(el.value.replace(/\D/g, ""));
    forceRender();
  }

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
    />
  );
}
