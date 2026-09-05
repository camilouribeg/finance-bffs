# Entornos: dev, staging, producción

Hasta el 2026-09-05, `npm run dev` apuntaba a la **misma base de datos de Supabase que
producción** (`djwcpxanrzaabopkcydp.supabase.co` estaba tanto en `.env.local` como en
`.env.production`). Esto ya quedó separado — ver estado abajo.

## Por qué un segundo proyecto de Supabase (y no solo local)

Local-only (`supabase start` con Docker) es perfecto para iterar rápido, pero no es
alcanzable por nadie más que la máquina donde corre. Un segundo proyecto en la nube:

- da un **Preview URL de Vercel por cada rama/PR** que ya funciona contra datos de prueba
- es lo que necesitas para "probar con el usuario" (tu socio, o cualquier tester)
- cuesta $0 en el free tier de Supabase a este tamaño

Se puede agregar Supabase local más adelante sin fricción: el esquema ya vive en
`supabase/migrations/`, así que `supabase start` puede leer esas mismas migraciones el día
que se necesite.

## Arquitectura objetivo

| Entorno | Corre cuando | Supabase | Stripe |
|---|---|---|---|
| **Local dev** | `npm run dev` | `finance-bffs-staging` | pendiente (test mode, fase 8) |
| **Preview** | cualquier rama/PR en Vercel | `finance-bffs-staging` | pendiente (test mode, fase 8) |
| **Producción** | `main` → finance-bffs.vercel.app | `Finance BFFs` (prod, intacto) | live mode |

## Estado — ✅ hecho (2026-09-05)

- **Esquema de prod capturado**: `supabase/migrations/20260905041614_remote_schema.sql`
  (6 tablas, RLS en todas, trigger `handle_new_user`). Se generó con `supabase db pull`
  contra prod — solo lectura, no tocó nada.
- **Proyecto de staging creado**: `finance-bffs-staging`, ref `ducygjcfdiykcveqfpun`,
  misma región que prod (`sa-east-1`). La contraseña de su base de datos se generó y se
  entregó una sola vez para que la guardaras en tu gestor de contraseñas — no queda en
  ningún archivo de este repo ni en mi historial de comandos.
- **Esquema aplicado a staging** vía `supabase db push`.
- **Confirmación de email apagada en staging** vía `supabase config push` (usa el
  `[auth]` de `supabase/config.toml`, que ya trae `enable_confirmations = false` — el
  valor por defecto para desarrollo). `site_url` y `additional_redirect_urls` se
  ajustaron a `localhost:3000` + wildcard de previews de Vercel.
- **Vercel, scope Development**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL=http://localhost:3000` — las cuatro
  apuntando a staging.
- **`.env.local` actualizado** (`vercel env pull --environment=development`) y
  `.env.production` borrado del disco — Vercel es ahora la única fuente de verdad para prod.
- **Probado de punta a punta contra staging**: signup por API → sesión inmediata (sin
  esperar confirmación de email) → fila en `profiles` creada por el trigger → usuario de
  prueba borrado después. La cadena completa funciona.

⚠️ **`supabase config push` escribe sobre la configuración de Auth del proyecto
actualmente linkeado.** Antes de correrlo, siempre confirmar con
`cat supabase/.temp/project-ref` que apunta a **staging** (`ducygjcfdiykcveqfpun`), nunca
a prod (`djwcpxanrzaabopkcydp`).

## Pendiente — tuyo

### 1. Guardar la contraseña de la base de datos de staging

Te la mostré una sola vez en el chat cuando creé el proyecto. Si no la guardaste,
resetéala en: supabase.com/dashboard → `finance-bffs-staging` → Project Settings →
Database → Database password.

### 2. Variables de Vercel en el scope Preview

Vercel bloquea que un agente aplique una variable a *todas* las ramas de Preview sin que
un humano lo confirme en su propia terminal — es una barrera de seguridad a propósito, no
un error. Corre esto tú, pegando los mismos valores que ya están en Development (los
tienes en tu `.env.local`, o en supabase.com/dashboard → `finance-bffs-staging` →
Project Settings → API):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

Cuando pregunte por rama de Git, deja la respuesta que aplica a **todas las ramas de
Preview** (la opción sin argumento de rama).

### 3. Groq y Stripe no están en local/staging todavía

`vercel env pull` solo trajo lo que existe en el scope Development, y Groq/Stripe nunca
estuvieron ahí (solo en Production). Esto significa que en local, hoy:

- **la entrada de gastos por voz (Groq) no funciona** — necesita `GROQ_API_KEY`
- **el checkout de Stripe no funciona** — necesita las llaves de Stripe

Ninguna de las dos bloquea el Epic A (Onboarding Happy Path: 3.1–3.5), que no toca ni
gastos por voz ni checkout. Cuando se necesite:
   - Groq: se puede reusar la misma llave de prod en Development + Preview (no es un
     dato sensible de usuarias, solo una llave de API con facturación por uso) — avísame
     y la copio.
   - Stripe: crear un producto/precio en **test mode**, usar esas llaves
     `pk_test_.../sk_test_...` en Preview + Development, y correr
     `stripe listen --forward-to localhost:3000/api/stripe/webhook` para los webhooks en
     local (fase 8, más abajo).

## Runbook original (referencia)

### Fase 8 — Stripe en test mode (opcional, no bloquea el Epic A)

Cuando haga falta probar checkout:
   - crear un producto/precio en Stripe **test mode**, usar esa `STRIPE_PRICE_ID` y las
     llaves `pk_test_.../sk_test_...` en Preview + Development
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook` para recibir webhooks en local
   - un webhook endpoint de test mode separado en el dashboard de Stripe

## Checklist

- [x] Esquema de prod capturado en `supabase/migrations/`
- [x] Proyecto `finance-bffs-staging` creado
- [x] Esquema aplicado a staging
- [x] Confirmación de email apagada en staging
- [x] Variables en Vercel — scope Development
- [ ] Variables en Vercel — scope Preview (tuyo, ver arriba)
- [x] `.env.local` apunta a staging, `.env.production` borrado del disco
- [x] Probado de punta a punta (signup → trigger → RLS) contra staging
- [ ] Groq en Development/Preview (cuando se necesite)
- [ ] Stripe test mode (cuando se necesite, fase 8)
