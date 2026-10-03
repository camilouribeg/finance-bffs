// Divisas que se pueden elegir en el onboarding y al registrar un ingreso en otra
// moneda distinta a la principal. Nombres cortos y coloquiales (como se dicen
// normalmente), no el nombre oficial largo.
export const MONEDAS = [
  { code: "COP", nombre: "Pesos colombianos" },
  { code: "MXN", nombre: "Pesos mexicanos" },
  { code: "ARS", nombre: "Pesos argentinos" },
  { code: "CLP", nombre: "Pesos chilenos" },
  { code: "PEN", nombre: "Soles" },
  { code: "USD", nombre: "Dólares" },
  { code: "EUR", nombre: "Euros" },
  { code: "GTQ", nombre: "Quetzales" },
  { code: "CRC", nombre: "Colones" },
  { code: "DOP", nombre: "Pesos dominicanos" },
  { code: "BOB", nombre: "Bolivianos" },
  { code: "PYG", nombre: "Guaraníes" },
  { code: "UYU", nombre: "Pesos uruguayos" },
  { code: "HNL", nombre: "Lempiras" },
  { code: "NIO", nombre: "Córdobas" },
] as const;
