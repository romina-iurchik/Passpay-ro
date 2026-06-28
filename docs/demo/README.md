# Demo en video — Passpay

`passpay-flows.webm` es una grabación automatizada (Playwright) de los flujos reales de Passpay
corriendo contra el backend en vivo. ~50 s, con subtítulos.

## Qué muestra
1. **Cobro en ARS (Transferencias 3.0)** — monto → QR interoperable EMVCo real → simular pago del
   cliente → acreditación Coelsa + liquidación on-chain en Stellar. (Flujo completo end-to-end.)
2. **Off-ramp USDC → ARS (BlindPay)** — elegir cliente → crear cuenta ARS (CBU) → **quote real**
   contra el sandbox de BlindPay (50 USDC → ~76.300 ARS). Se graba hasta el paso de firma.
3. **Rampa dólar (Anchor SEP-24)** — anchor descubierto vía SEP-1, listo para on/off-ramp.

> Los flujos que firman con wallet (`/offramp`, `/pay`) se graban hasta el paso de la firma: el
> popup de Freighter/xBull es externo al navegador y no se automatiza.

## Regenerar el video
```bash
# 1. levantar backend y frontend
cd api && npm run dev          # :3001  (necesita api/.env con credenciales)
cd frontend && npm run dev     # :3000  (NEXT_PUBLIC_API_URL=http://localhost:3001)

# 2. instalar Playwright (una vez)
npm i -D playwright && npx playwright install chromium

# 3. grabar
node docs/demo/record-demo.js
# salida: docs/demo/videos/*.webm
```

Variables opcionales: `DEMO_BASE_URL` (default `http://localhost:3000`), `CHROMIUM_PATH`
(ruta a un chromium ya instalado).

## Convertir a mp4 (para subir al pitch)
El webm reproduce en cualquier browser/VLC. Para mp4, con un ffmpeg completo:
```bash
ffmpeg -i passpay-flows.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart passpay-flows.mp4
```
