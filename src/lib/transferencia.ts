// Transferencia mensual al banco (roadmap 3.7). Funciones puras, sin Supabase ni React.
// Los montos salen de capacidad.ts (cuotaMensualCajita / cuotaMensualBolsillo); aca solo
// se combinan con lo ya confirmado este mes para que cajitas, bolsitas y el dashboard
// cuenten lo mismo.

export type ItemTransferible = { id: string; nombre: string; emoji: string };

// Lo ya confirmado este mes, por id del item. `monto` es lo que se acredito en su momento.
export type Confirmadas = Record<string, { id: string; monto: number }>;

export type FilaTransferencia = ItemTransferible & { monto: number; confirmada: boolean };

// Un item entra a la transferencia si todavia tiene cuota por separar o si ya se confirmo
// este mes. Los confirmados conservan el monto acreditado: la cuota recalculada baja apenas
// sube `actual`, y mostrarla cambiada haria parecer que la transferencia "se encogio".
export function filasTransferencia<T extends ItemTransferible>(
  items: T[],
  cuota: (item: T) => number,
  confirmadas: Confirmadas,
): FilaTransferencia[] {
  const filas: FilaTransferencia[] = [];
  for (const item of items) {
    const conf = confirmadas[item.id];
    const monto = conf ? conf.monto : cuota(item);
    if (conf || monto > 0) {
      filas.push({ id: item.id, nombre: item.nombre, emoji: item.emoji, monto, confirmada: !!conf });
    }
  }
  return filas;
}

export type ResumenTransferencia = {
  hay: boolean;
  total: number;
  pendiente: number;
  completa: boolean;
};

export function resumenTransferencia(filas: FilaTransferencia[]): ResumenTransferencia {
  return {
    hay: filas.length > 0,
    total: filas.reduce((s, f) => s + f.monto, 0),
    pendiente: filas.reduce((s, f) => (f.confirmada ? s : s + f.monto), 0),
    completa: filas.length > 0 && filas.every(f => f.confirmada),
  };
}
