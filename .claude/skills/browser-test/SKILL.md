---
name: browser-test
description: Probar la app finance-bffs en un navegador real (registro, onboarding, dashboard) con Playwright headless. Usar cuando haya que confirmar que un cambio de UI funciona de verdad — no solo que compila — o hacer una prueba end-to-end de un flujo.
---

# Probar finance-bffs en un navegador real

macOS, sin xvfb. No hay `chromium-cli`; se usa el paquete `playwright` + un binario de
Chrome for Testing que ya está en la máquina.

## Prerrequisitos (una vez)

1. **Dev server corriendo** contra staging:
   ```bash
   npm run dev   # localhost:3000, .env.local ya apunta a staging
   timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'
   ```
2. **Playwright** en un dir de scratch (no agregar al package.json del proyecto):
   ```bash
   D=$(mktemp -d); cd "$D" && npm init -y >/dev/null && npm i playwright@1.55.0
   # correr los scripts con:  node --experimental-vm-modules ... o simplemente
   # NODE_PATH="$D/node_modules" node <script>
   ```
3. **Binario de Chromium** — ya existe uno completo:
   `/Users/user/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
   Se pasa como `chromium.launch({ executablePath, headless: true })`. Si no existe,
   `npx playwright install chromium` (descarga ~150MB, tarda).

## Auth

Las páginas `/onboarding` y `/app/*` exigen sesión de Supabase.

- **Cuenta nueva y desechable** (recomendado para pruebas de onboarding): staging tiene la
  confirmación de email apagada, así que un email falso `test-<timestamp>@example.com`
  sirve. Flujo en `/register`: llenar el placeholder `María` (nombre), click `Continuar →`,
  llenar `tu@correo.com` / `Mínimo 8 caracteres` / `Repite tu contraseña`, click
  `Crear mi cuenta →` → redirige a `/onboarding`.
- **Cuenta compartida de staging** (para probar el dashboard con datos ya cargados):
  `equipo@financebffs.test` / `FinanceBFFs2026!` en `/login`.

## Limpiar después

Borrar las cuentas de prueba de staging (no dejar basura):
```bash
URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2 | tr -d '"')
SVC=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2 | tr -d '"')
# listar y borrar las que empiecen con "test-" / "pw-"
curl -s "$URL/auth/v1/admin/users?per_page=200" -H "apikey: $SVC" -H "Authorization: Bearer $SVC" \
 | python3 -c "import json,sys; [print(u['id']) for u in json.load(sys.stdin)['users'] if u['email'].startswith(('test-','pw-'))]" \
 | xargs -I{} curl -s -X DELETE "$URL/auth/v1/admin/users/{}" -H "apikey: $SVC" -H "Authorization: Bearer $SVC" -o /dev/null -w "borrado {}: %{http_code}\n"
```

## Dos formas de manejarlo

- **REPL** ([driver.mjs](driver.mjs)) — para iterar. `node driver.mjs`, luego comandos
  línea a línea: `register`, `nav /login`, `click "← Atrás"`, `waitfor "Pregunta 1 de 3"`,
  `shot etiqueta`, `text`, `errors`. Envolver en tmux para un agente.
- **Script de un tiro** ([example-onboarding-flow.js](example-onboarding-flow.js)) — recorre
  todo el onboarding paso a paso con asserts. Copiarlo y adaptarlo para el flujo que se
  quiera probar. Corre con `NODE_PATH=<scratch>/node_modules node example-onboarding-flow.js`.

## Gotchas encontrados

- **El onboarding es una máquina de estados client-side** — los pasos NO cambian la URL.
  Usar `waitfor "<texto del paso>"`, nunca `waitForURL`.
- **Inputs controlados de React** (incluido `<MoneyInput>`): `.fill()` funciona bien,
  dispara el `onChange`. `el.value = ...` no.
- **Selección de pantalla por texto**: los `<h2>` de cada paso son únicos
  ("Empecemos por tu dinero", "Tus deudas, sin miedo", "Pregunta N de 3", etc.).
- **Ramas del onboarding** según finanzas: `capacidad <= 0` → `no_puede_intro`;
  `capacidad > 0` y `>1 deuda` → `deuda_intro` (quiz); `capacidad > 0`, `<=1 deuda`,
  y `(ingresos-gastos) >= 0.35*ingresos` → `ahorro_intro`; si no → `amy_detective`.
- **Revisar `errors` antes de declarar éxito** — una página puede pintar el shell mientras
  cada fetch de datos falla.
- Correr **headless** — un navegador con ventana aparece en la pantalla real del usuario.
