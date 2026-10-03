// Persistencia de "ya separe este dinero en mi banco este mes" (roadmap 3.7).
// Usa la tabla confirmaciones_mensuales (una fila por item y mes). Como el monto de una
// cajita o bolsita es conocido, confirmar acredita `actual` y deshacer lo revierte por el
// mismo monto, que queda guardado en la propia confirmacion.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Confirmadas } from "./transferencia";

export type TipoTransferencia = "cajita" | "bolsillo";

const TABLA: Record<TipoTransferencia, "cajitas" | "bolsillos"> = {
  cajita: "cajitas",
  bolsillo: "bolsillos",
};

export function mesAnio(hoy: Date = new Date()) {
  return { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
}

export async function cargarConfirmadas(
  supabase: SupabaseClient,
  userId: string,
  tipo: TipoTransferencia,
  hoy: Date = new Date(),
): Promise<Confirmadas> {
  const { mes, anio } = mesAnio(hoy);
  const { data, error } = await supabase
    .from("confirmaciones_mensuales")
    .select("id, item_id, monto")
    .eq("user_id", userId).eq("tipo", tipo).eq("mes", mes).eq("anio", anio);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map(c => [c.item_id, { id: c.id, monto: c.monto ?? 0 }]));
}

export type ItemPorConfirmar = {
  id: string;
  actual: number;
  monto: number;
  // Tope de `actual` (monto_total de una cajita). Sin tope, se acredita completo.
  tope?: number;
};

export type ItemConfirmado = { id: string; confirmacionId: string; monto: number; nuevoActual: number };

export async function confirmarItems(
  supabase: SupabaseClient,
  userId: string,
  tipo: TipoTransferencia,
  items: ItemPorConfirmar[],
  hoy: Date = new Date(),
): Promise<ItemConfirmado[]> {
  const { mes, anio } = mesAnio(hoy);
  const resultados = await Promise.all(items.map(async (it) => {
    const acreditado = it.tope != null ? Math.min(it.monto, Math.max(0, it.tope - it.actual)) : it.monto;
    if (acreditado <= 0) return null;
    const nuevoActual = it.actual + acreditado;
    const [conf, upd] = await Promise.all([
      supabase.from("confirmaciones_mensuales")
        .upsert(
          { user_id: userId, tipo, item_id: it.id, mes, anio, monto: acreditado, confirmado_at: new Date().toISOString() },
          { onConflict: "user_id,tipo,item_id,mes,anio" },
        ).select("id").single(),
      supabase.from(TABLA[tipo]).update({ actual: nuevoActual }).eq("id", it.id).eq("user_id", userId),
    ]);
    if (conf.error) throw conf.error;
    if (upd.error) throw upd.error;
    return { id: it.id, confirmacionId: conf.data.id as string, monto: acreditado, nuevoActual };
  }));
  return resultados.filter((r): r is ItemConfirmado => r !== null);
}

export type ItemPorRevertir = { id: string; confirmacionId: string; monto: number; actual: number };

export async function revertirItems(
  supabase: SupabaseClient,
  userId: string,
  tipo: TipoTransferencia,
  items: ItemPorRevertir[],
): Promise<{ id: string; nuevoActual: number }[]> {
  return Promise.all(items.map(async (it) => {
    const nuevoActual = Math.max(0, it.actual - it.monto);
    const [del, upd] = await Promise.all([
      supabase.from("confirmaciones_mensuales").delete().eq("id", it.confirmacionId).eq("user_id", userId),
      supabase.from(TABLA[tipo]).update({ actual: nuevoActual }).eq("id", it.id).eq("user_id", userId),
    ]);
    if (del.error) throw del.error;
    if (upd.error) throw upd.error;
    return { id: it.id, nuevoActual };
  }));
}
