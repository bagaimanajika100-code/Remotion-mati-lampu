import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CityGrid} from './CityGrid';
import {Glow} from './Glow';
import {FONT} from './Overlays';
import {Shot} from './Shot';
import {clamp01, range, ramp} from './utils';

const PowerPlant: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = range(f, [0, 120], [1, 1.12]);
  const speed = Math.min(5, (f / 100) * 5); // derajat/frame, naik bertahap
  // Sudut = integral kecepatan: percepatan konstan sampai f=100, lalu kecepatan tetap 5 derajat/frame.
  const angle = f < 100 ? (f * f) / 40 : 250 + (f - 100) * 5;
  const freq = range(f, [8, 95], [42, 50]);
  const done = freq >= 49.9;
  const col = freq < 47 ? '#ff4d3d' : freq < 49.5 ? '#ffb020' : '#34d27b';
  const shakeX = Math.sin(f * 1.7) * 0.6 * clamp01(speed / 5);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(to bottom, #06080d, #0d131d)', transform: `scale(${zoom})`, transformOrigin: '540px 860px'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${shakeX},0)`}>
          <circle cx={540} cy={820} r={420} fill="url(#g-blue)" opacity={0.12 * clamp01(speed / 3)} />
          <circle cx={540} cy={820} r={360} fill="none" stroke="#1b2638" strokeWidth={38} />
          <circle cx={540} cy={820} r={300} fill="#0c1320" />
          {[0, 1, 2].map((blur) => (
            <g key={blur} transform={`rotate(${angle - blur * speed * 0.8} 540 820)`} opacity={blur === 0 ? 1 : 0.22 * clamp01(speed - 1.5)}>
              {Array.from({length: 12}).map((_, i) => (
                <line key={i} x1={540} y1={820} x2={540 + 292 * Math.cos((i * Math.PI) / 6)} y2={820 + 292 * Math.sin((i * Math.PI) / 6)} stroke="#2b3850" strokeWidth={14} strokeLinecap="round" />
              ))}
            </g>
          ))}
          <circle cx={540} cy={820} r={74} fill="#202c40" />
          <circle cx={540} cy={820} r={26} fill={col} opacity={0.9} />
          <Glow x={540} y={820} r={150} c={done ? 'green' : 'amber'} o={0.55 * clamp01(speed / 2)} />
          {Array.from({length: 24}).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x = 540 + 360 * Math.cos(a);
            const y = 820 + 360 * Math.sin(a);
            const on = f > 6 + i * 3;
            return (
              <g key={i}>
                {on ? <Glow x={x} y={y} r={30} c="green" o={0.8} /> : null}
                <circle cx={x} cy={y} r={9} fill={on ? '#34d27b' : '#16202f'} />
              </g>
            );
          })}
        </g>
      </svg>
      <div
        style={{
          position: 'absolute', top: 1260, left: 140, width: 800, height: 230, borderRadius: 26, fontFamily: FONT,
          background: 'rgba(3,6,12,0.82)', border: '2px solid rgba(255,255,255,0.12)', textAlign: 'center',
        }}
      >
        <div style={{color: 'rgba(255,255,255,0.65)', fontSize: 30, fontWeight: 600, letterSpacing: 5, marginTop: 22}}>FREKUENSI JARINGAN</div>
        <div style={{color: col, fontSize: 112, fontWeight: 800, lineHeight: 1.15, textShadow: `0 0 34px ${col}`}}>{freq.toFixed(1)} Hz</div>
      </div>
    </AbsoluteFill>
  );
};

const CityRestored: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CityGrid
      cam={{
        zoom: range(f, [0, 165], [2.6, 1.0]),
        tilt: range(f, [0, 165], [66, 55]),
        rot: range(f, [0, 165], [0, -3]),
        tx: 0,
        ty: range(f, [0, 165], [60, -60]),
      }}
      power={(d) => ramp(f, 5 + d * 95, 5 + d * 95 + 28)}
      traffic={ramp(f, 40, 150)}
      trafficSpeed={1}
      emergency={0.6}
      glow={ramp(f, 30, 120)}
      moon={0.3}
      stars={0.7 - 0.4 * ramp(f, 30, 140)}
    />
  );
};

/** ADEGAN 6 (51-60 dtk): pembangkit pulih, lampu kota menyala bertahap, zoom-out ke panorama. */
export const Scene6: React.FC = () => (
  <AbsoluteFill>
    <Shot from={0} duration={120} fade={0}>
      <PowerPlant />
    </Shot>
    <Shot from={105} duration={165} fade={15}>
      <CityRestored />
    </Shot>
  </AbsoluteFill>
);
