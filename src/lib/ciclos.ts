// Motor de ciclos de ingreso (epic Flujo de caja, roadmap 5.2, 5.4-5.7).
// Funciones puras: sin Supabase ni React, para poder revisarlas y reusarlas.
//
// Modelo: se proyectan los pagos y obligaciones en orden cronologico desde hoy,
// partiendo del saldo en cuenta. Si el saldo proyectado cae por debajo de cero antes
// del siguiente ingreso, ese hueco es el faltante que hay que cubrir con una reserva.

export type Frecuencia = "semanal" | "quincenal" | "cada_dos_semanas" | "mensual" | "variable";

export type FuenteIngreso = {
  nombre: string;
  frecuencia: Frecuencia;
  // Dia del mes del primer/unico pago (quincenal, mensual). Semanal/cada_dos_semanas/
  // variable usan fecha_inicio en su lugar y dejan esto en null.
  dia_1: number | null;
  // Monto del primer (o unico) pago (5.2): cada fecha de pago tiene su propio valor,
  // nunca se asume que un pago quincenal reparte el total mensual en partes iguales.
  monto_1: number;
  // Quincenal: dia del segundo pago.
  dia_2: number | null;
  // Quincenal: monto del segundo pago. Si no se especifico, se usa monto_1 como
  // fallback razonable (ej. datos viejos antes de 5.2), pero nunca se inventa un reparto.
  monto_2: number | null;
  // Semanal / cada_dos_semanas: primer dia de pago (yyyy-mm-dd); desde ahi cada 7 o 14 dias.
  fecha_inicio?: string | null;
};

export type Obligacion = { nombre: string; monto: number; dia_pago: number };

export type Evento = { fecha: Date; nombre: string; monto: number; tipo: "ingreso" | "obligacion" };

const HORIZONTE_DIAS = 62;

// Dia del mes clampeado al ultimo dia del mes (ej: 31 en febrero -> 28).
function fechaDelMes(anio: number, mes: number, dia: number): Date {
  const ultimo = new Date(anio, mes + 1, 0).getDate();
  return new Date(anio, mes, Math.min(dia, ultimo));
}

function mismoOPosterior(a: Date, b: Date): boolean {
  return a.getTime() >= b.getTime();
}

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

// Eventos (pagos y obligaciones) entre `desde` y `desde + HORIZONTE_DIAS`, ordenados.
// Cada evento de ingreso conserva el monto propio de esa fecha de pago (5.2, 5.11).
export function proyectarEventos(
  desde: Date,
  fuentes: FuenteIngreso[],
  obligaciones: Obligacion[],
): Evento[] {
  const hasta = new Date(desde.getTime() + HORIZONTE_DIAS * 86400000);
  const eventos: Evento[] = [];
  const inicioDia = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());

  // Meses que tocan la ventana (puede ser 2 o 3).
  const meses: { anio: number; mes: number }[] = [];
  for (let d = new Date(inicioDia.getFullYear(), inicioDia.getMonth(), 1); d <= hasta; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    meses.push({ anio: d.getFullYear(), mes: d.getMonth() });
  }

  for (const f of fuentes) {
    // Cada 7 o 14 dias desde una fecha de inicio: no depende del calendario mensual.
    const pasoDias = f.frecuencia === "semanal" ? 7 : f.frecuencia === "cada_dos_semanas" ? 14 : null;
    if (pasoDias != null && f.fecha_inicio) {
      const [y, m, d] = f.fecha_inicio.split("-").map(Number);
      let fecha = new Date(y, m - 1, d);
      // Avanza hasta el primer pago dentro de la ventana y luego cada `pasoDias` dias.
      while (fecha < inicioDia) fecha = sumarDias(fecha, pasoDias);
      for (; fecha <= hasta; fecha = sumarDias(fecha, pasoDias)) {
        eventos.push({ fecha, nombre: f.nombre, monto: f.monto_1, tipo: "ingreso" });
      }
    }
  }

  for (const { anio, mes } of meses) {
    for (const f of fuentes) {
      if (f.frecuencia === "semanal" || f.frecuencia === "cada_dos_semanas" || f.dia_1 == null) continue;
      const pagos = f.frecuencia === "quincenal" && f.dia_2 != null
        ? [{ dia: f.dia_1, monto: f.monto_1 }, { dia: f.dia_2, monto: f.monto_2 ?? f.monto_1 }]
        : [{ dia: f.dia_1, monto: f.monto_1 }];
      for (const { dia, monto } of pagos) {
        const fecha = fechaDelMes(anio, mes, dia);
        if (mismoOPosterior(fecha, inicioDia) && fecha <= hasta) {
          eventos.push({ fecha, nombre: f.nombre, monto, tipo: "ingreso" });
        }
      }
    }
    for (const o of obligaciones) {
      const fecha = fechaDelMes(anio, mes, o.dia_pago);
      if (mismoOPosterior(fecha, inicioDia) && fecha <= hasta) {
        eventos.push({ fecha, nombre: o.nombre, monto: o.monto, tipo: "obligacion" });
      }
    }
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

export type PlanHastaIngreso = {
  proximoIngreso: { fecha: Date; monto: number } | null;
  obligacionesAntes: Evento[];
  totalObligacionesAntes: number;
  saldoAlProximoIngreso: number;
  // Cuanto le falta al saldo para no quedar en negativo antes del proximo ingreso.
  // Es el monto que hay que apartar como reserva (5.4 / 5.5). 0 si no hay hueco.
  faltante: number;
};

// Plan hasta el proximo ingreso (5.7). `saldo` es el saldo en cuenta (5.8).
export function planHastaProximoIngreso(
  hoy: Date,
  saldo: number,
  fuentes: FuenteIngreso[],
  obligaciones: Obligacion[],
): PlanHastaIngreso {
  const eventos = proyectarEventos(hoy, fuentes, obligaciones);
  const idxIngreso = eventos.findIndex(e => e.tipo === "ingreso");
  const antes = idxIngreso === -1 ? eventos : eventos.slice(0, idxIngreso);
  const obligacionesAntes = antes.filter(e => e.tipo === "obligacion");
  const totalObligacionesAntes = obligacionesAntes.reduce((s, e) => s + e.monto, 0);
  const saldoAlProximoIngreso = saldo - totalObligacionesAntes;
  const faltante = Math.max(0, -saldoAlProximoIngreso);

  const proximo = idxIngreso === -1 ? null : eventos[idxIngreso];
  return {
    proximoIngreso: proximo ? { fecha: proximo.fecha, monto: proximo.monto } : null,
    obligacionesAntes,
    totalObligacionesAntes,
    saldoAlProximoIngreso,
    faltante,
  };
}

export type PeriodoAjustado = {
  // El periodo que queda corto: desde que empieza (hoy, o el ingreso que lo abre)
  // hasta la fecha del ingreso que lo cierra (cuando llega el alivio).
  inicio: Date;
  fin: Date;
  // Cuanto hay que tener preparado para no quedar en negativo durante el periodo.
  faltante: number;
  // El ingreso mas holgado anterior, desde el cual se puede reservar (5.5). Si es null,
  // es el primer ciclo (5.6): el hueco ocurre antes de que exista un ingreso previo
  // visible del cual preparar nada -- no hay una reserva real que contabilizar todavia.
  origenReserva: { fecha: Date; monto: number } | null;
};

// Recorre todo el horizonte (no solo el proximo ingreso) y detecta cada periodo entre
// ingresos donde el saldo proyectado caeria en negativo, aunque el total del horizonte
// cierre en positivo (5.4). Para cada uno, identifica desde que ingreso anterior se
// puede preparar la reserva (5.5), o si es el primer ciclo sin ingreso previo (5.6).
export function analizarPeriodos(
  hoy: Date,
  saldoInicial: number,
  fuentes: FuenteIngreso[],
  obligaciones: Obligacion[],
): PeriodoAjustado[] {
  const eventos = proyectarEventos(hoy, fuentes, obligaciones);
  const ajustados: PeriodoAjustado[] = [];

  let saldo = saldoInicial;
  let minEnPeriodo = saldo;
  let inicioPeriodo = hoy;
  let ultimoIngreso: { fecha: Date; monto: number } | null = null;

  for (const ev of eventos) {
    if (ev.tipo === "obligacion") {
      saldo -= ev.monto;
      minEnPeriodo = Math.min(minEnPeriodo, saldo);
      continue;
    }
    // Un ingreso cierra el periodo que veniamos acumulando.
    if (minEnPeriodo < 0) {
      ajustados.push({
        inicio: inicioPeriodo,
        fin: ev.fecha,
        faltante: Math.ceil(-minEnPeriodo),
        origenReserva: ultimoIngreso,
      });
    }
    saldo += ev.monto;
    ultimoIngreso = { fecha: ev.fecha, monto: ev.monto };
    inicioPeriodo = ev.fecha;
    minEnPeriodo = saldo;
  }

  return ajustados;
}
