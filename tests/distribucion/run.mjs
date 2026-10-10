// Pruebas de la distribucion por ingreso (roadmap 5.11).
// Compilar y correr: npx tsc src/lib/ciclos.ts src/lib/distribucion.ts --outDir <salida> --module commonjs --target es2020 --skipLibCheck && node tests/distribucion/run.mjs <salida>
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { distribuirIngresos } = require(path.join(process.argv[2], "distribucion.js"));
let ok = 0, fail = 0;
const check = (n, c, x = "") => { if (c) ok++; else fail++; console.log(c ? "PASS" : "FAIL", n, x); };
const d = (m, dia) => new Date(2026, m - 1, dia);
const ing = (m, dia, monto) => ({ fecha: d(m, dia), nombre: "Sueldo", monto, tipo: "ingreso" });
const obl = (m, dia, monto) => ({ fecha: d(m, dia), nombre: "Arriendo", monto, tipo: "obligacion" });

const ev = [ing(11, 15, 400), obl(11, 20, 100), ing(11, 30, 600), obl(12, 5, 300), ing(12, 15, 400), ing(12, 30, 600)];
const r = distribuirIngresos(ev, { cuotasDeudas: 100, ahorroPlanificado: 200 });
check("devuelve un reparto por ingreso con ingreso posterior", r.length === 3, String(r.length));
for (const x of r) {
  const suma = x.obligaciones + x.reserva + x.cuotasDeudas + x.ahorro + x.libre;
  check("la suma de destinos es el ingreso", Math.abs(suma - x.monto) < 1e-9, `${suma}/${x.monto}`);
  check("nada negativo", [x.obligaciones, x.reserva, x.cuotasDeudas, x.ahorro, x.libre].every(v => v >= 0));
}
check("obligaciones del primer periodo", r[0].obligaciones === 100, String(r[0].obligaciones));
const corto = distribuirIngresos([ing(11, 1, 100), obl(11, 5, 250), ing(11, 20, 500), ing(12, 1, 500)], { cuotasDeudas: 0, ahorroPlanificado: 0 });
check("faltante cuando las obligaciones superan el ingreso", corto[0].faltante === 150 && corto[0].libre === 0, JSON.stringify(corto[0]));
check("sin ingresos no hay reparto", distribuirIngresos([], { cuotasDeudas: 0, ahorroPlanificado: 0 }).length === 0);
console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
