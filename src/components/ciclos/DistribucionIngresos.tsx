"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import type { Evento } from "@/lib/ciclos";
import { cuotaMensualCajita, cuotaMensualBolsillo } from "@/lib/capacidad";
import { distribuirIngresos, type Compromisos } from "@/lib/distribucion";

// Como repartir cada ingreso cuando llegue (roadmap 5.11). Trae por su cuenta los
// compromisos mensuales (deudas, cajitas, bolsitas) para no depender de la pagina.
export default function DistribucionIngresos({ eventos }: { eventos: Evento[] }) {
  const fmt = useFmt();
  const [compromisos, setCompromisos] = useState<Compromisos | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [d, c, b] = await Promise.all([
        supabase.from("deudas").select("cuota_mensual").eq("user_id", user.id),
        supabase.from("cajitas").select("monto_total, actual, fecha_pago").eq("user_id", user.id),
        supabase.from("bolsillos").select("tipo, meta, actual, fecha_meta, cuota_mensual").eq("user_id", user.id),
      ]);
      setCompromisos({
        cuotasDeudas: (d.data ?? []).reduce((s, x) => s + (x.cuota_mensual || 0), 0),
        ahorroPlanificado:
          (c.data ?? []).reduce((s, x) => s + cuotaMensualCajita(x), 0) +
          (b.data ?? []).reduce((s, x) => s + cuotaMensualBolsillo(x), 0),
      });
    })();
  }, []);

  if (!compromisos) return null;
  const distribuciones = distribuirIngresos(eventos, compromisos);
  if (distribuciones.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-5">
      <p className="font-semibold text-[#1a1a2e] mb-1">Cómo repartir cada pago</p>
      <p className="text-xs text-[#1a1a2e]/60 mb-3">Cuando llegue cada ingreso, Amy te sugiere qué separar y qué queda para ti.</p>
      <div className="space-y-3">
        {distribuciones.map((x, i) => {
          const filas: { texto: string; valor: number }[] = [
            { texto: "para los pagos hasta tu siguiente ingreso", valor: x.obligaciones },
            { texto: "para reservar y llegar bien al siguiente periodo", valor: x.reserva },
            { texto: "para las cuotas de tus deudas", valor: x.cuotasDeudas },
            { texto: "para tus cajitas y bolsitas", valor: x.ahorro },
          ].filter(f => f.valor > 0);
          return (
            <div key={i} className="bg-[#ffedfa] rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-[#1a1a2e]">
                {x.nombre} · {x.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" })} · {fmt(x.monto)}
              </p>
              <ul className="mt-2 space-y-1">
                {filas.map(f => (
                  <li key={f.texto} className="text-sm text-[#1a1a2e]/80">
                    Separa <span className="font-semibold">{fmt(f.valor)}</span> {f.texto}
                  </li>
                ))}
                <li className="text-sm text-green-700 font-semibold">Te quedan {fmt(x.libre)} para usar con tranquilidad</li>
              </ul>
              {x.faltante > 0 && (
                <p className="text-xs text-[#1a1a2e]/60 mt-2">
                  Con este pago no alcanza a cubrir todo lo de ese periodo: faltarían {fmt(x.faltante)}. Lo mejor es prepararlo con anticipación.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
