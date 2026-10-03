# Epic — Acompañamiento después del onboarding

**Stories:** 3.6 (Alta), 3.9 (Media) · Estado **Pendiente**
**Rama sugerida:** `feat/epic-acompanamiento-post-onboarding`
**Detalle completo de cada story:** ver [`roadmap.md`](./roadmap.md#detalle-por-user-story)

## Objetivo del epic

Hoy la usuaria termina el onboarding y **aterriza sola** en un dashboard lleno de números.
Este epic convierte "Mis finanzas" en el centro de acompañamiento de Amy: le dice qué construyeron
juntas, qué hacer ahora, y para qué sirve cada sección del menú.

| ID | Story | Tipo de cambio |
|---|---|---|
| 3.6 | Convertir Mis finanzas en un plan de acción | Bloque nuevo en el dashboard + lógica de "próximos pasos" por escenario |
| 3.9 | Enseñar cómo usar el menú principal | Guía inicial ligera (una sola vez) sobre el menú lateral |

**Dependencia:** conviene hacer este epic **después** de "Onboarding Happy Path" (3.4/3.5 dejan
claro el plan que se construyó; 3.6 lo retoma y lo vuelve acciones).

## Contexto de código

- **Dashboard:** [`src/app/app/page.tsx`](../../src/app/app/page.tsx) (~522 líneas). Client component.
  - Carga `dashboard_mensual` (mes/año) + `deudas`, `cajitas`, `bolsillos` (permanentes, `loadPermanent`, línea 99).
  - Ya tiene tarjetas por módulo con enlaces tipo `Link href="/app/gastos"` "Registrar gastos →" (líneas 367–475). El bloque "Qué hacer ahora" de 3.6 debe ir **arriba de todo**, no competir con estas tarjetas.
  - Fórmula central (ver `CLAUDE.md`): `Dinero libre = Ingresos − Gastos Fijos − Cajitas − Bolsitas − Cuotas Deudas`.
- **Menú lateral:** [`src/components/dashboard/AppSidebar.tsx`](../../src/components/dashboard/AppSidebar.tsx). `NAV` (línea 17): Mis finanzas, Mis gastos, Cajitas, Bolsitas de ahorro, Deudas.
- **Guard / layout:** [`src/app/app/layout.tsx`](../../src/app/app/layout.tsx) — server component, ya sabe si el trial está activo. Es el lugar natural para pasar "es la primera visita" al cliente (o un flag en `profiles`).
- **Patrón de estado "una sola vez" que ya existe:** en cajitas se usa `localStorage` con clave por mes (`cajitas_transferido_YYYY_M`). Para "guía ya vista" sirve un `localStorage` simple o una columna `profiles.dashboard_tour_done`.
- **Celebración ya existente:** `bolsillos.celebrado` — hay precedente de estados de logro que se pueden reusar de tono.

## Plan de ejecución propuesto

Orden: **3.6 → 3.9**. 3.6 es el corazón del epic; 3.9 es una capa ligera encima.

### 3.6 · Convertir Mis finanzas en un plan de acción
- Componente nuevo **`src/components/dashboard/PlanConAmy.tsx`** (o "Qué hacer ahora"), renderizado al tope de `app/page.tsx`.
- **Lógica de próximos pasos por escenario.** Derivar de los datos ya cargados:
  - ¿tiene cajitas creadas pero sin marcar la transferencia del mes? → "Prepara tus cajitas en el banco" (CTA → `/app/cajitas`)
  - ¿tiene bolsitas definidas pero saldo sin repartir / sin transferir? → "Crea tus bolsitas de ahorro" (CTA → `/app/ahorro`)
  - ¿no ha registrado gastos esta semana? → "Registra tus gastos de la semana" (CTA → `/app/gastos`) — se conecta con 3.8
  - transferencias recomendadas pendientes → "Completa tus transferencias del mes"
- **Máximo 3–4 acciones**, priorizadas. Las completadas se marcan visualmente (check) y bajan.
- No convertir el dashboard en una lista pesada de pendientes. Tono de Amy = acompañamiento, no regaño.
- **Criterio de éxito:** el dashboard muestra próximos pasos accionables y cada acción lleva directo al lugar donde se completa o se aprende cómo.

### 3.9 · Enseñar cómo usar el menú principal
- Guía breve en la **primera entrada** al dashboard: presenta el menú lateral y explica cada módulo en **una frase**.
  - Mis finanzas · tu panel del mes · Mis gastos · lo que gastas día a día · Cajitas · para gastos grandes que no son todos los meses · Bolsitas de ahorro · tus metas y fondos · Deudas · tu plan para salir de deudas
- Formato ligero: tooltips secuenciales / un panel lateral con lista, **no** un tour modal largo. Botón "omitir". No se repite una vez completada (flag `localStorage` o `profiles.dashboard_tour_done`).
- No bloquear el uso del dashboard.
- **Criterio de éxito:** la guía aparece en la primera entrada, puede omitirse y no vuelve a mostrarse una vez completada.

## Preguntas abiertas (cerrar antes de codear)

1. **3.6 — ¿qué escenarios existen además del Happy Path?** (con deudas / sin capacidad de ahorro). ¿Este epic cubre solo Happy Path o todos?
2. **3.6 — ¿cómo sabemos que una acción está "hecha"?** ¿Reusamos los flags de `localStorage` por mes (cajitas ya lo hace) o creamos una tabla `tareas_mensuales` en Supabase?
3. **3.6 — ¿el bloque reemplaza o convive con las tarjetas por módulo actuales?** (líneas 367–475 de `app/page.tsx`).
4. **3.9 — ¿flag en `localStorage` o columna en `profiles`?** (columna = migración, pero sobrevive cambio de dispositivo).
5. **3.9 — ¿el texto de cada módulo lo da el socio?**
6. **Orden global:** ¿confirmamos hacer este epic después de "Onboarding Happy Path"?

## Checklist de la sesión

- [ ] Leí `roadmap.md` (stories 3.6, 3.9) y este doc
- [ ] Cerré las preguntas abiertas con el humano
- [ ] Escribí el plan definitivo y lo confirmé
- [ ] `git checkout -b feat/epic-acompanamiento-post-onboarding` desde `main`
- [ ] 3.6 → commit `feat: bloque "Qué hacer ahora" con próximos pasos en Mis finanzas (roadmap 3.6)`
- [ ] 3.9 → commit `feat: guía inicial del menú lateral en la primera visita (roadmap 3.9)`
- [ ] `npm run lint` y `npm run build` en verde
- [ ] Probado: onboarding completo → primera entrada al dashboard → guía → acciones
- [ ] Marcadas 3.6 y 3.9 como `Completo` en el Excel + `python3 docs/roadmap/sync.py`
- [ ] PR contra `main`
