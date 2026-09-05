"use client";

import { useSyncExternalStore } from "react";

export type Pais = { nombre: string; emoji: string; divisa: string; locale: string };

const DEFAULT: Pais = { nombre: "Colombia", emoji: "🇨🇴", divisa: "COP", locale: "es-CO" };

let cache: { raw: string | null; pais: Pais } = { raw: null, pais: DEFAULT };

function readPais(): Pais {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("amy_pais");
  } catch {
    // localStorage no disponible
  }
  if (raw !== cache.raw) {
    try {
      cache = { raw, pais: raw ? (JSON.parse(raw) as Pais) : DEFAULT };
    } catch {
      cache = { raw, pais: DEFAULT };
    }
  }
  return cache.pais;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Lee el país elegido en el onboarding (`amy_pais` en localStorage). */
export function usePais(): Pais {
  return useSyncExternalStore(subscribe, readPais, () => DEFAULT);
}

export function useFmt() {
  const pais = usePais();

  return function fmt(n: number): string {
    return new Intl.NumberFormat(pais.locale, {
      style: "currency",
      currency: pais.divisa,
      maximumFractionDigits: 0,
    }).format(n);
  };
}
