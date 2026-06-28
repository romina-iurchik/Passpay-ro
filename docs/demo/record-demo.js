// Graba un video demo de Passpay recorriendo los flujos reales contra el backend en vivo.
//
// Requisitos:
//   - Backend corriendo en http://localhost:3001  (cd api && npm run dev)
//   - Frontend corriendo en http://localhost:3000 (cd frontend && npm run dev)
//   - Playwright + chromium:  npm i -D playwright && npx playwright install chromium
//
// Uso:   node docs/demo/record-demo.js
// Salida: docs/demo/videos/*.webm   (un video continuo de ~50s con subtítulos)
//
// Nota: los flujos que firman con wallet (/offramp, /pay) se graban hasta el paso de la
// firma (el popup de Freighter/xBull es externo al browser y no se automatiza). El flujo
// /cobrar-ars (Transferencias 3.0) se graba de punta a punta.

const { chromium } = require("playwright");
const path = require("path");

const BASE = process.env.DEMO_BASE_URL || "http://localhost:3000";
const OUT = path.join(__dirname, "videos");
const VALID_CBU = "0170099220000067797370"; // Banco Galicia, checksum válido
// Opcional: ruta a un chromium ya instalado (si no, usa el de Playwright)
const EXECUTABLE_PATH = process.env.CHROMIUM_PATH || undefined;

const sleep = (p, ms) => p.waitForTimeout(ms);

async function cap(page, title, sub = "") {
  await page.evaluate(({ title, sub }) => {
    let el = document.getElementById("pp-cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "pp-cap";
      el.style.cssText =
        "position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(90deg,#5B4BF5,#16E0A3);color:#fff;font:600 14px/1.35 system-ui,sans-serif;padding:9px 14px;text-align:center;box-shadow:0 3px 12px rgba(0,0,0,.45)";
      document.body.appendChild(el);
    }
    el.innerHTML = title + (sub ? `<div style="font-weight:400;font-size:11px;opacity:.92;margin-top:2px">${sub}</div>` : "");
  }, { title, sub }).catch(() => {});
}

async function clickByText(page, rx) {
  await page.getByRole("button", { name: rx }).first().click({ timeout: 15000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXECUTABLE_PATH });
  const context = await browser.newContext({
    viewport: { width: 480, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: 480, height: 900 } },
  });

  // Oculta el overlay de dev de Next en cada navegación
  await context.addInitScript(() => {
    const hide = () =>
      document.querySelectorAll("nextjs-portal").forEach((e) => e.style.setProperty("display", "none", "important"));
    const start = () => {
      hide();
      new MutationObserver(hide).observe(document.documentElement, { childList: true, subtree: true });
    };
    if (document.documentElement) start();
    else document.addEventListener("DOMContentLoaded", start);
  });

  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    // 0 · Home
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await cap(page, "Passpay", "Cobrá en cualquier moneda · liquidá en dólares on-chain");
    await sleep(page, 3000);

    // 1 · Cobrar en ARS (Transferencias 3.0)
    await page.goto(BASE + "/cobrar-ars", { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: ".glass-card .glass-card{background:rgba(15,23,42,.9)!important} .glass-card .glass-card span{color:#e2e8f0!important}",
    }).catch(() => {});
    await cap(page, "1 · Cobro en ARS — Transferencias 3.0", "El comercio ingresa el monto en pesos");
    await page.getByText("passpay.ars").waitFor({ state: "visible", timeout: 12000 }).catch(() => {});
    await sleep(page, 1500);

    const amountInput = page.locator('input[inputmode="decimal"]');
    await amountInput.click();
    for (const ch of "15000") await amountInput.type(ch, { delay: 90 });
    await sleep(page, 1200);

    await cap(page, "1 · Generando QR interoperable", "Formato EMVCo real (CRC16) · CVU recaudador");
    await clickByText(page, /Generar QR/i);
    await page.locator('img[alt="QR Transferencias 3.0"]').waitFor({ state: "visible", timeout: 20000 });
    await sleep(page, 2800);

    await cap(page, "1 · Cliente paga por su billetera/banco", "Acreditación vía Coelsa (simulada)");
    await clickByText(page, /Simular pago/i);
    await page.getByText(/Pago acreditado/i).waitFor({ state: "visible", timeout: 25000 });
    await cap(page, "1 · ✓ Acreditado + liquidación on-chain", "Coelsa ID + hash en Stellar");
    await sleep(page, 3500);

    // 2 · Off-ramp USDC → ARS (BlindPay)
    await page.goto(BASE + "/offramp", { waitUntil: "networkidle" });
    await cap(page, "2 · Off-ramp USDC → ARS — BlindPay", "Retirar dólares on-chain a una cuenta en pesos");
    await page.waitForFunction(() => {
      const sel = document.querySelector("select");
      return sel && !/Cargando/i.test(sel.options[sel.selectedIndex]?.text || "Cargando");
    }, { timeout: 15000 }).catch(() => {});
    await sleep(page, 2500);

    const cbuInput = page.locator('input[placeholder="22 dígitos"]');
    if (await cbuInput.count()) {
      await cap(page, "2 · Cuenta ARS de destino (CBU)", "Rail transfers_bitso → ARS");
      await cbuInput.first().click();
      await cbuInput.first().fill(VALID_CBU);
      await sleep(page, 1200);
      await clickByText(page, /Crear cuenta ARS/i);
      await sleep(page, 3000);
    }

    await cap(page, "2 · Cotizando contra BlindPay (en vivo)", "request_amount en centavos · moneda por el rail");
    const cotizar = page.getByRole("button", { name: /Cotizar/i });
    if (await cotizar.count()) {
      await cotizar.first().click();
      await page.getByText(/Confirmá y firmá/i).waitFor({ state: "visible", timeout: 25000 }).catch(() => {});
      await cap(page, "2 · ✓ Quote real USDC → ARS", "Próximo paso: firmar con la wallet (Freighter/xBull)");
      await sleep(page, 4000);
    }

    // 3 · Rampa anchor SEP-24
    await page.goto(BASE + "/ramp", { waitUntil: "networkidle" });
    await sleep(page, 2500);
    await cap(page, "3 · Rampa dólar — Anchor SEP-24", "Descubrimiento SEP-1 · auth SEP-10 · on/off-ramp SEP-24");
    await sleep(page, 4000);

    // cierre
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await cap(page, "Passpay", "Transferencias 3.0 + Anchor SEP-24 + BlindPay · sobre Stellar");
    await sleep(page, 3000);

    console.log("FLOWS_OK");
  } catch (e) {
    console.error("ERROR_DURING_RECORDING:", e.message);
  } finally {
    await context.close();
    const video = page.video();
    console.log("VIDEO_PATH=" + (video ? await video.path() : null));
    await browser.close();
  }
})();
