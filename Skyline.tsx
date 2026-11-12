import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Glow} from './Glow';
import {litFn, rnd} from './utils';

type Layer = {par: number; col: string; minH: number; maxH: number; wMin: number; wMax: number; fog: number};
const LAYERS: Layer[] = [
  {par: 0.25, col: '#0a1120', minH: 380, maxH: 800, wMin: 80, wMax: 140, fog: 0.75},
  {par: 0.55, col: '#0d1627', minH: 300, maxH: 700, wMin: 90, wMax: 150, fog: 0.9},
  {par: 1.0, col: '#121c31', minH: 240, maxH: 620, wMin: 100, wMax: 170, fog: 1},
];

type B = {x: number; w: number; h: number; wins: {x: number; y: number; r: number; cool: boolean}[]};

function build(seed: string): B[][] {
  return LAYERS.map((L, li) => {
    const out: B[] = [];
    let x = -300;
    let i = 0;
    while (x < 1080 + 900) {
      const id = `${seed}-${li}-${i++}`;
      const w = L.wMin + rnd(id + 'w') * (L.wMax - L.wMin);
      const h = L.minH + rnd(id + 'h') * (L.maxH - L.minH);
      const cols = Math.max(1, Math.floor((w - 16) / 20));
      const rows = Math.floor((h - 30) / 30);
      const wins = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          wins.push({x: 10 + c * 20, y: 18 + r * 30, r: rnd(`${id}-${r}-${c}`), cool: rnd(`${id}-k${r}-${c}`) > 0.72});
        }
      }
      out.push({x, w, h, wins});
      x += w + 4 + rnd(id + 'g') * 10;
    }
    return out;
  });
}

/** Siluet gedung pencakar langit 3 lapis dengan paralaks. */
export const Skyline: React.FC<{
  baseY: number;
  panX: number;
  power: number; // 0..1
  seed?: string;
  moon?: number;
}> = ({baseY, panX, power, seed = 'sky', moon = 0.3}) => {
  const f = useCurrentFrame();
  const layers = useMemo(() => build(seed), [seed]);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {layers.map((bl, li) => {
        const L = LAYERS[li];
        return (
          <g key={li} transform={`translate(${-panX * L.par},0)`} opacity={L.fog}>
            {bl.map((b, bi) => {
              const top = baseY - b.h;
              return (
                <g key={bi}>
                  <rect x={b.x} y={top} width={b.w} height={b.h + 400} fill={L.col} />
                  {b.wins.map((w, wi) => {
                    const o = litFn(power, w.r);
                    if (o > 0.03) {
                      return (
                        <rect key={wi} x={b.x + w.x} y={top + w.y} width={9} height={13} fill={w.cool ? '#cfe6ff' : '#ffd49a'} opacity={o * 0.9} />
                      );
                    }
                    return li === 2 ? (
                      <rect key={wi} x={b.x + w.x} y={top + w.y} width={9} height={13} fill="#8fb0e8" opacity={0.04 + moon * 0.1} />
                    ) : null;
                  })}
                  {b.h > 640 ? (
                    <g>
                      <circle cx={b.x + b.w / 2} cy={top - 6} r={3.5} fill="#ff3b30" opacity={Math.sin(f * 0.18 + bi) > 0.2 ? 1 : 0.12} />
                      {Math.sin(f * 0.18 + bi) > 0.2 ? <Glow x={b.x + b.w / 2} y={top - 6} r={26} c="red" o={0.8} /> : null}
                    </g>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};
