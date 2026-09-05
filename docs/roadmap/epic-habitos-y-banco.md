# Epic — Hábitos financieros y conexión con el banco

**Stories:** 3.7 (Alta), 3.8 (Alta) · Estado **Pendiente**
**Rama sugerida:** `feat/epic-habitos-y-banco`
**Detalle completo de cada story:** ver [`roadmap.md`](./roadmap.md#detalle-por-user-story)

## Objetivo del epic

Finance BFF **organiza el plan pero no mueve el dinero**. Este epic cierra el loop con la vida real:
(3.7) qué debe separar/transferir la usuaria en su banco y cómo registrar que ya lo hizo, y
(3.8) convertir el registro de gastos en un ritual semanal liviano en vez de algo que hay que recordar.

| ID | Story | Tipo de cambio |
|---|---|---|
| 3.7 | Guiar la creación de cajitas y bolsitas en el banco | Extender el patrón "banco" (ya existe en Cajitas) a Bolsitas + enlazar desde el dashboard |
| 3.8 | Crear el ritual semanal de registro de gastos | Rutina recomendada en Mis gastos + reflejo de "semana al día" en el dashboard |

**Dependencia:** se apoya en el bloque "Qué hacer ahora" del epic 3.6 (las tareas pendientes del
dashboard enlazan a estos módulos). Hacer **después** de "Acompañamiento después del onboarding".

## Contexto de código

### Lo que YA existe (reusar, no reinventar)
- **Cajitas ya tiene el patrón "banco":** [`src/app/app/cajitas/page.tsx`](../../src/app/app/cajitas/page.tsx)
  - Texto "¿Qué debes hacer en tu banco?" (línea 161).
  - Botón "Marcar transferencia de este mes como hecha" (línea 199), persistido en `localStorage` con clave mensual `cajitas_transferido_YYYY_M` (líneas 33, 53, 128–131).
  - `marcarPagada()` (línea 106): al pagar una cajita resetea `actual: 0` y avanza `fecha_pago` un año.
- **Gastos ya tiene voz + manual:** [`src/app/app/gastos/page.tsx`](../../src/app/app/gastos/page.tsx) — entrada por voz con Amy (Groq + Web Speech API, commit `e59cb0e`) y tabs Diarios/Fijos con edición inline (commit `df95f57`).

### Lo que falta
- **Bolsitas / ahorro no tiene el patrón "banco":** [`src/app/app/ahorro/page.tsx`](../../src/app/app/ahorro/page.tsx) permite abonar/retirar (`abonar`, línea 180; retiro, línea 199) pero no explica la acción bancaria ni tiene "marcar transferencia del mes".
- **No hay noción de "semana al día"** en gastos ni en el dashboard.

## Plan de ejecución propuesto

Orden: **3.7 → 3.8**.

### 3.7 · Guiar la creación de cajitas y bolsitas en el banco
- **Bolsitas:** portar el bloque de Cajitas a `ahorro/page.tsx`:
  - "¿Qué debes hacer en tu banco?" — monto total a separar este mes + desglose por bolsita.
  - Botón "Marcar transferencia de este mes como hecha", `localStorage` clave `bolsitas_transferido_YYYY_M`.
- **Consistencia de lenguaje** en ambos módulos: diferenciar explícitamente
  - "Amy **reserva** en tu presupuesto" (lo que hace la app)
  - "Tú **separas / transfieres** en tu banco" (lo que hace la usuaria)
- **Desde Mis finanzas:** las tareas del bloque "Qué hacer ahora" (3.6) enlazan directo a estos módulos y su estado se deriva de los mismos flags mensuales.
- Considerar **unificar los flags** de transferencia en un helper compartido (`src/lib/transferencias.ts`) para que dashboard y módulos lean lo mismo. Evaluar si conviene subirlos a Supabase (sobreviven cambio de dispositivo) — decisión a cerrar.
- **Criterio de éxito:** los módulos explican la acción bancaria y permiten registrar el cumplimiento mensual, sin confundir reserva presupuestal con transferencia real.

### 3.8 · Crear el ritual semanal de registro de gastos
- En **Mis gastos**, bloque de rutina recomendada: "Dedica unos minutos una vez por semana —idealmente domingo o lunes— a contarme en qué gastaste." La voz se presenta como la forma más fácil de ponerse al día, no una obligación.
- **Noción de "semana actualizada":** marcar cuándo se registró por última vez / si la semana en curso ya tiene registros. `localStorage` `gastos_semana_YYYY_Www` o derivarlo de la fecha del último gasto registrado.
- **Reflejo en el dashboard** (3.6): "Registra tus gastos de la semana" aparece como pendiente si la semana no está al día, y se marca completa cuando sí.
- Sin culpa si se atrasa. Tono liviano.
- **Criterio de éxito:** Mis gastos comunica la rutina semanal y el dashboard refleja si la actualización de la semana está pendiente o completa.

## Preguntas abiertas (cerrar antes de codear)

1. **3.7 — ¿flags de transferencia en `localStorage` o Supabase?** Hoy Cajitas usa `localStorage`. Si el dashboard (3.6) depende de esto, ¿lo migramos a una tabla `tareas_mensuales`?
2. **3.7 — ¿el desglose por bolsita/cajita en el mensaje bancario, o solo el total?** (la story dice "cuando aplique").
3. **3.8 — ¿"semana al día" por `localStorage` semanal o derivado de la fecha del último gasto?** El segundo no necesita estado nuevo pero es menos explícito ("registré algo el lunes" ≠ "ya revisé toda la semana").
4. **3.8 — ¿día de la semana recomendado configurable o fijo (domingo/lunes)?**
5. **3.8 — ¿recordatorio / notificación?** ¿Entra en este epic o queda para después? (hay PWA desde `5ad6ee4`).
6. **Orden global:** ¿confirmamos hacer este epic al final de los tres pendientes?

## Checklist de la sesión

- [ ] Leí `roadmap.md` (stories 3.7, 3.8) y este doc
- [ ] Cerré las preguntas abiertas con el humano
- [ ] Escribí el plan definitivo y lo confirmé
- [ ] `git checkout -b feat/epic-habitos-y-banco` desde `main`
- [ ] 3.7 → commit `feat: guía bancaria + marcar transferencia del mes en Bolsitas (roadmap 3.7)`
- [ ] 3.8 → commit `feat: ritual semanal de gastos + estado "semana al día" (roadmap 3.8)`
- [ ] `npm run lint` y `npm run build` en verde
- [ ] Probado: marcar transferencias → dashboard refleja el estado; registrar gastos → semana al día
- [ ] Marcadas 3.7 y 3.8 como `Completo` en el Excel + `python3 docs/roadmap/sync.py`
- [ ] PR contra `main`
