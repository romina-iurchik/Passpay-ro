'use client';

import { useEffect, useState } from 'react';

/**
 * Splash de bienvenida: muestra la portada (public/passpay-cover.png) unos segundos
 * al entrar y luego hace fade al contenido. Tocar la pantalla lo saltea.
 * Si la imagen no está guardada todavía, muestra un fallback con logo + tagline.
 */
export default function SplashScreen({ duration = 3000 }: { duration?: number }) {
  const [phase, setPhase] = useState<'show' | 'hide' | 'gone'>('show');
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hide'), duration);
    const t2 = setTimeout(() => setPhase('gone'), duration + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration]);

  if (phase === 'gone') return null;

  return (
    <div
      onClick={() => setPhase('hide')}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === 'hide' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'radial-gradient(circle at 50% 42%, #141a2e 0%, #0B0E14 72%)' }}
    >
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/passpay-cover.png"
          alt="Passpay — Cobrá en pesos. Ahorrá en dólares."
          onError={() => setImgOk(false)}
          className="w-full max-w-3xl px-4 object-contain animate-[fadeInUp_0.6s_ease-out]"
        />
      ) : (
        <div className="text-center px-8 animate-[fadeInUp_0.6s_ease-out]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/passpay-logo.svg" alt="Passpay" className="w-56 mx-auto mb-8 drop-shadow-lg" />
          <h1 className="text-3xl font-black text-white leading-tight">
            Cobrá en pesos.
            <br />
            <span className="text-gradient">Ahorrá en dólares.</span>
          </h1>
          <p className="text-slate-400 mt-3">
            Simple. Rápido. <span className="text-[#16E0A3]">En Stellar.</span>
          </p>
        </div>
      )}

      {/* barra de progreso sincronizada con la duración */}
      <div className="absolute bottom-12 w-40 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#5B4BF5] to-[#16E0A3]"
          style={{ animation: `splashbar ${duration}ms linear forwards` }}
        />
      </div>
      <p className="absolute bottom-5 text-[11px] text-slate-600">tocá para entrar</p>
    </div>
  );
}
