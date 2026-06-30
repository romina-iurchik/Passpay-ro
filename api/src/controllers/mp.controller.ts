
import { Request, Response } from "express";
import { createMPPreference, getMPPayment } from "../services/mp.service";
import { registerPaymentService } from "../services/payment.service";

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

      if (payment.status === 'approved') {
        const payerId = payment.payer?.email || payment.payer?.id?.toString() || `mp_${data.id}`;
        const originalAmount = payment.transaction_amount;

        if (!originalAmount) {
          console.error(`[MP] Pago ${data.id} aprobado pero sin transaction_amount`);
          return res.sendStatus(200);
        }

        try {
          await registerPaymentService(
            splitId,
            payerId,
            "MERCADO_PAGO",
            "ARS",
            originalAmount
          );
          console.log(`[MP] Pago ${data.id} registrado en split ${splitId}`);
        } catch (regErr: any) {
          console.error(`[MP] Error registrando pago en split: ${regErr.message}`);
        }
      }
    } catch (err: any) {
      console.error(`[MP] Error procesando webhook: ${err.message}`);
    }
  }

  return res.sendStatus(200);
}