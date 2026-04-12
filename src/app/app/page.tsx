"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year] = useState(currentYear);

  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresoVariable, setIngresoVariable] = useState("");
  const [otrosIngresos, setOtrosIngresos] = useState("");
  const [gastosFijos, setGastosFijos] = useState("");
  const [gastosVariables, setGastosVariables] = useState("");
  const [ahorro, setAhorro] = useState("");
  const [deudas, setDeudas] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMonth = useCallback(async (m: number, y: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("dashboard_mensual")
      .select("*").eq("user_id", user.id).eq("month", m).eq("year", y).single();
    if (data) {
      setIngresoFijo(data.ingreso_fijo ? String(data.ingreso_fijo) : "");
      setIngresoVariable(data.ingreso_variable ? String(data.ingreso_variable) : "");
      setOtrosIngresos(data.otros_ingresos ? String(data.otros_ingresos) : "");
      setGastosFijos(data.gastos_fijos ? String(data.gastos_fijos) : "");
      setGastosVariables(data.gastos_variables ? String(data.gastos_variables) : "");
      setDeudas(data.deudas_cuotas ? String(data.deudas_cuotas) : "");
      setAhorro(data.ahorro ? String(data.ahorro) : "");
    } else {
      setIngresoFijo(""); setIngresoVariable(""); setOtrosIngresos("");
      setGastosFijos(""); setGastosVariables(""); setDeudas(""); setAhorro("");
    }
  }, []);

  useEffect(() => { loadMonth(month, year); }, [month, year, loadMonth]);

  async function saveData() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("dashboard_mensual").upsert({
      user_id: user.id,
      month,
      year,
      ingreso_fijo: parseFloat(ingresoFijo) || 0,
      ingreso_variable: parseFloat(ingresoVariable) || 0,
      otros_ingresos: parseFloat(otrosIngresos) || 0,
      gastos_fijos: parseFloat(gastosFijos) || 0,
      gastos_variables: parseFloat(gastosVariables) || 0,
      deudas_cuotas: parseFloat(deudas) || 0,
      ahorro: parseFloat(ahorro) || 0,
    }, { onConflict: "user_id,month,year" });
    setSaving(false);
  }

  const totalIngresos =
    (parseFloat(ingresoFijo) || 0) +
    (parseFloat(ingresoVariable) || 0) +
    (parseFloat(otrosIngresos) || 0);

  const totalGastos =
    (parseFloat(gastosFijos) || 0) + (parseFloat(gastosVariables) || 0);

  const totalDeudas = parseFloat(deudas) || 0;
  const totalAhorro = parseFloat(ahorro) || 0;
  const disponible = totalIngresos - totalGastos - totalAhorro - totalDeudas;

  const pctGastos = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
  const pctAhorro = totalIngresos > 0 ? (totalAhorro / totalIngresos) * 100 : 0;
  const pctDisponible = totalIngresos > 0 ? (disponible / totalIngresos) * 100 : 0;

  function fmt(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "var(--font-playfair)" }}>
            Mi dashboard 📋
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">Organiza tu dinero, toma el control</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-[#ffb8e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ec7fa9]/30">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
          </select>
          <button onClick={saveData} disabled={saving}
            className="bg-[#ec7fa9] hover:bg-[#d96d97] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total ingresos" value={fmt(totalIngresos)} color="green" icon="💰" />
        <SummaryCard label="Total gastos" value={fmt(totalGastos)} color="red" icon="💸" />
        <SummaryCard label="Ahorro del mes" value={fmt(totalAhorro)} color="pink" icon="🐷" />
        <SummaryCard label="Dinero disponible" value={fmt(disponible)} color={disponible >= 0 ? "blue" : "red"} icon="✨" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">💰 Ingresos del mes</h2>
          <div className="flex flex-col gap-3">
            <InputRow label="Ingreso fijo (salario)" value={ingresoFijo} onChange={setIngresoFijo} />
            <InputRow label="Ingresos variables" value={ingresoVariable} onChange={setIngresoVariable} />
            <InputRow label="Otros ingresos" value={otrosIngresos} onChange={setOtrosIngresos} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#ffb8e0] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1a1a2e]/70">Total</span>
            <span className="text-lg font-bold text-green-600">{fmt(totalIngresos)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">💸 Gastos del mes</h2>
          <div className="flex flex-col gap-3">
            <InputRow label="Gastos fijos" value={gastosFijos} onChange={setGastosFijos} />
            <InputRow label="Gastos variables" value={gastosVariables} onChange={setGastosVariables} />
            <InputRow label="Cuotas / deudas" value={deudas} onChange={setDeudas} />
            <InputRow label="Ahorro" value={ahorro} onChange={setAhorro} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#ffb8e0] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1a1a2e]/70">Total gastos</span>
            <span className="text-lg font-bold text-red-500">{fmt(totalGastos)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ffb8e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-1 flex items-center gap-2">📐 Método 60/30/10</h2>
          <p className="text-xs text-[#1a1a2e]/50 mb-4">Así va la distribución de tu dinero</p>
          <div className="flex flex-col gap-4">
            <ProgressBar label="Gastos necesarios" pct={pctGastos} target={60} value={fmt(totalGastos)} color="#ec7fa9" />
            <ProgressBar label="Ahorro" pct={pctAhorro} target={10} value={fmt(totalAhorro)} color="#22c55e" />
            <ProgressBar label="Libre / estilo de vida" pct={Math.max(0, pctDisponible)} target={30} value={fmt(Math.max(0, disponible))} color="#3b82f6" />
          </div>
        </div>

        <div className={`rounded-2xl border p-6 flex flex-col justify-center items-center text-center ${
          disponible >= 0 ? "bg-[#f0fdf4] border-green-200" : "bg-[#ffedfa] border-[#ffb8e0]"
        }`}>
          <p className="text-4xl mb-3">{disponible >= 0 ? "✨" : "😰"}</p>
          <p className="text-lg font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            {disponible >= 0 ? "Dinero disponible" : "Estás en déficit"}
          </p>
          <p className={`text-3xl font-bold ${disponible >= 0 ? "text-green-600" : "text-[#ec7fa9]"}`}>
            {fmt(disponible)}
          </p>
          <p className="text-xs text-[#1a1a2e]/50 mt-2">
            {disponible >= 0 ? "¡Vas muy bien! Úsalo con intención 💕" : "Revisa tus gastos fijos y variables"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  const colors: Record<string, string> = {
    green: "text-green-600", red: "text-red-500", pink: "text-[#ec7fa9]", blue: "text-blue-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#ffb8e0] p-4">
      <p className="text-xl mb-2">{icon}</p>
      <p className="text-xs text-[#1a1a2e]/50 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function InputRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-[#1a1a2e]/70 flex-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0"
        className="w-32 border border-[#ffb8e0] rounded-xl px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[#ec7fa9]/30 focus:border-[#ec7fa9] bg-[#ffedfa]" />
    </div>
  );
}

function ProgressBar({ label, pct, target, value, color }: { label: string; pct: number; target: number; value: string; color: string }) {
  const capped = Math.min(pct, 100);
  const overTarget = pct > target;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#1a1a2e]/70">{label}</span>
        <span className={`text-xs font-semibold ${overTarget ? "text-[#ec7fa9]" : "text-[#1a1a2e]/60"}`}>
          {pct.toFixed(0)}% <span className="text-[#1a1a2e]/30">(meta: {target}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[#ffb8e0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${capped}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-[#1a1a2e]/50 mt-1 text-right">{value}</p>
    </div>
  );
}
