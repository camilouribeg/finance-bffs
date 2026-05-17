"use client";

import { useState, useEffect } from "react";

type Pais = { nombre: string; emoji: string; divisa: string; locale: string };

const DEFAULT: Pais = { nombre: "Colombia", emoji: "🇨🇴", divisa: "COP", locale: "es-CO" };

export function useFmt() {
  const [pais, setPais] = useState<Pais>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("amy_pais");
      if (stored) setPais(JSON.parse(stored) as Pais);
    } catch {
      // ignore
    }
  }, []);

  return function fmt(n: number): string {
    return new Intl.NumberFormat(pais.locale, {
      style: "currency",
      currency: pais.divisa,
      maximumFractionDigits: 0,
    }).format(n);
  };
}
