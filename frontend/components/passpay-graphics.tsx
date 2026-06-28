// Gráficos de marca Passpay recreados en SVG (nítidos, recoloreables).
// - 6 íconos del set (QR, CVU, swap dólar, liquidación on-chain, wallet, off-ramp)
// - Fondo de patrón de flechas (motivo del logo)

type IconProps = { size?: number; className?: string };
const MINT = "#16E0A3";

// Wrapper de ícono con glow, igual al estilo del set generado
export function IconTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <div
        className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#7C6CF7]"
        style={{ boxShadow: "0 0 26px rgba(91,75,245,.22)" }}
      >
        {children}
      </div>
      <span className="text-[11px] font-medium leading-tight text-slate-300">{label}</span>
    </div>
  );
}

export function QrIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round">
        <rect x="5" y="5" width="11" height="11" rx="2.5" />
        <rect x="24" y="5" width="11" height="11" rx="2.5" />
        <rect x="5" y="24" width="11" height="11" rx="2.5" />
      </g>
      <g fill="currentColor">
        <rect x="8.5" y="8.5" width="4" height="4" rx="1" />
        <rect x="27.5" y="8.5" width="4" height="4" rx="1" />
        <rect x="8.5" y="27.5" width="4" height="4" rx="1" />
      </g>
      <g fill={MINT}>
        <rect x="24" y="24" width="4.5" height="4.5" rx="1.2" />
        <rect x="30.5" y="24" width="4.5" height="4.5" rx="1.2" />
        <rect x="24" y="30.5" width="4.5" height="4.5" rx="1.2" />
        <rect x="30.5" y="30.5" width="4.5" height="4.5" rx="1.2" />
      </g>
    </svg>
  );
}

export function BankIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 16 L20 7 L34 16" />
        <line x1="6" y1="16" x2="34" y2="16" />
        <line x1="9.5" y1="16" x2="9.5" y2="29" />
        <line x1="15.5" y1="16" x2="15.5" y2="29" />
        <line x1="24.5" y1="16" x2="24.5" y2="29" />
        <line x1="30.5" y1="16" x2="30.5" y2="29" />
        <line x1="6" y1="33" x2="34" y2="33" />
      </g>
      <circle cx="20" cy="12.5" r="1.7" fill={MINT} />
    </svg>
  );
}

export function SwapIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <g fill="none" stroke={MINT} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 16.5 A11 11 0 0 1 28 12.5" />
        <path d="M28 8 L29 13 L24 13.6" />
        <path d="M29.5 23.5 A11 11 0 0 1 12 27.5" />
        <path d="M12 32 L11 27 L16 26.4" />
      </g>
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

export function ChainIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinejoin="round">
        <rect x="5" y="6" width="10" height="10" rx="2.5" />
        <rect x="16" y="17" width="10" height="10" rx="2.5" />
        <path d="M15 11 H18.5 A2.5 2.5 0 0 1 21 13.5 V17" strokeLinecap="round" />
      </g>
      <g fill="none" stroke={MINT} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="29.5" cy="29.5" r="7" />
        <path d="M26.3 29.7 L28.6 32 L33 27.5" />
      </g>
    </svg>
  );
}

export function WalletIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <rect x="6" y="11" width="28" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth={2.4} />
      <path d="M25 18 h9 v6 h-9 a3 3 0 0 1 0 -6 z" fill={MINT} fillOpacity={0.18} stroke={MINT} strokeWidth={2.2} strokeLinejoin="round" />
      <circle cx="28.6" cy="21" r="1.6" fill={MINT} />
    </svg>
  );
}

export function OffRampIcon({ size = 34, className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
      <g fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7 V23" stroke="currentColor" />
        <path d="M12 18 L20 26 L28 18" stroke={MINT} />
        <path d="M8 32 H32" stroke="currentColor" />
      </g>
    </svg>
  );
}

// Fondo: patrón de flechas (motivo del logo) + viñeta.
// absolute para cubrir TODA la altura del contenido (no sólo el viewport).
export function ArrowPatternBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0B0E14]">
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="pp-arrows" width="86" height="62" patternUnits="userSpaceOnUse">
            <g
              stroke="#5B4BF5"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.16"
            >
              <path d="M16 24 H46" />
              <path d="M40 18 L48 24 L40 30" />
              <path d="M50 38 H20" />
              <path d="M26 32 L18 38 L26 44" />
            </g>
          </pattern>
          <radialGradient id="pp-vignette" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#1a2138" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0B0E14" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pp-arrows)" />
        <rect width="100%" height="100%" fill="url(#pp-vignette)" />
      </svg>
    </div>
  );
}

// Set ordenado para iterar en "Cómo funciona"
export const PASSPAY_FEATURES = [
  { Icon: QrIcon, label: "QR Transferencias 3.0" },
  { Icon: BankIcon, label: "CVU recaudador" },
  { Icon: SwapIcon, label: "Convertí a dólar" },
  { Icon: ChainIcon, label: "Liquidación on-chain" },
  { Icon: WalletIcon, label: "Wallet Stellar" },
  { Icon: OffRampIcon, label: "Off-ramp a pesos" },
] as const;
