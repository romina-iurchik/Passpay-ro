// Webhook receiver para acreditaciones de Coelsa (Transferencias 3.0)
// Cuando un banco liquida un pago via T3, Coelsa hace POST a este endpoint
// con los datos de la transferencia.
//
// Por ahora el secreto HMAC y el formato exacto del payload son placeholders
// — se actualizan cuando Coelsa otorgue credenciales de integración.

import { Request, Response } from "express";
import crypto from "crypto";
import { simulateInboundPayment } from "../services/transferencias3.service";

// Valida la firma HMAC-SHA256 que Coelsa envía en el header x-coelsa-signature
function validateCoelsaSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// POST /webhooks/coelsa
export async function coelsaWebhookController(req: Request, res: Response) {
  const secret = process.env.COELSA_WEBHOOK_SECRET;

  // Si no hay secret configurado, logueamos y rechazamos
  if (!secret) {
    console.error("[Coelsa] COELSA_WEBHOOK_SECRET no configurado");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  // Validar firma HMAC
  const signature = req.headers["x-coelsa-signature"] as string;
  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const rawBody = JSON.stringify(req.body);
  const isValid = validateCoelsaSignature(rawBody, signature, secret);
  if (!isValid) {
    console.warn("[Coelsa] Firma inválida — request rechazado");
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Parsear payload
  const { amountArs, reference, payer } = req.body;

  if (!amountArs || !reference) {
    return res.status(400).json({ error: "amountArs and reference are required" });
  }

  try {
    const receipt = await simulateInboundPayment({
      amountArs: Number(amountArs),
      reference,
      payer: payer ?? "coelsa-webhook",
    });

    console.log(`[Coelsa] Pago acreditado: ${amountArs} ARS → ${receipt.settlement.stellarTxHash}`);
    return res.status(200).json({ received: true, receipt });
  } catch (err: any) {
    console.error(`[Coelsa] Error procesando pago: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}