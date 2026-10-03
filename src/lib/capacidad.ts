// Formula central: Dinero libre = Ingresos - Gastos Fijos - Cajitas - Bolsitas - Cuotas Deudas
// (ver CLAUDE.md). Vive aca para que el dashboard (app/page.tsx) y las validaciones de
// capacidad al crear cajitas/bolsitas (roadmap 4.17/4.18) nunca puedan divergir.

export type LineItemLike = { valor: number };
export type DeudaLike = { cuota_mensual: number };
export type CajitaLike = { monto_total: number; actual: number; fecha_pago: string };
export type BolsilloLike = {
  tipo?: string;
  meta: number;
  actual: number;
  fecha_meta?: string | null;
  cuota_mensual?: number;
};

export function monthsUntilDate(fechaStr: string): number {
  const now = new Date();
  const fecha = new Date(fechaStr + "T12:00:00");
  const diff = (fecha.getFullYear() - now.getFullYear()) * 12 + (fecha.getMonth() - now.getMonth());
  return Math.max(1, diff);
}

export function cuotaMensualCajita(c: CajitaLike): number {
  const falta = Math.max(0, c.monto_total - c.actual);
  return Math.ceil(falta / monthsUntilDate(c.fecha_pago));
}

export function cuotaMensualBolsillo(b: BolsilloLike): number {
  if (b.tipo === "metas" && b.fecha_meta && b.meta > 0) {
    return Math.ceil(Math.max(0, b.meta - b.actual) / monthsUntilDate(b.fecha_meta));
  }
  return b.cuota_mensual || 0;
}

export function calcularDisponible(params: {
  ingresoFijo: number;
  ingresosOtros: LineItemLike[];
  gastosFijosItems: LineItemLike[];
  deudas: DeudaLike[];
  cajitas: CajitaLike[];
  bolsillos: BolsilloLike[];
  // Reservas del periodo activo (epic Flujo de caja, 5.5/5.8): dinero que ya no es libre.
  reservas?: ReservaLike[];
}): number {
  const totalIngresos = params.ingresoFijo + params.ingresosOtros.reduce((s, i) => s + i.valor, 0);
  const totalGastosFijos = params.gastosFijosItems.reduce((s, i) => s + i.valor, 0);
  const totalCuotas = params.deudas.reduce((s, d) => s + d.cuota_mensual, 0);
  const totalCajitasMensual = params.cajitas.reduce((s, c) => s + cuotaMensualCajita(c), 0);
  const totalBolsitasMensual = params.bolsillos.reduce((s, b) => s + cuotaMensualBolsillo(b), 0);
  const totalReservas = totalReservasActivas(params.reservas ?? []);
  return totalIngresos - totalGastosFijos - totalCajitasMensual - totalBolsitasMensual - totalCuotas - totalReservas;
}

export type ReservaLike = { monto: number; periodo_fin: string };

// Suma las reservas cuyo periodo todavia no termina. Las vencidas ya no comprometen dinero.
export function totalReservasActivas(reservas: ReservaLike[], hoy: Date = new Date()): number {
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  return reservas.reduce((s, r) => (r.periodo_fin >= hoyStr ? s + r.monto : s), 0);
}
