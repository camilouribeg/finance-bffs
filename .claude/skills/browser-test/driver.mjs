// REPL para manejar el app en un navegador real (headless Chromium via Playwright).
// Uso: node .claude/skills/browser-test/driver.mjs   (luego escribir comandos línea a línea)
// Pensado para agentes: envolver en tmux, send-keys un comando a la vez, capture-pane.
//
//   nav /register            -> va a http://localhost:3000/register
//   fill <selector> <texto>  -> .fill() (dispara onChange de React bien)
//   click <selector-o-texto>  -> click; si no parece selector, hace click en el botón con ese texto
//   waitfor <texto>          -> espera a que aparezca ese texto en la página
//   shot [etiqueta]          -> screenshot en ./shots/
//   text                     -> imprime el innerText del body
//   url                      -> imprime la URL actual
//   errors                   -> imprime errores de consola/página acumulados
//   register <email>         -> registra una cuenta nueva (staging: email falso sirve) y espera /onboarding
//   quit
import { chromium } from "playwright";
import * as readline from "node:readline";
import * as fs from "node:fs";

const CHROME_BIN =
  process.env.CHROME_BIN ||
  "/Users/user/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = new URL("./shots/", import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME_BIN, headless: true });
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()));

const looksLikeSelector = (s) => /^[.#\[]|:has-text|>>|=/.test(s) || /^[a-z]+\[/.test(s);
const loc = (s) => (looksLikeSelector(s) ? page.locator(s) : page.locator("button", { hasText: s }));

let n = 0;
const rl = readline.createInterface({ input: process.stdin });
console.log("driver listo. escribí comandos (quit para salir).");
for await (const line of rl) {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(" ");
  try {
    if (cmd === "nav") { await page.goto(BASE + (arg.startsWith("/") ? arg : "/" + arg)); console.log("ok", page.url()); }
    else if (cmd === "fill") { const [sel, ...v] = rest; await page.locator(sel).first().fill(v.join(" ")); console.log("ok"); }
    else if (cmd === "click") { await loc(arg).first().click(); console.log("ok"); }
    else if (cmd === "waitfor") { await page.waitForSelector(`text=${arg}`, { timeout: 10000 }); console.log("ok, visible:", arg); }
    else if (cmd === "shot") { n++; const f = `${SHOTS}${String(n).padStart(2, "0")}-${arg || "shot"}.png`; await page.screenshot({ path: f }); console.log(f); }
    else if (cmd === "text") { console.log((await page.locator("body").innerText()).slice(0, 3000)); }
    else if (cmd === "url") { console.log(page.url()); }
    else if (cmd === "errors") { console.log(errs.length ? errs.join("\n") : "(ninguno)"); }
    else if (cmd === "register") {
      await page.goto(BASE + "/register");
      await page.getByPlaceholder("María").fill("Prueba");
      await page.locator("button", { hasText: "Continuar →" }).click();
      await page.getByPlaceholder("tu@correo.com").fill(arg || `test-${Date.now()}@example.com`);
      await page.getByPlaceholder("Mínimo 8 caracteres").fill("TestPass123!");
      await page.getByPlaceholder("Repite tu contraseña").fill("TestPass123!");
      await page.locator("button", { hasText: "Crear mi cuenta →" }).click();
      await page.waitForURL(/onboarding/, { timeout: 15000 });
      console.log("ok, en onboarding");
    }
    else if (cmd === "quit" || cmd === "exit") break;
    else console.log("comando desconocido:", cmd);
  } catch (e) {
    console.log("ERR:", e.message.split("\n")[0]);
  }
}
await browser.close();
process.exit(0);
