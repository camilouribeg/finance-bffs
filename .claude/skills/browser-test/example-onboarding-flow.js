const { chromium } = require("playwright");

const CHROME_BIN =
  "/Users/user/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const BASE = "http://localhost:3000";
const SHOTS = __dirname + "/shots";
require("fs").mkdirSync(SHOTS, { recursive: true });

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || "" });
  console.log((cond ? "✅" : "❌"), name, detail ? "- " + detail : "");
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_BIN, headless: true });
  const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push("console: " + m.text()); });

  let shotN = 0;
  const shot = async (label) => {
    shotN++;
    const file = `${SHOTS}/${String(shotN).padStart(2, "0")}-${label}.png`;
    await page.screenshot({ path: file });
    return file;
  };

  const email = `pw-test-${Date.now()}@example.com`;

  // ---------- REGISTER ----------
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder("María").fill("Prueba");
  await page.locator("button", { hasText: "Continuar →" }).click();
  await page.getByPlaceholder("tu@correo.com").fill(email);
  await page.getByPlaceholder("Mínimo 8 caracteres").fill("TestPass123!");
  await page.getByPlaceholder("Repite tu contraseña").fill("TestPass123!");
  await page.locator("button", { hasText: "Crear mi cuenta →" }).click();
  await page.waitForURL(/onboarding/, { timeout: 15000 });
  check("registro crea cuenta y redirige a onboarding", true, page.url());

  // ---------- PERFIL_INICIAL ----------
  await page.waitForSelector("text=Antes de empezar");
  await page.locator("button", { hasText: "Colombia" }).click();
  await page.waitForSelector("text=¿En qué moneda manejas tu dinero?");
  await page.locator("button", { hasText: "25-34" }).click();
  await shot("perfil-inicial-seleccionado");
  const continuarBtn = page.locator("button", { hasText: "Continuar →" });
  check("Continuar habilitado tras elegir país+edad", await continuarBtn.isEnabled());
  await continuarBtn.click();

  // ---------- WELCOME -> ATRAS -> WELCOME ----------
  await page.waitForSelector("text=¡Bienvenida!");
  await shot("welcome");
  await page.locator("button", { hasText: "← Atrás" }).click();
  await page.waitForSelector("text=Antes de empezar");
  const continuarBtn2 = page.locator("button", { hasText: "Continuar →" });
  check("welcome->Atrás vuelve a perfil_inicial con país conservado (Continuar sigue habilitado)", await continuarBtn2.isEnabled());
  await shot("de-welcome-volvio-a-perfil");
  await continuarBtn2.click();
  await page.waitForSelector("text=¡Bienvenida!");
  await page.locator("button", { hasText: "Empecemos juntas →" }).click();

  // ---------- INGRESOS ----------
  await page.waitForSelector("text=Empecemos por tu dinero");
  await page.getByPlaceholder("Ej: 3.000.000").fill("3000000");
  await shot("ingresos-lleno");
  await page.locator("button", { hasText: "← Atrás" }).click();
  await page.waitForSelector("text=¡Bienvenida!");
  check("ingresos->Atrás vuelve a welcome", true);
  await page.locator("button", { hasText: "Empecemos juntas →" }).click();
  await page.waitForSelector("text=Empecemos por tu dinero");
  const ingresoValue = await page.getByPlaceholder("Ej: 3.000.000").inputValue();
  check("el ingreso escrito sigue ahí tras ir y volver", ingresoValue.replace(/\D/g, "") === "3000000", `valor mostrado: "${ingresoValue}"`);
  await page.locator("button", { hasText: "Siguiente →" }).click();

  // ---------- GASTOS ----------
  await page.waitForSelector("text=Ahora, lo que pagas cada mes");
  await page.getByPlaceholder("Nombre del gasto").fill("Arriendo");
  await page.getByPlaceholder("Valor").fill("500000");
  await page.locator("button", { hasText: "+ Agregar" }).click();
  await shot("gastos");
  await page.locator("button", { hasText: "Siguiente →" }).click();

  // ---------- DEUDAS (2 debts, to reach deuda_intro) ----------
  await page.waitForSelector("text=Tus deudas, sin miedo");
  await page.getByPlaceholder("¿A quién le debes? (nombre o tipo)").fill("Tarjeta");
  await page.getByPlaceholder("Ej: 300.000").fill("100000");
  await page.getByPlaceholder("Ej: 5.000.000").fill("1000000");
  await page.locator("button", { hasText: "+ Agregar deuda" }).click();
  await page.getByPlaceholder("¿A quién le debes? (nombre o tipo)").fill("Prestamo");
  await page.getByPlaceholder("Ej: 300.000").fill("100000");
  await page.getByPlaceholder("Ej: 5.000.000").fill("500000");
  await page.locator("button", { hasText: "+ Agregar deuda" }).click();
  await shot("deudas-2-agregadas");
  await page.locator("button", { hasText: "Siguiente →" }).click();

  // ---------- DEUDA_INTRO ----------
  await page.waitForSelector("text=Tener deudas no es malo", { timeout: 8000 });
  check("con 2 deudas y capacidad positiva llega a deuda_intro", true);
  await shot("deuda-intro");
  await page.locator("button", { hasText: "Hacer el test →" }).click();

  // ---------- QUIZ: answer A, A, then back twice, redo B, B, A ----------
  await page.waitForSelector("text=Pregunta 1 de 3");
  await page.locator("button", { hasText: "Quiero ver una deuda desaparecer pronto" }).click();
  await page.waitForSelector("text=Pregunta 2 de 3");
  await page.locator("button", { hasText: "Tachar una deuda de la lista" }).click();
  await page.waitForSelector("text=Pregunta 3 de 3");
  await shot("quiz-pregunta-3-antes-de-atras");

  await page.locator("button", { hasText: "← Atrás" }).click();
  await page.waitForSelector("text=Pregunta 2 de 3");
  check("quiz Atrás desde P3 vuelve a P2 (no a otro paso)", true);
  await page.locator("button", { hasText: "← Atrás" }).click();
  await page.waitForSelector("text=Pregunta 1 de 3");
  check("quiz Atrás x2 desde P3 vuelve a P1", true);
  await shot("quiz-de-vuelta-en-pregunta-1");

  // redo: B, B, A  (designed so a duplication bug would flip the result)
  await page.locator("button", { hasText: "Prefiero pagar lo menos posible en intereses" }).click();
  await page.waitForSelector("text=Pregunta 2 de 3");
  await page.locator("button", { hasText: "Saber que estoy tomando la decisión más inteligente" }).click();
  await page.waitForSelector("text=Pregunta 3 de 3");
  await page.locator("button", { hasText: "Me funciona mejor una cosa a la vez" }).click();

  // ---------- DEUDA_RESULTADO ----------
  await page.waitForSelector("text=Tu plan para salir de deudas", { timeout: 8000 });
  await shot("deuda-resultado");
  const resultText = await page.locator("body").innerText();
  const gotAvalancha = resultText.includes("Avalancha");
  const gotSnowball = resultText.includes("Bola de nieve");
  check(
    "resultado del quiz es Avalancha (correcto: B,B,A) y NO Bola de nieve (lo que daría el bug de duplicación)",
    gotAvalancha && !gotSnowball,
    `Avalancha presente: ${gotAvalancha}, Bola de nieve presente: ${gotSnowball}`
  );

  // ---------- deuda_resultado -> Atrás -> debe volver a Pregunta 3 de 3 ----------
  await page.locator("button", { hasText: "← Atrás" }).click();
  await page.waitForSelector("text=Pregunta 3 de 3", { timeout: 5000 }).then(
    () => check("resultado->Atrás vuelve al quiz en la última pregunta (3 de 3)", true),
    () => check("resultado->Atrás vuelve al quiz en la última pregunta (3 de 3)", false, "no encontró 'Pregunta 3 de 3'")
  );
  await shot("resultado-atras-a-quiz");

  console.log("\n=== CONSOLE/PAGE ERRORS ===");
  if (consoleErrors.length === 0) console.log("(ninguno)");
  else consoleErrors.forEach((e) => console.log(e));

  console.log("\n=== RESUMEN ===");
  const fails = results.filter((r) => !r.ok);
  console.log(`${results.length - fails.length}/${results.length} checks OK`);
  if (fails.length) {
    console.log("FALLOS:");
    fails.forEach((f) => console.log(" -", f.name, f.detail));
  }

  await browser.close();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error("ERROR FATAL:", e);
  process.exit(2);
});
