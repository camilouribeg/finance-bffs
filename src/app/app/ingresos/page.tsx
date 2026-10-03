"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFmt } from "@/lib/useFmt";
import IngresosCard, { type LineItem } from "@/components/dashboard/IngresosCard";

function mesActual() {
  const now = new Date();
  return { mes: now.getMonth() + 1, anio: now.getFullYear() };
}

export default function IngresosPage() {
  const fmt = useFmt();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresosOtros, setIngresosOtros] = useState<LineItem[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { mes, anio } = mesActual();
    const { data } = await supabase.from("dashboard_mensual")
      .select("ingreso_fijo,ingresos_otros").eq("user_id", user.id).eq("month", mes).eq("year", anio).single();
    if (data) {
      setIngresoFijo(data.ingreso_fijo ? String(data.ingreso_fijo) : "");
      setIngresosOtros((data.ingresos_otros ?? []).map((i: Record<string, unknown>) => ({
        id: (i.id as string) ?? crypto.randomUUID(),
        descripcion: ((i.descripcion ?? i.nombre ?? "") as string),
        valor: i.valor as number,
      })));
    }
    setLoading(false);
  }

  // Mismo mecanismo que "Mis finanzas": un upsert parcial de dashboard_mensual que solo
  // toca las columnas de ingresos, sin pisar gastos_fijos_items de ese mismo mes (4.10).
  async function saveData() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { mes, anio } = mesActual();
      await supabase.from("dashboard_mensual").upsert({
        user_id: user.id, month: mes, year: anio,
        ingreso_fijo: parseFloat(ingresoFijo) || 0,
        ingresos_otros: ingresosOtros,
      }, { onConflict: "user_id,month,year" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
          Ingresos
        </h1>
        <p className="text-[#1a1a2e]/50 text-sm mt-1">Todo lo que entra cada mes</p>
      </div>

      {loading ? (
        <div className="h-56 bg-white rounded-2xl border border-[#ffb8e0] animate-pulse" />
      ) : (
        <IngresosCard
          ingresoFijo={ingresoFijo}
          setIngresoFijo={setIngresoFijo}
          ingresosOtros={ingresosOtros}
          setIngresosOtros={setIngresosOtros}
          editing={editing}
          onToggleEdit={() => { if (editing) saveData(); setEditing(!editing); }}
          saving={saving}
          fmt={fmt}
        />
      )}
    </div>
  );
}
