# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # ESLint check
```

No test runner is configured.

## Stack

- **Next.js 16.2.2** with App Router (React 19.2.4) — see AGENTS.md warning
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, not `tailwind.config.*`
- **Supabase** (`@supabase/ssr`) for auth and database
- **Stripe** for subscriptions
- **Recharts** for charts in the gastos page

## Architecture

### Route structure

```
src/app/
  page.tsx                    # landing page
  login/ register/            # auth pages
  onboarding/                 # guided setup wizard (single page, multi-step state machine)
  app/                        # authenticated area — layout enforces auth + onboarding + subscription
    page.tsx                  # monthly dashboard (mis finanzas)
    gastos/                   # day-to-day expense tracking
    cajitas/                  # irregular-expense planning (fund monthly for periodic bills)
    ahorro/                   # savings pockets (fondos) and goals (metas)
    deudas/                   # debt tracker with payoff strategy
    checkout/                 # Stripe subscription activation
  api/
    auth/callback/            # Supabase OAuth callback
    onboarding/complete/      # marks profile complete, starts 40-day trial
    stripe/checkout/          # creates Stripe checkout session
    stripe/webhook/           # handles checkout.session.completed, subscription events
```

### Auth and access guard

`src/app/app/layout.tsx` (Server Component) is the sole gatekeeper:
1. No Supabase session → `/login`
2. No profile or `onboarding_completed = false` → `/onboarding`
3. Trial expired and no active subscription → `/app/checkout?expired=true`
4. Otherwise renders with a trial banner if still in trial

`src/proxy.ts` is a middleware helper that handles Supabase session cookie refresh for `/app/**` routes. It exports `proxy` and `config` (with the matcher).

### Supabase clients

- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`), used in all `"use client"` components
- `src/lib/supabase/server.ts` — async server client (`createServerClient` + cookies), used in Server Components and API routes

Server-side Stripe webhook (`api/stripe/webhook/route.ts`) uses `createServerClient` directly with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).

### Database tables

| Table | Key columns |
|---|---|
| `profiles` | `onboarding_completed`, `subscription_status`, `trial_ends_at`, `stripe_customer_id`, `debt_method` |
| `dashboard_mensual` | `user_id`, `month`, `year`, `ingreso_fijo`, `ingresos_otros[]`, `gastos_fijos_items[]`, `gastos_fijos` |
| `gastos` | `user_id`, `fecha`, `categoria`, `descripcion`, `valor` |
| `deudas` | `user_id`, `nombre`, `tipo`, `cuota_mensual`, `total_pendiente`, `tasa` |
| `cajitas` | `user_id`, `nombre`, `emoji`, `monto_total`, `actual`, `fecha_pago` |
| `bolsillos` | `user_id`, `nombre`, `emoji`, `tipo` (fondos\|metas), `meta`, `actual`, `cuota_mensual`, `fecha_meta`, `importancia`, `celebrado` |

### Core financial formula

```
Dinero libre = Ingresos − Gastos Fijos − Cajitas (monthly reserve) − Bolsitas (monthly contribution) − Cuotas Deudas
```

This formula drives the dashboard and the onboarding capacity checks.

### Currency formatting

`src/lib/useFmt.ts` is a client hook that reads `amy_pais` from `localStorage` (set during onboarding) and returns a `fmt(n)` function using `Intl.NumberFormat`. Default is COP/es-CO. Every monetary display in the app uses this hook — do not hardcode currency symbols or `toLocaleString` calls.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, used in webhook
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
NEXT_PUBLIC_APP_URL
```

## Design system

Brand palette (use raw hex values; Tailwind v4 CSS variables are defined in `globals.css`):
- `#ec7fa9` — hot pink (primary buttons, active nav, accents)
- `#ffedfa` — pale pink (backgrounds, input fills)
- `#ffb8e0` — mid pink (borders, subtle elements)
- `#1a1a2e` — near-black (text)

Fonts loaded in `src/app/layout.tsx`: `--font-dm-sans` (body) and `--font-playfair` (headings). Apply Playfair with `style={{ fontFamily: "var(--font-playfair)" }}`.

## Copy conventions

- All user-facing text is in Spanish.
- Use **"dinero"**, never "plata".
- Tone is warm, supportive, and avoids financial jargon — the target user is someone who feels overwhelmed by finances.
- The product is called **Amy** in the UI (sidebar, headers); **Finance BFFs** is the brand.
