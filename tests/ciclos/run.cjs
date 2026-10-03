// Pruebas del motor de ciclos y reservas (epic Flujo de caja).
// Sin test runner en el repo: compilar y correr con:
//   npx tsc src/lib/ciclos.ts src/lib/capacidad.ts --outDir <salida> --module commonjs --target es2020 --skipLibCheck && node tests/ciclos/run.cjs <salida>
const path = require("path");
const dir = process.argv[2];
const { planHastaProximoIngreso, proyectarEventos } = require(path.join(dir, "ciclos.js"));
const { totalReservasActivas, calcularDisponible } = require(path.join(dir, "capacidad.js"));
let ok = 0, fail = 0;
const check = (name, cond, extra = "") => { cond ? ok++ : fail++; console.log(cond ? "PASS" : "FAIL", name, extra); };
const fmtD = (d) => d.toDateString();

let p = planHastaProximoIngreso(new Date(2026, 9, 3), 0, [{ nombre: "S", monto: 100, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
check("quincenal: proximo ingreso el 15 oct", p.proximoIngreso && fmtD(p.proximoIngreso.fecha) === fmtD(new Date(2026, 9, 15)));

p = planHastaProximoIngreso(new Date(2026, 9, 3), 800000, [{ nombre: "S", monto: 2500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], [{ nombre: "A", monto: 1000000, dia_pago: 5 }]);
check("faltante = 200.000 con saldo 800k y pago 1M antes del ingreso", p.faltante === 200000, `faltante=${p.faltante}`);

p = planHastaProximoIngreso(new Date(2026, 9, 3), 2000000, [{ nombre: "S", monto: 2500000, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], [{ nombre: "A", monto: 1000000, dia_pago: 5 }]);
check("sin faltante con saldo suficiente", p.faltante === 0);

const ev = proyectarEventos(new Date(2026, 9, 3), [{ nombre: "Semanal", monto: 500, frecuencia: "semanal", dia_1: null, dia_2: null, fecha_inicio: "2026-10-01" }], []);
const semanal = ev.filter(e => e.tipo === "ingreso").map(e => e.fecha.getDate());
check("semanal: primer pago despues de hoy es el 8 oct", semanal[0] === 8, `primeros=${semanal.slice(0, 3)}`);
check("semanal: separados por 7 dias", semanal.length > 1 && semanal[1] - semanal[0] === 7);

const feb = proyectarEventos(new Date(2027, 0, 20), [{ nombre: "S", monto: 1, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], []);
check("febrero: dia 30 se ajusta a 28", feb.filter(e => e.fecha.getMonth() === 1).map(e => e.fecha.getDate()).includes(28));

p = planHastaProximoIngreso(new Date(2026, 9, 20), 0, [{ nombre: "S", monto: 1, frecuencia: "quincenal", dia_1: 15, dia_2: 30, fecha_inicio: null }], [{ nombre: "A", monto: 1000, dia_pago: 5 }]);
check("obligacion del dia 5 no cuenta si hoy es 20", p.obligacionesAntes.every(e => e.fecha >= new Date(2026, 9, 20)));

p = planHastaProximoIngreso(new Date(2026, 9, 3), 100, [], []);
check("sin fuentes no hay proximo ingreso", p.proximoIngreso === null);

const hoy = new Date(2026, 9, 10);
check("reserva activa cuenta", totalReservasActivas([{ monto: 200, periodo_fin: "2026-10-15" }], hoy) === 200);
check("reserva vencida no cuenta", totalReservasActivas([{ monto: 200, periodo_fin: "2026-10-05" }], hoy) === 0);

const base = { ingresoFijo: 5000000, ingresosOtros: [], gastosFijosItems: [{ valor: 1000000 }], deudas: [], cajitas: [], bolsillos: [] };
check("disponible descuenta reserva activa", calcularDisponible({ ...base, reservas: [{ monto: 200000, periodo_fin: "2099-01-01" }] }) === 3800000);
check("disponible sin reservas no cambia", calcularDisponible(base) === 4000000);

console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
