// Pruebas del motor de ciclos y reservas (epic Flujo de caja).
// Sin test runner en el repo: compilar y correr con:
//   npx tsc src/lib/ciclos.ts src/lib/capacidad.ts --outDir <salida> --module commonjs --target es2020 --skipLibCheck && node tests/ciclos/run.mjs <salida>
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const dir = process.argv[2];
const { planHastaProximoIngreso, proyectarEventos, analizarPeriodos } = require(path.join(dir, "ciclos.js"));
const { totalReservasActivas, calcularDisponible } = require(path.join(dir, "capacidad.js"));
let ok = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) ok++; else fail++; console.log(cond ? "PASS" : "FAIL", name, extra); };
const fmtD = (d) => d.toDateString();

// 1. Quincenal con monto distinto por pago (5.2): no se asume reparto 50/50.
let p = planHastaProximoIngreso(new Date(2026, 9, 3), 0,
  [{ nombre: "S", monto_1: 1000000, monto_2: 1500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
check("quincenal: proximo ingreso el 15 oct", p.proximoIngreso && fmtD(p.proximoIngreso.fecha) === fmtD(new Date(2026, 9, 15)));
check("quincenal: el primer pago usa su propio monto (1.000.000, no el promedio)", p.proximoIngreso && p.proximoIngreso.monto === 1000000, `monto=${p.proximoIngreso && p.proximoIngreso.monto}`);

const evQuincenal = proyectarEventos(new Date(2026, 9, 3),
  [{ nombre: "S", monto_1: 1000000, monto_2: 1500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
const montosQuincenal = evQuincenal.filter(e => e.tipo === "ingreso").map(e => e.monto);
check("quincenal: segundo pago usa monto_2 (1.500.000)", montosQuincenal.includes(1500000), `montos=${montosQuincenal}`);

// 2. Quincenal sin monto_2 explicito: usa monto_1 como fallback, no inventa reparto distinto.
const evFallback = proyectarEventos(new Date(2026, 9, 3),
  [{ nombre: "S", monto_1: 1000000, monto_2: null, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
check("quincenal sin monto_2: el segundo pago cae de vuelta a monto_1", evFallback.filter(e => e.tipo === "ingreso").every(e => e.monto === 1000000));

// 3. Faltante con saldo 800k y pago de 1M antes del ingreso.
p = planHastaProximoIngreso(new Date(2026, 9, 3), 800000,
  [{ nombre: "S", monto_1: 2500000, monto_2: 2500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }],
  [{ nombre: "A", monto: 1000000, dia_pago: 5 }]);
check("faltante = 200.000 con saldo 800k y pago 1M antes del ingreso", p.faltante === 200000, `faltante=${p.faltante}`);

// 4. Saldo suficiente -> sin faltante.
p = planHastaProximoIngreso(new Date(2026, 9, 3), 2000000,
  [{ nombre: "S", monto_1: 2500000, monto_2: 2500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }],
  [{ nombre: "A", monto: 1000000, dia_pago: 5 }]);
check("sin faltante con saldo suficiente", p.faltante === 0);

// 5. Semanal desde fecha de inicio: cada 7 dias.
const evSemanal = proyectarEventos(new Date(2026, 9, 3),
  [{ nombre: "Pago semanal", monto_1: 500, monto_2: null, frecuencia: "semanal", dia_1: null, dia_2: null, fecha_inicio: "2026-10-01" }], []);
const semanal = evSemanal.filter(e => e.tipo === "ingreso").map(e => e.fecha.getDate());
check("semanal: primer pago despues de hoy es el 8 oct", semanal[0] === 8, `primeros=${semanal.slice(0, 3)}`);
check("semanal: separados por 7 dias", semanal.length > 1 && semanal[1] - semanal[0] === 7);

// 6. Cada dos semanas (distinto de quincenal): cada 14 dias desde una fecha de inicio.
const evQuince14 = proyectarEventos(new Date(2026, 9, 3),
  [{ nombre: "Pago", monto_1: 900000, monto_2: null, frecuencia: "cada_dos_semanas", dia_1: null, dia_2: null, fecha_inicio: "2026-10-03" }], []);
const dias14 = evQuince14.filter(e => e.tipo === "ingreso").map(e => e.fecha.getDate());
check("cada_dos_semanas: primer pago el mismo dia de inicio si es hoy o despues (3 de oct)", dias14[0] === 3, `primeros=${dias14.slice(0, 3)}`);
check("cada_dos_semanas: separados por 14 dias (no 7, no fechas fijas de mes)", dias14.length > 1 && dias14[1] - dias14[0] === 14, `dias=${dias14}`);

// 7. Febrero: quincenal dia 30 se clampa a 28.
const feb = proyectarEventos(new Date(2027, 0, 20),
  [{ nombre: "S", monto_1: 1, monto_2: 1, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
const febIng = feb.filter(e => e.fecha.getMonth() === 1).map(e => e.fecha.getDate());
check("febrero: dia 30 se ajusta a 28", febIng.includes(28), `feb=${febIng}`);

// 8. Obligacion ya vencida este mes no cuenta (hoy 20, pago dia 5).
p = planHastaProximoIngreso(new Date(2026, 9, 20), 0,
  [{ nombre: "S", monto_1: 1, monto_2: 1, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }],
  [{ nombre: "A", monto: 1000, dia_pago: 5 }]);
check("obligacion del dia 5 no cuenta si hoy es 20", p.obligacionesAntes.every(e => e.fecha >= new Date(2026, 9, 20)));

// 9. Sin fuentes: sin proximo ingreso.
p = planHastaProximoIngreso(new Date(2026, 9, 3), 100, [], []);
check("sin fuentes no hay proximo ingreso", p.proximoIngreso === null);

// 10. Reservas vencidas no comprometen dinero.
const hoy = new Date(2026, 9, 10);
check("reserva activa cuenta", totalReservasActivas([{ monto: 200, periodo_fin: "2026-10-15" }], hoy) === 200);
check("reserva vencida no cuenta", totalReservasActivas([{ monto: 200, periodo_fin: "2026-10-05" }], hoy) === 0);

// 11. calcularDisponible resta reservas activas.
const base = { ingresoFijo: 5000000, ingresosOtros: [], gastosFijosItems: [{ valor: 1000000 }], deudas: [], cajitas: [], bolsillos: [] };
check("disponible descuenta reserva activa", calcularDisponible({ ...base, reservas: [{ monto: 200000, periodo_fin: "2099-01-01" }] }) === 3800000);
check("disponible sin reservas no cambia", calcularDisponible(base) === 4000000);

// 12. analizarPeriodos (5.4/5.5): un periodo ajustado mas adelante en el horizonte
// (no el proximo ingreso), con origen en el ingreso que lo cierra.
const fuentesAP = [{ nombre: "S", monto_1: 1000000, monto_2: 1200000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }];
const obligacionesAP = [{ nombre: "Arriendo", monto: 2000000, dia_pago: 16 }];
const ap = analizarPeriodos(new Date(2026, 9, 11), 50000, fuentesAP, obligacionesAP);
check("analizarPeriodos: detecta 2 periodos ajustados en el horizonte (15oct->30oct y 15nov->30nov)", ap.length === 2, `len=${ap.length}`);
check("analizarPeriodos: el primero tiene como origen el ingreso del 15oct", ap[0] && ap[0].origenReserva && fmtD(ap[0].origenReserva.fecha) === fmtD(new Date(2026, 9, 15)));
check("analizarPeriodos: faltante del primer periodo es 950.000", ap[0] && ap[0].faltante === 950000, `faltante=${ap[0] && ap[0].faltante}`);
check("analizarPeriodos: el segundo tiene como origen el ingreso del 15nov", ap[1] && ap[1].origenReserva && fmtD(ap[1].origenReserva.fecha) === fmtD(new Date(2026, 10, 15)));
check("analizarPeriodos: faltante del segundo periodo es 750.000", ap[1] && ap[1].faltante === 750000, `faltante=${ap[1] && ap[1].faltante}`);

// 13. analizarPeriodos (5.6): obligacion ANTES del primer ingreso visible -> el hueco
// no tiene ingreso previo del cual reservar (primer ciclo).
const apPrimerCiclo = analizarPeriodos(new Date(2026, 9, 11), 50000,
  fuentesAP, [...obligacionesAP, { nombre: "Servicios", monto: 100000, dia_pago: 12 }]);
check("analizarPeriodos: el primer ciclo (antes del 15oct) no tiene origen", apPrimerCiclo[0] && apPrimerCiclo[0].origenReserva === null, JSON.stringify(apPrimerCiclo[0]));
check("analizarPeriodos: faltante del primer ciclo es el saldo negativo exacto (50.000)", apPrimerCiclo[0] && apPrimerCiclo[0].faltante === 50000, `faltante=${apPrimerCiclo[0] && apPrimerCiclo[0].faltante}`);

// 14. analizarPeriodos: sin ningun hueco, no reporta periodos ajustados.
const apSano = analizarPeriodos(new Date(2026, 9, 11), 5000000, fuentesAP, obligacionesAP);
check("analizarPeriodos: saldo suficiente no genera periodos ajustados", apSano.length === 0, `len=${apSano.length}`);

console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
