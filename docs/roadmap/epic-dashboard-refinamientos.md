# Epic — Refinamientos de Dashboard (post-feedback de la socia)

**Stories:** 4.10–4.20 · 11 historias, prioridad Alta salvo 4.15 y 4.16 (Media) · Estado **Pendiente**
**Rama:** `feat/epic-dashboard-refinamientos`, creada desde `origin/feat/epic-dashboard-mis-deudas`
(commit `94c68aa`, el HEAD actual del PR #1 — **no** desde `main`, porque casi todas estas historias
construyen directamente sobre 4.1–4.9, que todavía no está mergeado).
**Worktree:** este mismo directorio, aparte del checkout principal (que sigue en
`feat/epic-onboarding-happy-path`) y del worktree hermano `epic-dashboard-deudas` (que tiene el PR #1
abierto, en revisión activa por la socia). Trabajar aquí no debería pisar ninguno de los dos.
**Origen:** Excel `Experience Roadmap 15 septiembre 2026.xlsx` (`~/Downloads`), ya copiado a
`docs/roadmap/Finance-BFF-Experience-Roadmap.xlsx` de este worktree y `roadmap.md` regenerado
(44 stories en total). Contiene las 8 stories previas del epic Dashboard + Mis deudas (4.1–4.9, todas
Completo salvo 4.8 que volvió a Pendiente — ver más abajo) más estas 11 nuevas, coloreadas de rosado
en el Excel original: feedback de una sesión de prueba real de la socia el 15 de septiembre.

## Contexto importante antes de empezar

**El PR #1 (4.1–4.9) sigue abierto y activo.** No lo vas a tocar tú — otra sesión lo está llevando.
Si necesitas algo de ahí que todavía no esté pusheado, pregúntale al usuario en vez de asumir.

**Hoy mismo (18 de sept) se arregló y pusheó a esa rama** un bug real que encontró la socia
("nada se actualiza cuando marco o desmarco un check, en Mis gastos, cajitas, bolsitas"): en
`gastos/page.tsx`, el checkbox de "pagado" de un gasto fijo era un botón chiquito y separado del
resto de la fila (que era *otro* botón, para editar) — en móvil, sin el tooltip de `title` que solo
se ve al pasar el mouse, tocar el nombre del gasto no marcaba nada. Cajitas y Mis deudas nunca
tuvieron este problema (ahí toda la fila es un solo botón). Es relevante para varias de estas
historias porque el patrón correcto —**toda la fila es un solo target, sin botones anidados ni
superpuestos**— es el que hay que replicar en cualquier check/acción nueva que agregues (4.13, 4.14,
4.20 en particular).

**4.6 (cuota vs. abono a capital) se probó en vivo hoy y funciona correctamente** cuando la deuda
tiene una tasa cargada (se probó con una tasa real: el saldo bajó exacto lo estimado por la fórmula
de amortización). El problema que reportó la socia fue con una deuda *sin* tasa (`davivienda`), donde
la app intencionalmente no toca el saldo y lo explica en texto — eso no es un bug, es la razón por la
que 4.8 volvió a Pendiente con un enfoque distinto (ver abajo). No hace falta que reabras 4.6.

**4.11 (campo Nombre no permite escribir al agregar gasto fijo) no se pudo reproducir hoy** en el
Preview actual — se probó escribir en el campo y funcionó sin problema. Puede haber sido un glitch
puntual de esa sesión de prueba (se vio un `TypeError: Failed to fetch` intermitente en la consola,
probablemente de refresco de sesión de Supabase, no del input en sí). Antes de asumir que sigue roto,
vale la pena volver a probarlo con pasos exactos; si no reproduce, considera si el criterio de éxito
ya está cumplido.

**4.8 cambió de enfoque.** La versión anterior (`66e96d6`, ya en el PR #1) agregó una *estimación*
automática del abono a capital usando la tasa de interés (ver `abonoACapitalEstimado()` en
`deudas/page.tsx`). El Excel nuevo renombró la story a "**Pedir** el saldo real de la deuda..." en vez
de "Actualizar" — sugiere que lo que realmente se quiere es *preguntarle activamente a la usuaria*
cuánto debe según su banco después de cada pago (sobre todo cuando no hay tasa, que es cuando la
estimación no puede ayudar), no solo estimarlo en silencio. Esta story sigue siendo del otro
epic/branch (4.1-4.9) — mencionada aquí solo como contexto, no la implementes tú a menos que te lo
pidan explícitamente.

## Las 11 stories, agrupadas por tema

### A. Copy y jerarquía — bajo riesgo, sin tocar lógica (4.12, 4.15, 4.16, 4.19, 4.20)

| ID | Qué cambia |
|---|---|
| 4.12 | Reescribir el texto bancario de Cajitas: crear el bolsillo/sobre es **una sola vez**, el aporte es mensual. Hoy dice "Cada mes, crea un bolsillo..." — confuso. |
| 4.15 | Mover "¿Qué son las cajitas?" al inicio de `cajitas/page.tsx` (hoy está al final). |
| 4.16 | Unificar el orden de secciones entre `cajitas/page.tsx` y `ahorro/page.tsx`: qué es → cómo funciona → qué hacer en el banco → gestión. Usa 4.15 como referencia del orden correcto para Cajitas y replícalo en Bolsitas. |
| 4.19 | Bloque "Tu método" en `deudas/page.tsx` con explicación + autor/fuente. **Ojo:** `debtMethods.ts` (`METHOD_META`) ya tiene nombre + enfoque de cada método (`snowball`, `avalanche`, `balanced`) — extiéndelo ahí, no dupliques. La story pide explícitamente cuidado con la atribución ("evitar presentar como autor único a quien no lo sea") — verifica antes de publicar quién originó cada método (snowball se asocia comúnmente a Dave Ramsey; avalanche es un concepto financiero más genérico, sin un autor único claro) en vez de asumir. |
| 4.20 | Cambiar el texto del check de deuda pendiente ("Pendiente este mes") por una instrucción literal tipo "Haz clic aquí cuando pagues la cuota de este mes en tu banco". Es el mismo botón que ya es un solo target unificado (`toggleConfirmado`, línea ~546 de `deudas/page.tsx`) — solo cambia el copy, no la estructura. |

### B. Menú y CRUD — 4.10

Agregar "Ingresos" al sidebar (`src/components/dashboard/AppSidebar.tsx` — mismo componente de
siempre) con su propia ruta (`/app/ingresos`, a crear). Hoy los ingresos solo se editan inline en
`app/page.tsx`. Ojo con la advertencia explícita del Excel: "evitar duplicar comportamientos
diferentes entre editar ingresos desde Mis finanzas y desde la nueva sección" — probablemente lo más
seguro es que la vista nueva reuse el mismo componente/lógica de edición que ya existe en
`app/page.tsx`, no reescribirla.

### C. Checks de configuración inicial (una sola vez, no mensual) — 4.13, 4.14

Estas dos piden un mecanismo **distinto** al de `confirmaciones_mensuales` (que es mensual y se
resetea cada mes por diseño — ver el epic 4.1-4.9). Acá se necesita un flag que **no se repite nunca**
mientras la cajita/bolsita exista: "ya creé el bolsillo/sobre real en mi banco para esto". No hay hoy
ninguna columna para esto. Opciones, a decidir antes de escribir código:

- Columna nueva en `cajitas`/`bolsillos` (ej. `configurada_en_banco boolean default false`, quizás
  con un segundo campo para el medio: banco/efectivo). Simple, una migración chica.
- Reusar `confirmaciones_mensuales` con `mes`/`anio` fijos en algún valor sentinel — más frágil y
  confuso, no lo recomendaría.

La primera opción es la más directa. Mantenla **separada** del check mensual existente (4.1/4.2) —
son dos preguntas distintas ("¿ya existe el espacio?" vs. "¿ya transferiste este mes?"), y no deben
compartir el mismo botón ni estado.

### D. Validación de capacidad disponible — 4.17, 4.18

Ambas piden lo mismo para tipos distintos: antes de guardar una bolsita/cajita nueva (o editar una
existente), calcular cuánto le quedaría disponible a la usuaria y bloquear si el nuevo compromiso
mensual lo supera. **Crítico:** la story pide explícitamente usar "la misma fuente de cálculo que el
dashboard" — la fórmula central vive en `app/page.tsx` (`disponible` / `capacidadNeta`, ver también
`CLAUDE.md`: `Ingresos − Gastos Fijos − Cajitas − Bolsitas − Cuotas Deudas`). No reimplementes esta
cuenta de cero en `cajitas/page.tsx` o `ahorro/page.tsx` — factoriza la función si hace falta, o
impórtala, para que dashboard y validación nunca puedan divergir (ese fue justo el bug que resolvió
4.3 del otro epic — no lo repitas).

## Orden sugerido

1. **4.12, 4.15, 4.16, 4.20** primero — copy y reordenamiento, cero riesgo, construyen intuición sobre
   las páginas antes de tocarles lógica.
2. **4.11** — investigar/reproducir antes de "arreglar" nada; puede que ya esté bien.
3. **4.13, 4.14** — requieren la decisión de esquema (columna nueva). Ciérrala con el usuario si hay
   dudas, como se hizo con `confirmaciones_mensuales` en el epic anterior.
4. **4.17, 4.18** — dependen de entender bien la fórmula central; hacerlas después de 4.13/4.14 para
   no mezclar dos migraciones en un solo ida-y-vuelta.
5. **4.10** — independiente del resto, se puede hacer en cualquier momento.
6. **4.19** — al final; requiere verificar datos (atribución de metodologías) antes de escribir copy.

## Workflow (igual que el resto de este proyecto)

Una story a la vez: implementar → probar en un navegador real contra staging (Playwright headless,
ver `.claude/skills/browser-test/`) → `npm run lint` + `npm run build` → commit referenciando el
roadmap (`roadmap 4.X`) → siguiente. Al terminar cada tanda, marcar `Completo` en
`docs/roadmap/Finance-BFF-Experience-Roadmap.xlsx` y regenerar `roadmap.md` con `sync.py`. Cuenta de
staging para pruebas: pedirle una al usuario, o crear una nueva con datos de prueba (no reutilices la
cuenta compartida `equipo@financebffs.test` sin avisar — ya se pisó una vez por pruebas concurrentes).
