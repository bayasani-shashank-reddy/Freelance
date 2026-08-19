/**
 * NcxCredit — NexusCraft's branded virtual digital credit token.
 * Usage:
 *   <NcxCoinIcon size="sm" />                   → just the coin image
 *   <NcxCreditBadge amount={500} />              → inline "NCX 500" badge
 *   <NcxCreditPill amount={500} />               → full pill with coin + label
 *   <NcxCreditCard amount={500} label="..." />   → premium card widget
 */

import React from 'react';
import ncxCoin from '../assets/ncx_coin.jpg';

// ─── Size map ────────────────────────────────────────────────────────────────
const SIZES = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
};

type CoinSize = keyof typeof SIZES;

// ─── Coin image only ─────────────────────────────────────────────────────────
export const NcxCoinIcon: React.FC<{ size?: CoinSize; className?: string; spinning?: boolean }> = ({
  size = 'sm',
  className = '',
  spinning = false,
}) => (
  <img
    src={ncxCoin}
    alt="NCX Token"
    className={`${SIZES[size]} rounded-full object-cover drop-shadow-[0_0_6px_rgba(139,92,246,0.7)] ${
      spinning ? 'animate-spin' : ''
    } ${className}`}
  />
);

// ─── Inline badge: coin + "NCX 500" ──────────────────────────────────────────
export const NcxCreditBadge: React.FC<{
  amount: number | string;
  size?: CoinSize;
  className?: string;
  dimmed?: boolean;
}> = ({ amount, size = 'sm', className = '', dimmed = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-mono font-extrabold tracking-tight ${
      dimmed ? 'opacity-60' : ''
    } ${className}`}
  >
    <NcxCoinIcon size={size} />
    <span
      className="bg-clip-text text-transparent"
      style={{ backgroundImage: 'linear-gradient(to right, #818cf8, #a78bfa, #22d3ee)' }}
    >
      NCX {typeof amount === 'number' ? amount.toLocaleString() : amount}
    </span>
  </span>
);

// ─── Pill: compact rounded tag ────────────────────────────────────────────────
export const NcxCreditPill: React.FC<{
  amount: number | string;
  label?: string;
  variant?: 'default' | 'success' | 'danger' | 'muted';
}> = ({ amount, label, variant = 'default' }) => {
  const variants = {
    default:
      'bg-indigo-500/15 border-indigo-500/30 text-indigo-200',
    success:
      'bg-emerald-500/15 border-emerald-500/30 text-emerald-200',
    danger:
      'bg-rose-500/15 border-rose-500/30 text-rose-200',
    muted:
      'bg-slate-800/60 border-slate-700 text-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold ${variants[variant]}`}
    >
      <NcxCoinIcon size="xs" />
      NCX {typeof amount === 'number' ? amount.toLocaleString() : amount}
      {label && <span className="opacity-70 font-normal">{label}</span>}
    </span>
  );
};

// ─── Full card widget ─────────────────────────────────────────────────────────
export const NcxCreditCard: React.FC<{
  amount: number;
  label?: string;
  subtitle?: string;
  className?: string;
}> = ({ amount, label = 'Available Balance', subtitle, className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-5 border border-indigo-500/30 bg-slate-900/90 ${className}`}
    style={{
      background:
        'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(34,211,238,0.10) 100%)',
    }}
  >
    {/* Glow orb */}
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
    <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

    <div className="relative flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <NcxCoinIcon size="md" />
          <div>
            <span
              className="text-2xl font-black tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #818cf8, #a78bfa, #22d3ee)' }}
            >
              NCX {amount.toLocaleString()}
            </span>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">NexusCraft Credits</p>
          </div>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{subtitle}</p>}
      </div>

      {/* Watermark brand coin */}
      <img
        src={ncxCoin}
        alt=""
        aria-hidden
        className="w-14 h-14 rounded-full object-cover opacity-30 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]"
      />
    </div>

    {/* Bottom brand label */}
    <div className="mt-4 pt-3 border-t border-indigo-500/15 flex items-center gap-1.5">
      <div className="w-4 h-4 rounded bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px]">
        <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
          <span className="text-[5px] text-cyan-400 font-black leading-none">✦</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-slate-500">
        NEXUS<span className="text-indigo-400">CRAFT</span> · Virtual Credits · Non-transferable
      </span>
    </div>
  </div>
);

// ─── Cost tag: "Costs NCX 50" ─────────────────────────────────────────────────
export const NcxCostTag: React.FC<{ amount: number; label?: string }> = ({
  amount,
  label = 'per submission',
}) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
    <NcxCoinIcon size="xs" />
    NCX {amount.toLocaleString()} {label}
  </span>
);

// ─── Deduction row ────────────────────────────────────────────────────────────
export const NcxDeductionRow: React.FC<{
  label: string;
  amount: number;
  variant?: 'deduct' | 'reward';
}> = ({ label, amount, variant = 'deduct' }) => (
  <div className="flex items-center justify-between text-xs font-mono">
    <span className="text-slate-400">{label}</span>
    <span
      className={`font-extrabold flex items-center gap-1 ${
        variant === 'deduct' ? 'text-rose-400' : 'text-emerald-400'
      }`}
    >
      <NcxCoinIcon size="xs" />
      {variant === 'deduct' ? '−' : '+'}NCX {amount.toLocaleString()}
    </span>
  </div>
);
