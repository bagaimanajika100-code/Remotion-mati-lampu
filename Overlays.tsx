import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CAPTIONS} from './config';
import {FPS, HOURS_KEYS, HOURS_VALUES} from './timeline';
import {clamp01} from './utils';

export const FONT = '"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif';

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.1, pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Penghitung hari/jam sejak pemadaman, mengikuti timeline global. */
export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const hours = interpolate(t, HOURS_KEYS, HOURS_VALUES, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const appear = clamp01((t - 4.7) / 0.6);
  const restored = t >= 51.5;
  const day = Math.min(7, Math.floor(hours / 24) + 1);
  const accent = restored ? '#34d27b' : '#ff4d3d';
  const segW = (960 - 6 * 8) / 7;
  return (
    <AbsoluteFill style={{opacity: appear, pointerEvents: 'none', fontFamily: FONT}}>
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, color: accent, fontSize: 30, fontWeight: 700, letterSpacing: 5}}>
          <div style={{width: 18, height: 18, borderRadius: 9, background: accent, boxShadow: `0 0 18px ${accent}`}} />
          {restored ? 'LISTRIK PULIH' : 'PEMADAMAN TOTAL'}
        </div>
        <div style={{color: '#fff', fontSize: 104, fontWeight: 800, lineHeight: 1.05, marginTop: 8}}>
          {restored ? '168 JAM' : `HARI ${day}`}
        </div>
        <div style={{color: 'rgba(255,255,255,0.78)', fontSize: 32, fontWeight: 500, marginTop: 2}}>
          {restored ? 'berlalu sejak padam' : `${Math.floor(hours)} jam tanpa listrik`}
        </div>
        <div style={{display: 'flex', gap: 8, marginTop: 22}}>
          {Array.from({length: 7}).map((_, i) => {
            const fill = restored ? 1 : clamp01(hours / 24 - i);
            return (
              <div key={i} style={{width: segW, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
                <div style={{width: `${fill * 100}%`, height: '100%', background: accent}} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = CAPTIONS.find((x) => t >= x.from && t <= x.to);
  if (!c) return null;
  const o = clamp01((t - c.from) / 0.4) * clamp01((c.to - t) / 0.4);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          bottom: 330,
          opacity: o,
          transform: `translateY(${(1 - o) * 16}px)`,
          textAlign: 'center',
          color: '#fff',
          fontSize: 46,
          fontWeight: 650,
          lineHeight: 1.25,
          padding: '22px 30px',
          borderRadius: 22,
          background: 'rgba(3,6,14,0.55)',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};
