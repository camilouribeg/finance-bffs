// Ritual semanal de gastos (roadmap 3.8). Semana = lunes a domingo, en hora local.

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function inicioSemana(hoy: Date = new Date()): Date {
  const dia = (hoy.getDay() + 6) % 7; // lunes = 0
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dia);
}

export function inicioSemanaISO(hoy: Date = new Date()): string {
  return iso(inicioSemana(hoy));
}

// "Esta semana no gaste nada": flag local por semana. No va a confirmaciones_mensuales
// porque esa tabla es mensual y solo acepta cajita/bolsillo/deuda.
export function claveSinGastos(hoy: Date = new Date()): string {
  return `amy_sin_gastos_${inicioSemanaISO(hoy)}`;
}

export function leerSinGastos(hoy: Date = new Date()): boolean {
  try { return localStorage.getItem(claveSinGastos(hoy)) === "1"; } catch { return false; }
}

export function guardarSinGastos(valor: boolean, hoy: Date = new Date()) {
  try {
    if (valor) localStorage.setItem(claveSinGastos(hoy), "1");
    else localStorage.removeItem(claveSinGastos(hoy));
  } catch { /* sin localStorage: el flag simplemente no persiste */ }
}

// La semana esta al dia si hay al menos un gasto desde el lunes o si dijo que no gasto nada.
export function semanaAlDia(gastosEstaSemana: number, hoy: Date = new Date()): boolean {
  return gastosEstaSemana > 0 || leerSinGastos(hoy);
}
