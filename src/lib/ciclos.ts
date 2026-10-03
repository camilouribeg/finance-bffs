// Motor de ciclos de ingreso (epic Flujo de caja, roadmap 5.4-5.7).
// Funciones puras: sin Supabase ni React, para poder revisarlas y reusarlas.
//
// Modelo: se proyectan los pagos y obligaciones en orden cronologico desde hoy,
// partiendo del saldo en cuenta. Si el saldo proyectado cae por debajo de cero antes
// del siguiente ingreso, ese hueco es el faltante que hay que cubrir con una reserva.

export type Frecuencia = "semanal" | "quincenal" | "mensual" | "variable";

export type FuenteIngreso = {
  nombre: string;
  monto: number;
  frecuencia: Frecuencia;
  dia_1: number | null;
  dia_2: number | null;
  // Semanal: primer dia de pago (yyyy-mm-dd); desde ahi cada 7 dias.
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

// Eventos (pagos y obligaciones) entre `desde` y `desde + HORIZONTE_DIAS`, ordenados.
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
    if (f.frecuencia === "semanal" && f.fecha_inicio) {
      const [y, m, d] = f.fecha_inicio.split("-").map(Number);
      let fecha = new Date(y, m - 1, d);
      // Avanza hasta el primer pago dentro de la ventana y luego cada 7 dias.
      while (fecha < inicioDia) fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7);
      for (; fecha <= hasta; fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7)) {
        eventos.push({ fecha, nombre: f.nombre, monto: f.monto, tipo: "ingreso" });
      }
    }
  }

  for (const { anio, mes } of meses) {
    for (const f of fuentes) {
      if (f.frecuencia === "semanal" || f.dia_1 == null) continue;
      const dias = f.frecuencia === "quincenal" && f.dia_2 != null ? [f.dia_1, f.dia_2] : [f.dia_1];
      for (const dia of dias) {
        const fecha = fechaDelMes(anio, mes, dia);
        if (mismoOPosterior(fecha, inicioDia) && fecha <= hasta) {
          eventos.push({ fecha, nombre: f.nombre, monto: f.monto, tipo: "ingreso" });
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
