// Distribucion de cada ingreso entre sus destinos (roadmap 5.11).
// Funciones puras: parten de los eventos que ya proyecta ciclos.ts, sin segunda captura.
//
// Para cada ingreso futuro se reparte, en este orden de prioridad:
//   1. obligaciones del periodo (pagos fijos hasta el siguiente ingreso)
//   2. reserva para el siguiente periodo (si el siguiente ingreso no alcanza para sus obligaciones)
//   3. cuotas de deudas
//   4. ahorro planificado (cajitas + bolsitas)
//   5. lo que queda: dinero utilizable
// La suma de los destinos nunca supera el monto del ingreso.

import type { Evento } from "./ciclos";

export type Compromisos = {
  // Compromisos mensuales que se reparten entre los ingresos del mes.
  cuotasDeudas: number;
  ahorroPlanificado: number;
};

export type DistribucionIngreso = {
  fecha: Date;
  nombre: string;
  monto: number;
  obligaciones: number;
  reserva: number;
  cuotasDeudas: number;
  ahorro: number;
  libre: number;
  // Lo que las obligaciones del periodo superan al ingreso (0 si alcanza).
  faltante: number;
};

const DIAS_MES = 30;
const MS_DIA = 86400000;

export function distribuirIngresos(
  eventos: Evento[],
  compromisos: Compromisos,
  maxIngresos = 3,
): DistribucionIngreso[] {
  const ingresos = eventos.filter(e => e.tipo === "ingreso");
  if (ingresos.length === 0) return [];

  // Cada ingreso carga con la parte de los compromisos mensuales que le toca,
  // proporcional a lo que aporta de los ingresos de sus proximos 30 dias.
  const inicio = ingresos[0].fecha.getTime();
  const totalMes = ingresos
    .filter(i => i.fecha.getTime() < inicio + DIAS_MES * MS_DIA)
    .reduce((s, i) => s + i.monto, 0);

  const obligacionesEntre = (desde: Date, hasta: Date | null) =>
    eventos
      .filter(e => e.tipo === "obligacion" && e.fecha >= desde && (hasta === null || e.fecha < hasta))
      .reduce((s, e) => s + e.monto, 0);

  const resultado: DistribucionIngreso[] = [];
  for (let i = 0; i < ingresos.length && resultado.length < maxIngresos; i++) {
    const ing = ingresos[i];
    const siguiente = ingresos[i + 1] ?? null;
    // Sin un ingreso posterior no se sabe donde termina el periodo: se omite en vez de inventarlo.
    if (!siguiente) break;
    const despues = ingresos[i + 2] ?? null;

    let resto = ing.monto;
    const tomar = (pedido: number) => {
      const t = Math.max(0, Math.min(pedido, resto));
      resto -= t;
      return t;
    };

    const pedidoObl = obligacionesEntre(ing.fecha, siguiente.fecha);
    const obligaciones = tomar(pedidoObl);
    const faltante = Math.max(0, pedidoObl - obligaciones);

    // Reserva: lo que el siguiente periodo necesita y su propio ingreso no cubre.
    const necesidadSiguiente = obligacionesEntre(siguiente.fecha, despues ? despues.fecha : null);
    const reserva = despues ? tomar(Math.max(0, necesidadSiguiente - siguiente.monto)) : 0;

    const parte = totalMes > 0 ? ing.monto / totalMes : 0;
    const cuotasDeudas = tomar(Math.round(compromisos.cuotasDeudas * parte));
    const ahorro = tomar(Math.round(compromisos.ahorroPlanificado * parte));

    resultado.push({
      fecha: ing.fecha,
      nombre: ing.nombre,
      monto: ing.monto,
      obligaciones,
      reserva,
      cuotasDeudas,
      ahorro,
      libre: resto,
      faltante,
    });
  }
  return resultado;
}
