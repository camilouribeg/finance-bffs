"use client";

import { useState } from "react";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year] = useState(currentYear);

  // Income state
  const [ingresoFijo, setIngresoFijo] = useState("");
  const [ingresoVariable, setIngresoVariable] = useState("");
  const [otrosIngresos, setOtrosIngresos] = useState("");

  // Expense categories (60/30/10 reference)
  const [gastosFijos, setGastosFijos] = useState("");
  const [gastosVariables, setGastosVariables] = useState("");
  const [ahorro, setAhorro] = useState("");
  const [deudas, setDeudas] = useState("");

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
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Mi dashboard 📋
          </h1>
          <p className="text-[#1a1a2e]/50 text-sm mt-1">
            Organiza tu dinero, toma el control
          </p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-[#ffd6e0] rounded-xl px-4 py-2 text-sm bg-white text-[#1a1a2e] outline-none focus:ring-2 focus:ring-[#ff2d78]/30"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m} {year}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total ingresos" value={fmt(totalIngresos)} color="green" icon="💰" />
        <SummaryCard label="Total gastos" value={fmt(totalGastos)} color="red" icon="💸" />
        <SummaryCard label="Ahorro del mes" value={fmt(totalAhorro)} color="pink" icon="🐷" />
        <SummaryCard
          label="Dinero disponible"
          value={fmt(disponible)}
          color={disponible >= 0 ? "blue" : "red"}
          icon="✨"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos */}
        <div className="bg-white rounded-2xl border border-[#ffd6e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
            💰 Ingresos del mes
          </h2>
          <div className="flex flex-col gap-3">
            <InputRow label="Ingreso fijo (salario)" value={ingresoFijo} onChange={setIngresoFijo} />
            <InputRow label="Ingresos variables" value={ingresoVariable} onChange={setIngresoVariable} />
            <InputRow label="Otros ingresos" value={otrosIngresos} onChange={setOtrosIngresos} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#ffd6e0] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1a1a2e]/70">Total</span>
            <span className="text-lg font-bold text-green-600">{fmt(totalIngresos)}</span>
          </div>
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-2xl border border-[#ffd6e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
            💸 Gastos del mes
          </h2>
          <div className="flex flex-col gap-3">
            <InputRow label="Gastos fijos" value={gastosFijos} onChange={setGastosFijos} />
            <InputRow label="Gastos variables" value={gastosVariables} onChange={setGastosVariables} />
            <InputRow label="Cuotas / deudas" value={deudas} onChange={setDeudas} />
            <InputRow label="Ahorro" value={ahorro} onChange={setAhorro} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#ffd6e0] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1a1a2e]/70">Total gastos</span>
            <span className="text-lg font-bold text-red-500">{fmt(totalGastos)}</span>
          </div>
        </div>

        {/* Método 60/30/10 */}
        <div className="bg-white rounded-2xl border border-[#ffd6e0] p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-1 flex items-center gap-2">
            📐 Método 60/30/10
          </h2>
          <p className="text-xs text-[#1a1a2e]/50 mb-4">Así va la distribución de tu dinero</p>

          <div className="flex flex-col gap-4">
            <ProgressBar
              label="Gastos necesarios"
              pct={pctGastos}
              target={60}
              value={fmt(totalGastos)}
              color="#ff2d78"
            />
            <ProgressBar
              label="Ahorro"
              pct={pctAhorro}
              target={10}
              value={fmt(totalAhorro)}
              color="#22c55e"
            />
            <ProgressBar
              label="Libre / estilo de vida"
              pct={Math.max(0, pctDisponible)}
              target={30}
              value={fmt(Math.max(0, disponible))}
              color="#3b82f6"
            />
          </div>
        </div>

        {/* Dinero disponible */}
        <div className={`rounded-2xl border p-6 flex flex-col justify-center items-center text-center ${
          disponible >= 0
            ? "bg-[#f0fdf4] border-green-200"
            : "bg-[#fff0f3] border-[#ffd6e0]"
        }`}>
          <p className="text-4xl mb-3">{disponible >= 0 ? "✨" : "😰"}</p>
          <p
            className="text-lg font-bold text-[#1a1a2e] mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {disponible >= 0 ? "Dinero disponible" : "Estás en déficit"}
          </p>
          <p className={`text-3xl font-bold ${disponible >= 0 ? "text-green-600" : "text-[#ff2d78]"}`}>
            {fmt(disponible)}
          </p>
          <p className="text-xs text-[#1a1a2e]/50 mt-2">
            {disponible >= 0
              ? "¡Vas muy bien! Úsalo con intención 💕"
              : "Revisa tus gastos fijos y variables"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, color, icon,
}: {
  label: string; value: string; color: string; icon: string;
}) {
  const colors: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-500",
    pink: "text-[#ff2d78]",
    blue: "text-blue-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#ffd6e0] p-4">
      <p className="text-xl mb-2">{icon}</p>
      <p className="text-xs text-[#1a1a2e]/50 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function InputRow({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-[#1a1a2e]/70 flex-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-32 border border-[#ffd6e0] rounded-xl px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-[#ff2d78]/30 focus:border-[#ff2d78] bg-[#fff8f9]"
      />
    </div>
  );
}

function ProgressBar({
  label, pct, target, value, color,
}: {
  label: string; pct: number; target: number; value: string; color: string;
}) {
  const capped = Math.min(pct, 100);
  const overTarget = pct > target;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#1a1a2e]/70">{label}</span>
        <span className={`text-xs font-semibold ${overTarget ? "text-[#ff2d78]" : "text-[#1a1a2e]/60"}`}>
          {pct.toFixed(0)}% <span className="text-[#1a1a2e]/30">(meta: {target}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[#ffd6e0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${capped}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-[#1a1a2e]/50 mt-1 text-right">{value}</p>
    </div>
  );
}
