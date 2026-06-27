// Servicio de MercadoPago — Checkout Pro
// Crea preferencias de pago y maneja webhooks IPN
// Docs: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preference = new Preference(client);
const payment = new Payment(client);

// Crear preferencia de pago para un split
export async function createMPPreference(params: {
  splitId: string;
  amount: number;
  description: string;
  payerEmail?: string;
}) {
  const result = await preference.create({
    body: {
      items: [
        {
          id: params.splitId,
          title: params.description,
          quantity: 1,
          unit_price: params.amount,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pay/${params.splitId}/success`,
        failure: `${process.env.FRONTEND_URL}/pay/${params.splitId}?error=mp_failure`,
        pending: `${process.env.FRONTEND_URL}/pay/${params.splitId}?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/webhooks/mp/${params.splitId}`,
      external_reference: params.splitId,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
    },
  });

  return result;
}

// Obtener datos de un pago de MP
export async function getMPPayment(paymentId: string) {
  return payment.get({ id: paymentId });
}