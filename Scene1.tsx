import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CityGrid} from './CityGrid';
import {FONT} from './Overlays';
import {BLACKOUT_FRAME as CUT} from './timeline';
import {clamp01, range, ramp} from './utils';

/** ADEGAN 1 (0-7 dtk): kota besar terang, lalu seluruh lampu padam serentak. */
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const cam = {
    zoom: range(f, [0, 225], [0.95, 1.5]),
    tilt: range(f, [0, 225], [62, 54]),
    rot: range(f, [0, 225], [0, -5]),
    tx: 0,
    ty: range(f, [0, 225], [-120, 60]),
  };
  // Brownout singkat sebelum padam, lalu gelombang padam menyebar dari pusat ke tepi.
  const power = (d: number): number => {
    const pre = f < CUT - 18 ? 1 : f < CUT ? 0.6 + 0.4 * Math.abs(Math.sin(f * 1.9)) : 1;
    return pre * (1 - ramp(f, CUT + d * 14, CUT + d * 14 + 5));
  };
  const after = ramp(f, CUT, CUT + 30);
  const titleOp = clamp01((f - 8) / 30) * clamp01((125 - f) / 25);

  return (
    <AbsoluteFill>
      <CityGrid
        cam={cam}
        power={power}
        traffic={1 - 0.7 * after}
        trafficSpeed={1 - 0.6 * after}
        emergency={ramp(f, CUT + 30, CUT + 60)}
        glow={1 - ramp(f, CUT, CUT + 25)}
        moon={0.15 + 0.35 * after}
        stars={0.25 + 0.6 * after}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          paddingTop: 520,
          fontFamily: FONT,
          opacity: titleOp,
          transform: `translateY(${(1 - titleOp) * 24}px)`,
        }}
      >
        <svg width={110} height={150} viewBox="0 0 24 32" style={{filter: 'drop-shadow(0 0 22px rgba(255,200,40,0.9))'}}>
          <polygon points="14,0 3,18 11,18 8,32 21,12 13,12" fill="#ffd23c" />
        </svg>
        <div style={{color: '#fff', fontSize: 74, fontWeight: 800, letterSpacing: 4, marginTop: 18, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
          BAGAIMANA JIKA
        </div>
        <div style={{color: '#ffd23c', fontSize: 168, fontWeight: 900, lineHeight: 1, textShadow: '0 0 40px rgba(255,190,40,0.6), 0 6px 24px rgba(0,0,0,0.9)'}}>
          MATI LAMPU
        </div>
        <div style={{color: '#fff', fontSize: 74, fontWeight: 800, letterSpacing: 3, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
          SELAMA 1 MINGGU?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
