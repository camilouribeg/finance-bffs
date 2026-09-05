# Roadmap de experiencia — cómo trabajamos

Este folder es el puente entre el Excel que armamos con el socio del proyecto y el código.

## Archivos

| Archivo | Qué es |
|---|---|
| [`Finance-BFF-Experience-Roadmap.xlsx`](./Finance-BFF-Experience-Roadmap.xlsx) | **Fuente de verdad.** Lo edita el equipo (socio incluido). |
| [`roadmap.md`](./roadmap.md) | Espejo fiel del Excel, legible y diff-eable. Se regenera cuando el Excel cambia. |
| `epic-*.md` | Un doc por epic: resumen de sus user stories + **plan de ejecución** que se llena en la sesión de ese epic. |

### Regenerar `roadmap.md` desde el Excel

```bash
python3 docs/roadmap/sync.py
```

## El modelo de trabajo: una sesión = un epic

Cada epic se trabaja en **una sesión enfocada de Claude Code**. No se mezclan epics en la misma sesión.

Ritual de cada sesión:

1. **Contexto.** Abrir `roadmap.md` + el `epic-*.md` correspondiente. Leer las user stories completas (columna por columna).
2. **Plan.** Antes de tocar código, producir el plan de ejecución del epic: orden de las stories, archivos afectados, decisiones de UX/copy que hay que cerrar, riesgos. Se escribe en la sección "Plan de ejecución" del `epic-*.md`.
3. **Confirmar.** Revisar el plan con el humano. Cerrar las preguntas abiertas (copy exacto de Amy, estados visuales, etc.).
4. **Rama.** `git checkout -b feat/epic-<slug>` desde `main` (ej. `feat/epic-onboarding-happy-path`).
5. **Implementar story por story.** Un commit por user story, mensaje `feat: <qué> (roadmap 3.x)` — mismo estilo que el historial actual.
6. **Definición de "hecho"** = se cumple literalmente la **columna "Criterio de Éxito"** de esa story. Nada más, nada menos.
7. **Cerrar.** Marcar la story como `Completo` en el Excel y correr `sync.py`. Abrir PR contra `main` listando las stories cerradas.

### Convenciones que ya trae el proyecto (respetarlas)

- Todo el texto de cara a la usuaria en **español**.
- **"dinero"**, nunca "plata".
- Tono de Amy: cálido, sin jerga financiera, reconoce avances antes de señalar mejoras.
- Producto = **Amy** en la UI; marca = **Finance BFFs**.
- Paleta: `#ec7fa9` `#ffedfa` `#ffb8e0` `#1a1a2e`. Playfair para títulos.
- Formato de moneda: siempre `useFmt()` / `fmt(n)`. Nunca hardcodear `$` ni `toLocaleString`.
- `AGENTS.md`: este Next.js (16.2.2) tiene breaking changes — leer los docs en `node_modules/next/dist/docs/` antes de tocar routing/RSC.

## Estado actual (2026-09-04)

| Epic | Stories | Estado |
|---|---|---|
| **Primera impresión de la Landing** | 2.1 – 2.7 | ✅ Completo (commits `28cbd47` → `5027e0a`) |
| **Onboarding Happy Path** | 3.1 – 3.5 | ⬜ Pendiente → [`epic-onboarding-happy-path.md`](./epic-onboarding-happy-path.md) |
| **Acompañamiento después del onboarding** | 3.6, 3.9 | ⬜ Pendiente → [`epic-acompanamiento-post-onboarding.md`](./epic-acompanamiento-post-onboarding.md) |
| **Hábitos financieros y conexión con el banco** | 3.7, 3.8 | ⬜ Pendiente → [`epic-habitos-y-banco.md`](./epic-habitos-y-banco.md) |

### Orden sugerido de los epics pendientes

1. **Onboarding Happy Path** primero. Es fundación: arregla el guardado de progreso, el formato de dinero (refactor transversal) y el tono de Amy en el tramo final del onboarding. Las stories 3.6–3.9 asumen que este tramo ya quedó bien.
2. **Acompañamiento después del onboarding** (3.6 + 3.9). Convierte "Mis finanzas" en un plan de acción y enseña el menú. Depende de que 3.4/3.5 dejen claro el plan que se construyó.
3. **Hábitos y conexión con el banco** (3.7 + 3.8). Cierra el loop: qué hacer en el banco y el ritual semanal de gastos. Se apoya en el bloque "Qué hacer ahora" que crea 3.6.

> Nota: los IDs `2.x` / `3.x` vienen del documento de producto original (sección 2 = Landing, sección 3 = Onboarding y post-onboarding). Los epics no están numerados en el Excel; los agrupamos por la columna **Epic**.
