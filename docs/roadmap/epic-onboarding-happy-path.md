# Epic — Onboarding Happy Path

**Stories:** 3.1, 3.2, 3.3, 3.4, 3.5 · Todas prioridad **Alta** · Estado **Pendiente**
**Rama sugerida:** `feat/epic-onboarding-happy-path`
**Detalle completo de cada story:** ver [`roadmap.md`](./roadmap.md#detalle-por-user-story)

> **Nota:** durante la revisión en navegador de 3.2 (2026-09-05) salieron dos ideas que
> **no estaban en el Excel original** y se construyeron ahí mismo por ser pequeñas y
> vivir en la misma pantalla: (1) ampliar la lista de países a 20 + "Otro", (2) elegir
> la moneda de forma independiente al país, y (3) capturar un ingreso en una moneda
> distinta a la principal (freelance en USD, conversión manual, sin API de tasas de
> cambio). Vale la pena que quede visible para tu socio que esto se agregó fuera del
> proceso normal de planeación.
>
> **Pendiente de pulir (no bloquea, queda para después):** hoy se puede agregar más de
> un "otro ingreso" con monedas distintas (cada toggle "¿Es en otra moneda?" se resetea
> después de cada "+ Agregar", así que funciona uno por uno), pero no hay una forma más
> visual de verlo de un vistazo en la lista — solo el subtítulo chiquito bajo el monto.

## Objetivo del epic

El "Happy Path" es la usuaria **sin deudas y con capacidad de ahorro**. Hoy llega al tramo final
del onboarding y la experiencia falla en tres frentes: (a) no comunica que su progreso se guarda,
(b) los montos de dinero se ven inconsistentes mientras escribe, y (c) Amy le habla en tono de
alarma en un escenario que en realidad es bueno. Este epic deja ese tramo sólido antes de construir
lo que viene después (epics 3.6–3.9 asumen que el onboarding ya quedó bien).

| ID | Story | Tipo de cambio |
|---|---|---|
| 3.1 | Guardar progreso y permitir volver atrás | Estado + persistencia + navegación |
| 3.2 | Formato inteligente para valores de dinero | **Refactor transversal** (33 inputs `type="number"` en 6 archivos) |
| 3.3 | Amy Detective reconoce primero el progreso | Copy + orden de mensajes |
| 3.4 | Explicar claramente el punto de partida del ahorro | Reorganización de pantalla + copy |
| 3.5 | Mostrar dinero restante al crear bolsitas | Jerarquía visual + estado de éxito |

## Contexto de código

- **Todo el onboarding es una sola página, máquina de estados:** [`src/app/onboarding/page.tsx`](../../src/app/onboarding/page.tsx) (~1580 líneas).
  - `type Step` (línea 82): `perfil_inicial → welcome → ingresos → gastos → [amy_detective] → deudas/deuda_intro/deuda_quiz/deuda_resultado → ahorro_intro → cajitas_onboarding → ahorro_puede → ahorro_tipo → bolsitas_crear → guardando`.
  - Estado local con decenas de `useState`; **nada se persiste hasta `finalSave()`** (línea 324), que escribe a Supabase de un solo golpe al final.
  - Bifurcación Happy Path: línea 297 — si `disponiblePostGF >= 0.35 * totalIngresos` NO entra a `amy_detective`, va directo a `ahorro_intro`. Ojo: la story 3.3 habla de "Amy Detective en el Happy Path", hay que confirmar en qué pantalla exacta aparece ese mensaje para la usuaria sin deudas.
  - Pantalla "Este es tu punto de partida" ≈ línea 929; cálculo `restante = capacidadNeta - monto` (línea 960); las 3 opciones de ahorro salen de `AHORRO_OPCIONES` (recomendada / intermedia / flexible, pct 0.10–0.20).
  - Creación de bolsitas ≈ línea 1400+; `bolsitasDisponible` es el saldo por repartir; hoy usa estado naranja/rojo cuando llega a 0 (líneas 1405, 1517).
- **Guard de acceso:** [`src/app/app/layout.tsx`](../../src/app/app/layout.tsx) manda a `/onboarding` si `onboarding_completed = false`. Hoy no hay estado intermedio guardado, así que "retomar" = empezar de cero.
- **Formato de moneda:** [`src/lib/useFmt.ts`](../../src/lib/useFmt.ts) — hook cliente, lee `amy_pais` de `localStorage`, devuelve `fmt(n)`. El onboarding tiene su propio `fmt` local (línea 217) — unificar.
- **Tablas:** `dashboard_mensual` (ingresos/gastos), `deudas`, `cajitas`, `bolsillos`, `profiles.onboarding_completed`. Ver `CLAUDE.md` para columnas.

## Plan de ejecución propuesto

Orden: **3.2 → 3.1 → 3.3 → 3.4 → 3.5**. El formato de dinero (3.2) primero porque toca casi
todos los inputs y es mejor tenerlo estable antes de mover pantallas; el resto en orden del flujo.

### 3.2 · Formato inteligente para valores de dinero
- Crear componente compartido **`src/components/MoneyInput.tsx`**: `text` + `inputMode="numeric"`, formatea `$ 1.234.567` mientras se escribe, mantiene el valor numérico crudo por callback, sin flechas nativas.
- Reemplazar los 33 `type="number"` monetarios en: `onboarding/page.tsx`, `app/page.tsx`, `app/deudas`, `app/cajitas`, `app/ahorro`, `app/gastos`. (Ojo: algunos `type="number"` pueden ser no-monetarios — meses, %, importancia — esos NO se tocan.)
- Reusar `useFmt()` para separadores/locale según país.
- **Criterio de éxito:** todos los campos monetarios muestran `$` + separadores y ninguno tiene spinner nativo.

### 3.1 · Guardar progreso y permitir volver atrás
- Persistencia incremental: al confirmar cada paso, `upsert` parcial a las tablas (o una fila `onboarding_draft` / columnas de borrador en `profiles` — **decisión de arquitectura a cerrar**). Opción más simple y sin migración: `localStorage` + rehidratación; opción robusta: Supabase.
- Al re-entrar a `/onboarding`: saltar al último `Step` pendiente con los datos ya cargados.
- Añadir acción **Atrás** consistente en todo paso que tenga pantalla anterior, preservando estado.
- Microcopy silencioso: "Guardado" discreto, sin lenguaje técnico. Avisar una vez al inicio: "Puedes salir cuando quieras, yo guardo tu avance."
- **Criterio de éxito:** salir y volver conserva datos y paso; todos los pasos aplicables tienen "Atrás" sin pérdida.

### 3.3 · Amy Detective reconoce primero el progreso
- Solo copy + orden. Para la usuaria Happy Path (sin deudas, con capacidad): **primer mensaje = felicitación** ("No tienes deudas y te queda margen para ahorrar — vas muy bien").
- Segundo mensaje, en tono tranquilo: los gastos fijos pesan X% de tus ingresos, si quieres podemos revisar si hay espacio para liberar más.
- Quitar `¡Oops!` / lenguaje de alarma cuando no hay situación crítica. Mantener botones "revisar gastos" / "continuar".
- **Criterio de éxito:** el mensaje arranca reconociendo lo positivo; la optimización aparece como segundo mensaje.

### 3.4 · Explicar claramente el punto de partida del ahorro
- Reordenar la pantalla ~línea 929: **primero la secuencia del cálculo**, luego las opciones.
  1. Dinero disponible después de gastos fijos
  2. − reserva mensual para cajitas
  3. = monto realmente disponible para decidir
- Luego las 3 alternativas (recomendada / intermedia / flexible) explicando **la diferencia en palabras** y cuánto dinero libre queda en cada caso.
- Jerarquía visual en los números clave; el lenguaje explica decisiones, no fórmulas.
- **Criterio de éxito:** la usuaria puede explicar con sus palabras de dónde sale el monto disponible y la diferencia entre las 3 opciones.

### 3.5 · Mostrar dinero restante al crear bolsitas
- Saldo "te quedan X por repartir" **fijo y con alta jerarquía** durante toda la creación; actualiza en tiempo real al agregar/editar/eliminar.
- Al llegar a `$0`: reemplazar naranja/rojo por **estado positivo** — "¡Listo! Repartiste todo tu ahorro mensual" + microcelebración de marca + CTA de continuar claro.
- Nunca rojo/naranja/lenguaje de error cuando la distribución es correcta.
- **Criterio de éxito:** el saldo se actualiza al instante y `$0` se presenta como éxito, no alerta.

## Preguntas abiertas (cerrar antes de codear)

1. **3.1 — ¿persistencia en Supabase o `localStorage`?** ¿Aceptamos una migración de tabla/columnas para el borrador, o arrancamos con `localStorage` y lo movemos después?
2. **3.3 — ¿en qué pantalla ve realmente "Amy Detective" la usuaria Happy Path?** Confirmar si con capacidad de ahorro llega a `amy_detective` o si el mensaje de alarma está en otra pantalla (`ahorro_intro`, "punto de partida").
3. **3.3 / 3.5 — copy exacto de Amy.** ¿Lo escribe el socio o lo propongo yo y ustedes lo ajustan?
4. **3.5 — ¿cómo se ve la "microcelebración"?** ¿Confeti, ilustración de Amy, solo cambio de color + emoji? ¿Existe ya un patrón de celebración en `bolsillos` (`celebrado` flag) que debamos reusar?
5. **3.2 — ¿lista blanca de inputs NO monetarios?** Confirmar cuáles `type="number"` son meses / porcentaje / importancia para no romperlos.

## Avance de la sesión

- [x] `feat/epic-onboarding-happy-path` desde `main`
- [x] **3.2 · Formato de dinero** — `<MoneyInput>` en los 30 campos monetarios (`f64ac0a`).
      Extra que salió acá: selector de moneda + 20 países + ingresos en otra divisa (`0cc9ee2`).
- [x] **3.1 · Guardar progreso y volver atrás** — 2 partes:
  - navegación Atrás en los 7 pasos que faltaban + fix del quiz (`0cc9ee2`)
  - guardado de progreso en localStorage por usuario (`01efe31`)
  - Decisión: localStorage, no Supabase. Cruzar dispositivos queda anotado como idea
    pendiente (memoria `feature_ideas`), a revisar si vemos abandono real entre dispositivos.
  - Verificado end-to-end con Playwright (skill `browser-test`, `08b1dca`).
- [x] Extra fuera del Excel: ruta `/demo` (login anónimo, probar sin cuenta) + migración
      `ON DELETE CASCADE` (`22fecc2`).
- [ ] **3.3 · Amy Detective reconoce primero el progreso** — siguiente
- [ ] **3.4 · Explicar el punto de partida del ahorro**
- [ ] **3.5 · Saldo por repartir visible + estado de éxito en bolsitas**
- [ ] `npm run lint` y `npm run build` en verde — ✅ hasta ahora (13 errores preexistentes, 0 nuevos)
- [ ] Marcar en el Excel + `python3 docs/roadmap/sync.py`
- [ ] Push de la rama para que el socio pueda revisar (al final del día)
- [ ] PR contra `main`

### Preguntas abiertas que quedan (3.3–3.5)

- **3.3** — confirmado por prueba: en el Happy Path (sin deudas, con capacidad) la usuaria
  **no** pasa por `amy_detective`; va directo de `deudas` → `ahorro_intro` → `cajitas`.
  `amy_detective` solo aparece si `(ingresos - gastos) < 0.35 * ingresos` (presión de
  gastos fijos alta). Falta decidir: ¿el reconocimiento positivo va en `amy_detective`
  (para quien sí lo ve) y/o hay que agregar un mensaje de Amy en `ahorro_intro` para el
  Happy Path puro?
- **3.3 / 3.5** — ¿el copy exacto de Amy lo escribe el socio o lo propongo yo?
- **3.5** — ¿cómo se ve la microcelebración al llegar a $0? ¿Reusamos el patrón de
  `bolsillos.celebrado`?
