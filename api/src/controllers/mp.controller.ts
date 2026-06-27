import { Request, Response } from "express";
import { createMPPreference, getMPPayment } from "../services/mp.service";

// POST /mp/preference/:splitId — crea preferencia y devuelve init_point
export async function createMPPreferenceController(req: Request, res: Response) {
  const splitId = req.params.splitId as string;
  const { amount, description, payerEmail } = req.body;

  if (!amount || !description) {
    return res.status(400).json({ error: "amount and description are required" });
  }

  try {
    const result = await createMPPreference({
      splitId,
      amount: Number(amount),
      description,
      payerEmail,
    });

    return res.json({
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /webhooks/mp/:splitId — recibe notificación de MP
export async function mpWebhookController(req: Request, res: Response) {
  const splitId = req.params.splitId as string;
  const { type, data } = req.body;

  if (type === 'payment' && data?.id) {
    try {
      const payment = await getMPPayment(String(data.id));
      console.log(`[MP] Pago ${data.id} para split ${splitId}: ${payment.status}`);
      // TODO: si payment.status === 'approved' → registrar pago en el split
    } catch (err: any) {
      console.error(`[MP] Error procesando webhook: ${err.message}`);
    }
  }

  return res.sendStatus(200);
}