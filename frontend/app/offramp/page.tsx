'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Wallet, DollarSign, RefreshCw } from 'lucide-react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { SwkAppDarkTheme } from '@creit-tech/stellar-wallets-kit/types';
import { api } from '@/lib/api';

type TargetCurrency = 'ARS' | 'BRL' | 'COP';

const CURRENCY_LABELS: Record<TargetCurrency, { label: string; flag: string; rail: string }> = {
  ARS: { label: 'Peso Argentino', flag: '🇦🇷', rail: 'CVU / Transferencias 3.0' },
  BRL: { label: 'Real Brasileño', flag: '🇧🇷', rail: 'PIX' },
  COP: { label: 'Peso Colombiano', flag: '🇨🇴', rail: 'PSE / Bre-B' },
};

type Step = 'quote' | 'authorize' | 'done';

interface Quote {
  id: string;
  source_currency: string;
  target_currency: string;
  source_amount: number;
  target_amount: number;
  exchange_rate: number;
  expires_at: string;
  fee?: number;
}

interface Receipt {
  id: string;
  status: string;
  source_amount: number;
  target_amount: number;
  target_currency: string;
  created_at: string;
}

export default function OfframpPage() {
  const [step, setStep] = useState<Step>('quote');

  // Form state
  const [usdcAmount, setUsdcAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState<TargetCurrency>('ARS');
  const [receiverId, setReceiverId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');

  // Flow state
  const [quote, setQuote] = useState<Quote | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGetQuote() {
    setError(null);
    const amount = parseFloat(usdcAmount);
    if (!amount || amount <= 0) return setError('Ingresá un monto válido en USDC');
    if (!receiverId.trim()) return setError('Ingresá el ID del destinatario (BlindPay customer ID)');
    if (!bankAccountId.trim()) return setError('Ingresá el ID de la cuenta bancaria');

    setLoading(true);
    try {
      const q = await api.blindpay.quote({
        amount,
        target_currency: targetCurrency,
        receiver_id: receiverId.trim(),
        bank_account_id: bankAccountId.trim(),
      });
      setQuote(q);
      setStep('authorize');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthorizeAndSign() {
    if (!quote) return;
    setError(null);
    setLoading(true);

    try {
      // 1. Conectar wallet y obtener dirección
      StellarWalletsKit.init({ modules: defaultModules(), theme: SwkAppDarkTheme });
      const { address } = await StellarWalletsKit.authModal();
      setWalletAddress(address);

      // 2. Autorizar con BlindPay → obtener XDR sin firmar
      const authResult = await api.blindpay.authorize({
        quote_id: quote.id,
        sender_wallet_address: address,
      });

      // BlindPay puede devolver el XDR en distintos campos según versión
      const unsignedXdr = authResult.xdr ?? authResult.unsigned_xdr ?? authResult.transaction_hash;
      if (!unsignedXdr) throw new Error('BlindPay no devolvió un XDR para firmar');

      // 3. Firmar con la wallet del usuario
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
        address,
      });

      // 4. Enviar payout a BlindPay con el XDR firmado
      const payoutResult = await api.blindpay.payout({
        quote_id: quote.id,
        signed_transaction: signedTxXdr,
        sender_wallet_address: address,
      });

      setReceipt(payoutResult);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
        <Link href="/" className="inline-flex p-2 rounded-lg hover:bg-slate-700/50 transition-colors mb-4">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center mb-6">
          <Image src="/passpay-logo.svg" alt="Passpay" width={180} height={56} priority className="w-auto h-auto max-w-xs mx-auto" />
          <p className="text-slate-400 text-sm mt-2">Off-ramp USDC → fiat local · BlindPay</p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(['quote', 'authorize', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === s ? 'bg-[#5B4BF5] text-white scale-110' :
                  (['quote', 'authorize', 'done'].indexOf(step) > i) ? 'bg-[#16E0A3] text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                {(['quote', 'authorize', 'done'].indexOf(step) > i) ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${(['quote', 'authorize', 'done'].indexOf(step) > i) ? 'bg-[#16E0A3]' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* PASO 1 — Cotización */}
          {step === 'quote' && (
            <motion.div key="quote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold text-center mb-4">¿Cuánto querés retirar?</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Monto en USDC</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={usdcAmount}
                      onChange={e => setUsdcAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#5B4BF5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Moneda de destino</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(CURRENCY_LABELS) as [TargetCurrency, typeof CURRENCY_LABELS.ARS][]).map(([code, { flag, rail }]) => (
                      <button
                        key={code}
                        onClick={() => setTargetCurrency(code)}
                        className={`p-3 rounded-xl border text-center transition-all ${targetCurrency === code
                          ? 'border-[#5B4BF5] bg-[#5B4BF5]/10 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'}`}
                      >
                        <div className="text-xl mb-1">{flag}</div>
                        <div className="text-xs font-bold">{code}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{rail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">BlindPay Customer ID (destinatario)</label>
                  <input
                    type="text"
                    placeholder="cust_..."
                    value={receiverId}
                    onChange={e => setReceiverId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#5B4BF5] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">BlindPay Bank Account ID</label>
                  <input
                    type="text"
                    placeholder="ba_..."
                    value={bankAccountId}
                    onChange={e => setBankAccountId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#5B4BF5] font-mono text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Obtené estos IDs desde el panel de BlindPay o via <code className="text-slate-400">GET /blindpay/customers</code>
                  </p>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

              <button
                onClick={handleGetQuote}
                disabled={loading}
                className="w-full h-14 rounded-xl font-semibold bg-gradient-to-r from-[#5B4BF5] to-[#3D2FD6] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Obtener cotización</>}
              </button>
            </motion.div>
          )}

          {/* PASO 2 — Confirmar y firmar */}
          {step === 'authorize' && quote && (
            <motion.div key="authorize" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <h2 className="text-xl font-bold text-center">Confirmá y firmá</h2>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Enviás</span>
                  <span className="font-bold text-lg">{quote.source_amount} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Recibís</span>
                  <span className="font-bold text-lg text-[#16E0A3]">
                    {quote.target_amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {quote.target_currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Tasa</span>
                  <span className="text-slate-300 text-sm">1 USDC = {quote.exchange_rate.toLocaleString('es-AR')} {quote.target_currency}</span>
                </div>
                {quote.fee !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Fee</span>
                    <span className="text-slate-300 text-sm">{quote.fee} USDC</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Rail</span>
                  <span className="text-slate-300 text-sm">{CURRENCY_LABELS[quote.target_currency as TargetCurrency]?.rail ?? quote.target_currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Cotización válida hasta</span>
                  <span className="text-slate-300 text-xs">{new Date(quote.expires_at).toLocaleTimeString('es-AR')}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm text-center">
                Tu wallet firmará una transacción Stellar que envía {quote.source_amount} USDC a BlindPay.<br />
                BlindPay acredita {quote.target_currency} en la cuenta bancaria del destinatario.
              </p>

              {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('quote'); setError(null); }}
                  className="flex-1 h-14 rounded-xl font-semibold border border-slate-600 hover:border-slate-400 text-slate-300 transition-all"
                >
                  Volver
                </button>
                <button
                  onClick={handleAuthorizeAndSign}
                  disabled={loading}
                  className="flex-1 h-14 rounded-xl font-semibold bg-gradient-to-r from-[#5B4BF5] to-[#3D2FD6] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Wallet className="w-5 h-5" /> Conectar y firmar</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 3 — Recibo */}
          {step === 'done' && receipt && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                <CheckCircle className="w-20 h-20 text-[#16E0A3] mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold">¡Payout iniciado!</h2>
              <p className="text-slate-400 text-sm">BlindPay está procesando la transferencia a la cuenta bancaria del destinatario.</p>

              <div className="bg-slate-800/50 border border-[#16E0A3]/30 rounded-2xl p-5 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Payout ID</span>
                  <span className="font-mono text-xs text-slate-300 truncate max-w-[180px]">{receipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Estado</span>
                  <span className="text-[#16E0A3] font-semibold text-sm capitalize">{receipt.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Enviado</span>
                  <span className="text-slate-300 text-sm">{receipt.source_amount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Recibirá</span>
                  <span className="text-[#16E0A3] font-bold">
                    {receipt.target_amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {receipt.target_currency}
                  </span>
                </div>
                {walletAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Desde wallet</span>
                    <span className="font-mono text-xs text-slate-400">{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('quote'); setQuote(null); setReceipt(null); setError(null); setUsdcAmount(''); }}
                  className="flex-1 h-12 rounded-xl border border-slate-600 hover:border-[#5B4BF5] text-slate-300 hover:text-white transition-all text-sm font-medium"
                >
                  Nuevo off-ramp
                </button>
                <Link href="/" className="flex-1 h-12 rounded-xl bg-[#5B4BF5]/20 border border-[#5B4BF5]/40 hover:bg-[#5B4BF5]/30 text-[#8B7CF8] flex items-center justify-center text-sm font-medium transition-all">
                  Inicio
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-xs text-slate-600 mt-8">Off-ramp powered by BlindPay · Stellar USDC</p>
      </div>
    </div>
  );
}
