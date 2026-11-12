import React from 'react';

export const GLOW_COLORS = {
  warm: '#ffcf8a',
  red: '#ff3b2f',
  white: '#e8f2ff',
  amber: '#ffb020',
  blue: '#4aa3ff',
  green: '#34d27b',
} as const;

export type GlowColor = keyof typeof GLOW_COLORS;

/** Definisi gradien cahaya. Dipasang satu kali di MatiLampu.tsx dan dipakai semua adegan. */
export const GlowDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {(Object.keys(GLOW_COLORS) as GlowColor[]).map((k) => (
        <radialGradient id={`g-${k}`} key={k}>
          <stop offset="0%" stopColor={GLOW_COLORS[k]} stopOpacity={1} />
          <stop offset="35%" stopColor={GLOW_COLORS[k]} stopOpacity={0.35} />
          <stop offset="100%" stopColor={GLOW_COLORS[k]} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
  </svg>
);

export const Glow: React.FC<{
  x: number;
  y: number;
  r: number;
  c?: GlowColor;
  o?: number;
}> = ({x, y, r, c = 'warm', o = 1}) => {
  if (r < 0.5 || o <= 0.01) return null;
  return <circle cx={x} cy={y} r={r} fill={`url(#g-${c})`} opacity={o} />;
};
