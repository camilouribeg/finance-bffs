# Finly Project Context

Last updated: 2026-04-21

This note captures the current product context for `finance-bffs` based on:

- the checked-in app code
- the feedback files in `feedback/`
- the matching files found in `~/Downloads`
- the onboarding flow document in `docs/flujo-finly.tex`

## Repo State When This Note Was Created

The git worktree was clean before this document was added.

## Product Summary

Finly is a Spanish-language personal finance product for Finance BFFs. The core promise is:

- organize monthly money without spreadsheets or complicated finance concepts
- guide the user step by step instead of dropping them into a dense dashboard
- help users understand spending, prepare for irregular expenses, save intentionally, and reduce debt

The implemented visual language is consistent across the app:

- brand pink palette: `#ec7fa9`, `#ffedfa`, `#ffb8e0`
- warm, supportive copy aimed at reducing overwhelm
- private-account framing with subscription-gated app access

## Source Files That Define The Product

### Feedback / idea docs

- `feedback/Cosas para agregar.pdf`
  - naming ideas, story/copy, benefits, pricing, and product positioning
- `feedback/Cosas para agregar 13 de abril.pdf`
  - onboarding storytelling, debt logic, savings branches, and dynamic debt-method behavior
- `feedback/Componentes de plantilla control de gastos.pdf`
  - core component list for the monthly money template

Matching files were also present in `~/Downloads`, which suggests the repo copies are the project artifacts you wanted preserved as context.

### Internal flow doc

- `docs/flujo-finly.tex`
  - defines the central formula:
    `Ingresos - Gastos Fijos - Cajitas - Bolsitas - Cuotas Deudas = Dinero libre mensual`
  - describes special modes:
    - `Finly Detective` for high fixed-spend pressure
    - `Finly Rompe-deudas` when debt pressure blocks saving

## Current App Map

### Public-facing experience

- `src/app/page.tsx`
  - landing page with product story, benefits, how-it-works, and pricing
- `src/app/login/page.tsx`
  - login flow
- `src/app/register/page.tsx`
  - account creation entry point

### Guided setup

- `src/app/onboarding/page.tsx`
  - the main product setup wizard
  - collects:
    - incomes
    - fixed expenses
    - debts
    - debt strategy
    - cajitas
    - savings pockets / goals
  - branches based on financial capacity

### Authenticated product

- `src/app/app/page.tsx`
  - monthly dashboard / overview
- `src/app/app/gastos/page.tsx`
  - expense tracking and category analysis
- `src/app/app/cajitas/page.tsx`
  - irregular planned expenses
- `src/app/app/ahorro/page.tsx`
  - savings pockets and goals
- `src/app/app/deudas/page.tsx`
  - debt summary and payoff strategy
- `src/app/app/checkout/page.tsx`
  - subscription activation flow

## The Main Product Modules

### 1. Ingresos

The product starts by collecting fixed income and other income. This establishes the monthly base for all later recommendations.

### 2. Gastos

There are two related spending concepts in the project:

- fixed monthly expenses used in onboarding and the main dashboard
- tracked day-to-day spending in `Mis gastos`

The feedback doc also mentions variable expenses and category-based tracking, which aligns with the current `gastos` page.

### 3. Deudas

Debt handling is a major decision point. The app supports:

- debt capture during onboarding
- optional interest-rate awareness
- debt-method recommendation:
  - snowball
  - avalanche
  - balanced
- method-specific ordering and coaching in the debt screen

### 4. Cajitas

This is my working interpretation of the "box" you referred to.

`Cajitas` represents large or periodic expenses that do not happen every month but should be funded monthly in advance. Examples already built into the product include:

- SOAT
- vehicle tax
- car insurance
- school fees
- vacations
- annual memberships

Product role of `Cajitas`:

- convert irregular expenses into a monthly reserve target
- calculate how much the user should set aside each month
- reduce the shock of future bills
- subtract that planned amount from available monthly money

This module appears both in:

- onboarding, where cajitas can be created initially
- the dedicated `src/app/app/cajitas/page.tsx` screen
- the central formula in `docs/flujo-finly.tex`

So if you mean "the last box" as the remaining or newly added product block, `Cajitas` is the strongest match in the codebase and docs.

### 5. Bolsillos / Ahorro

Savings is modeled in two ways:

- recurring funds (`fondos`)
- goal-based savings (`metas`)

The app tracks:

- target amount
- current amount
- monthly contribution
- target date
- importance
- celebration / reassignment behavior once a goal is completed

## Key Product Logic

The repo consistently treats monthly money as a guided allocation problem:

1. Capture what comes in.
2. Capture what must go out.
3. If debt pressure is high, prioritize debt organization.
4. If capacity exists, reserve for irregular expenses through `Cajitas`.
5. Then allocate to savings pockets/goals.
6. Show what remains as available monthly money.

This means `Cajitas` is not a side feature. It is part of the core monthly planning model.

## Technical Context

- Framework: `next@16.2.2`
- React: `19.2.4`
- Styling: Tailwind CSS v4
- Auth and data: Supabase
- Billing: Stripe
- Charts: Recharts

The repo also includes an instruction in `AGENTS.md` that this Next.js version may differ from older conventions, and agents should read the relevant Next docs before changing app code.

## Working Conclusion

At this point, the project context is:

- product name: `Finly`
- brand: `Finance BFFs`
- primary app areas:
  - onboarding
  - dashboard
  - gastos
  - cajitas
  - ahorro
  - deudas
  - checkout/subscription
- strongest interpretation of "the box":
  - `Cajitas`, the irregular-expense planning module

If later we discover you meant a different "box" from another file in `Downloads`, this note should still be safe because it records the current code-backed interpretation rather than pretending certainty where we do not have it.
