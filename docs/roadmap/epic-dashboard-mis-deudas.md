# Epic — Dashboard (confirmaciones) + Mis deudas (plan de acción)

**Stories:** 4.1–4.9 · Todas prioridad **Alta** · Estado **Pendiente**
**Rama:** `feat/epic-dashboard-mis-deudas` (ya creada, branch desde `main` en `93dd5c9`)
**Worktree:** este mismo directorio — es un `git worktree` aparte del checkout principal del repo,
para poder trabajar esto en paralelo sin pisar la sesión que sigue en `feat/epic-onboarding-happy-path`.
**Origen:** Excel actualizado por el socio el 2026-09-09 (`Finance BFF Experience Roadmap septiembre 8.xlsx`,
en `~/Downloads`) — **todavía no está copiado a `docs/roadmap/` de este repo**, cópialo tú mismo como
primer paso (ver Fase 0 abajo). No confundir con `docs/roadmap/roadmap.md` de este worktree, que
todavía no refleja ni las historias 4.x ni que 3.1–3.5 ya están completas (eso vive en la rama
`feat/epic-onboarding-happy-path`, que a propósito no se mergeó aquí — ver "Por qué desde `main`").

## Objetivo del epic

Dos áreas relacionadas pero distintas, ambas post-onboarding (dentro de `/app`):

1. **Dashboard (4.1–4.4):** hoy "marcar como hecho" en cajitas es un check **global mensual** (todas
   las cajitas a la vez, guardado solo en `localStorage`). Bolsitas y gastos fijos **no tienen ningún
   mecanismo de confirmación**. Y el "dinero disponible" del dashboard principal es puramente
   presupuestal — nunca refleja qué se confirmó de verdad.
2. **Mis deudas (4.5–4.9):** el módulo ya sabe la metodología elegida (`profiles.debt_method`) y ordena
   las deudas, pero se queda ahí — no le dice a la usuaria qué hacer *este mes*, no distingue cuota vs.
   abono a capital, y no hay noción de progreso ni de "siguiente hito".

| ID | Story | Tipo de cambio |
|---|---|---|
| 4.1 | Confirmar transferencias de cada cajita por separado | Cambiar el check global → por cajita |
| 4.2 | Guiar y confirmar los abonos de cada bolsita | Construir desde cero (hoy no existe) |
| 4.3 | Actualizar el saldo disponible al confirmar movimientos | Lógica de cálculo — cuidado con doble descuento |
| 4.4 | Registrar el pago de gastos fijos y reflejarlo en el saldo | Construir desde cero (hoy no existe) |
| 4.5 | Convertir la metodología de deuda en un plan de acción mensual | Nuevo bloque en Mis deudas |
| 4.6 | Diferenciar cuota normal y abono adicional a capital | Cambia el flujo de "Registrar pago" |
| 4.7 | Confirmar individualmente los pagos realizados en el banco | Construir desde cero |
| 4.8 | Actualizar el saldo real de la deuda después de registrar pagos | Lógica + input manual de saldo real |
| 4.9 | Mostrar progreso y siguiente objetivo de salida de deudas | Nuevo bloque de progreso |

## ⚠️ Decisión de arquitectura a cerrar ANTES de escribir código

Hoy **no existe ningún dato persistente de "esto ya se confirmó este mes"**:

- `src/app/app/cajitas/page.tsx` (línea ~32-54, ~129-132): un solo flag en `localStorage`,
  clave `cajitas_transferido_${año}_${mes}`, para **todas** las cajitas juntas. No por cajita, no en
  Supabase, no sobrevive cambiar de dispositivo.
- `src/app/app/ahorro/page.tsx`: cero. Ni localStorage ni columna.
- `src/app/app/gastos/page.tsx` (gastos fijos): cero.
- `src/app/app/deudas/page.tsx`: tiene `registrarAbono()` que sí escribe en Supabase (abona a
  `actual`/`total_pendiente`), pero eso es *registrar el pago en sí*, no un check de "ya confirmé esto
  este mes" independiente.

4.1, 4.2, 4.4 y 4.7 piden exactamente ese mecanismo — por **ítem individual** (cada cajita, cada
bolsita, cada gasto fijo, cada deuda) y **por mes**. Hay que decidir dónde vive:

- **Opción A — columnas nuevas en las tablas existentes** (`cajitas.confirmado_mes`,
  `bolsillos.confirmado_mes`, etc., o mejor un campo tipo `ultima_confirmacion` con fecha): simple,
  pero "por mes" con una sola columna implica resetearla cada mes (job o lógica al cambiar de mes).
- **Opción B — tabla nueva** `confirmaciones_mensuales` (user_id, tipo, item_id, mes, año,
  confirmado_at): más limpio para el historial mensual que varias historias piden explícitamente
  ("conservar el historial por mes" en 4.1, 4.2, 4.7), pero es una migración nueva + RLS.
- **Opción C — seguir con localStorage pero por ítem** (`confirm_<tipo>_<id>_<año>_<mes>`): consistente
  con el precedente de cajitas y con la decisión de 3.1 (localStorage primero, Supabase si hace falta
  después), pero **aquí el propio Excel pide explícitamente "conservar el historial por mes"** en varias
  historias — eso es más frágil en localStorage (no sobrevive limpiar el navegador, no se puede auditar).

Mi lectura: dado que 4.9 quiere "progreso" e "historial de saldos" y 4.7/4.1/4.2 piden conservar
histórico mensual de confirmaciones, esto pesa más hacia la **Opción B (tabla nueva)** que la 3.1
original — pero es una conversación para tener con el humano al empezar la sesión, no una decisión
para tomar sola.

## Por qué esta rama nace de `main` y no de `feat/epic-onboarding-happy-path`

Los archivos que toca este epic (`app/page.tsx`, `app/cajitas/page.tsx`, `app/ahorro/page.tsx`,
`app/gastos/page.tsx`, `app/deudas/page.tsx`) **no se solapan** con lo que tocó el epic de onboarding
(`onboarding/page.tsx`, `src/lib/monedas.ts`, `src/lib/useFmt.ts`, `.claude/skills/browser-test/`,
`src/app/demo/`). Cero riesgo de conflicto real trabajando los dos en paralelo. Cuando ambas ramas
mergeen a `main`, el orden no importa para el código — sí para `docs/roadmap/roadmap.md` (regenerar
con `sync.py` después de que las dos estén mergeadas, para que el Excel y el espejo coincidan).

## Contexto de código ya explorado

- **Cálculo de "dinero disponible"** (`src/app/app/page.tsx` ~línea 167):
  `disponible = totalIngresos - totalGastosFijos - totalCajitasMensual - totalBolsitasMensual - totalCuotas`
  — 100% presupuestal, no lee ningún estado de confirmación. Esto es lo que 4.3 pide corregir sin
  duplicar descuentos: si `totalCajitasMensual` ya restó la reserva mensual del disponible, marcar una
  cajita como "transferida" NO debe restar otra vez.
- **`src/lib/debtMethods.ts`**: fuente única de verdad para metodología de deudas, usado tanto en
  onboarding como en `deudas/page.tsx`. `METHOD_META[metodo]` ya trae `enfoque` (texto) y
  `unaPrioridad` (bool — `false` solo en "balanced", donde no hay una deuda prioritaria única). Buena
  base para 4.5 y 4.9 ("cuál es la deuda prioritaria").
  `ordenarDeudas()` ya ordena según el método.
- **`registrarAbono()`** en `deudas/page.tsx` (~línea 81): ya permite abonar "la cuota" o "otro monto".
  4.6 pide que ese flujo pregunte explícitamente *cuota habitual* vs *abono a capital* antes de aplicar
  el monto — hoy no distingue.
- **Patrón de mes-actual** ya usado en cajitas: `mesKey()` arma `AAAA_M` con `new Date()`. Reusable como
  referencia para lo que se decida en la sección de arquitectura arriba.

## Plan de ejecución sugerido

Orden propuesto — Mis deudas primero porque tiene menos ambigüedad de arquitectura (ya hay una tabla
`deudas` real donde anclar todo), Dashboard después reusando lo que se decida ahí:

1. **Cerrar la decisión de arquitectura** (arriba) con el humano.
2. **4.6** — diferenciar cuota vs. abono a capital en `registrarAbono()`. Cambio acotado, sienta las
   bases de 4.8.
3. **4.8** — saldo real de la deuda: no restar automático el valor completo de una cuota normal al
   capital salvo que haya info suficiente; permitir que la usuaria actualice el saldo real a mano.
4. **4.7** — check individual mensual por deuda ("pago de este mes registrado"), usando el mecanismo de
   confirmación decidido arriba.
5. **4.5** — bloque "Tu plan de este mes": lista obligaciones + destaca la prioritaria (via
   `METHOD_META`) + qué hacer con dinero extra.
6. **4.9** — progreso (saldo inicial → actual) + siguiente hito + celebración al llegar a $0 (mismo
   espíritu que la 3.5 de bolsitas: estado positivo, no alarma).
7. **4.1** — cajitas: de check global a por-cajita, usando el mecanismo de confirmación.
8. **4.2** — bolsitas: construir el check por bolsita desde cero (mismo mecanismo).
9. **4.4** — gastos fijos: check de "pagado" por gasto, mismo mecanismo.
10. **4.3** — revisar y corregir la fórmula de disponible para que confirmar no duplique descuentos,
    ahora que 4.1/4.2/4.4 existen.

## Cómo probar

Este repo ya tiene un skill de pruebas con navegador real (Playwright headless) en
`.claude/skills/browser-test/` — úsalo. Dos formas de entrar sin fricción a `/app` con datos:

- `/demo` (login anónimo, staging) → completar un onboarding mínimo para tener cajitas/bolsitas/deudas
  con las que probar confirmaciones.
- Cuenta compartida de staging `equipo@financebffs.test` / `FinanceBFFs2026!` en `/login` (puede que
  ya tenga datos cargados de sesiones anteriores — revisar antes de asumir estado limpio).

`npm run dev` en este worktree ya lee el `.env.local` del repo (apunta a staging) si existe en la raíz
del checkout principal — **verificar que `.env.local` esté presente en este worktree** (puede que git
worktree no lo traiga si está en `.gitignore`, que es justamente el caso). Si falta, copiarlo desde el
checkout principal (`/Users/user/Documents/GitHub/finance-bffs/.env.local`) antes de correr `npm run dev`.

## Checklist de la sesión

- [ ] Copiar `Finance BFF Experience Roadmap septiembre 8.xlsx` de `~/Downloads` a `docs/roadmap/`
      de este worktree (reemplazando el viejo) y correr `python3 docs/roadmap/sync.py`
- [ ] Copiar `.env.local` del checkout principal a este worktree si `npm run dev` no encuentra las
      variables de entorno
- [ ] Leer las 9 historias completas en el Excel/roadmap.md (Estado Actual, Lineamientos, Criterio de
      Éxito de cada una — este doc resume pero no reemplaza el detalle completo)
- [ ] Cerrar con el humano la decisión de arquitectura de confirmaciones (arriba)
- [ ] Escribir/confirmar el plan definitivo antes de tocar código
- [ ] Un commit por historia, mensaje `feat: <qué> (roadmap 4.x)`
- [ ] Probar con el skill `browser-test` contra staging antes de dar cada historia por cerrada
- [ ] `npm run lint` y `npm run build` en verde (13 errores de lint preexistentes en el repo, no
      introducir nuevos)
- [ ] Marcar 4.1–4.9 como `Completo` en el Excel + `sync.py`
- [ ] Push de `feat/epic-dashboard-mis-deudas` (puede necesitar permiso — ver nota abajo)
- [ ] PR contra `main`

## Nota sobre permisos

`git push` puede estar bloqueado por el clasificador de auto-mode de Claude Code la primera vez —
es una barrera de seguridad, no un error. Si pasa, pídele al humano que lo corra él mismo en su
terminal, o que agregue `Bash(git push:*)` a su `~/.claude/settings.json` (ya está agregada en esta
máquina desde la sesión del epic de onboarding, así que probablemente ya funcione).
