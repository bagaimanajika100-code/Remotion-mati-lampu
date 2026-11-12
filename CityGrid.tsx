import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glow} from './Glow';
import {Sky} from './Sky';
import {clamp01, litFn, rnd} from './utils';

const N = 14; // jumlah blok per sisi
const BLOCK = 150;
const ST = 30; // lebar jalan
const PITCH = BLOCK + ST;
const SIZE = N * PITCH + ST;
const HALF = SIZE / 2;
const PERSPECTIVE = 2200;

type Win = {x: number; y: number; r: number; cool: boolean};
type Bld = {key: number; x: number; y: number; w: number; d: number; h: number; dist: number; wins: Win[]};
type Lamp = {x: number; y: number; dist: number; r: number};
type Car = {horiz: boolean; street: number; dir: number; off: number; speed: number};

const distFromCenter = (x: number, y: number): number => Math.hypot(x - HALF, y - HALF) / HALF;

function buildCity(): {blds: Bld[]; lamps: Lamp[]; cars: Car[]} {
  const blds: Bld[] = [];
  let key = 0;
  for (let bx = 0; bx < N; bx++) {
    for (let by = 0; by < N; by++) {
      const x0 = ST + bx * PITCH;
      const y0 = ST + by * PITCH;
      const cd = distFromCenter(x0 + BLOCK / 2, y0 + BLOCK / 2);
      const dt = clamp01(1 - cd / 0.5);
      for (let px = 0; px < 2; px++) {
        for (let py = 0; py < 2; py++) {
          const id = `b${bx}-${by}-${px}${py}`;
          const w = 58 + rnd(id + 'w') * 14;
          const d = 58 + rnd(id + 'd') * 14;
          const x = x0 + px * (BLOCK / 2) + (BLOCK / 2 - w) / 2;
          const y = y0 + py * (BLOCK / 2) + (BLOCK / 2 - d) / 2;
          const h = 12 + rnd(id + 'h') * 34 + dt * dt * rnd(id + 't') * 260 + dt * 60 * rnd(id + 'u');
          const wins: Win[] = [];
          if (h >= 70) {
            const cols = Math.floor((w - 6) / 14);
            const rows = Math.floor((h - 10) / 17);
            for (let ri = 0; ri < rows; ri++) {
              for (let ci = 0; ci < cols; ci++) {
                wins.push({
                  x: x + 5 + ci * 14,
                  y: y + d - h + 7 + ri * 17,
                  r: rnd(`${id}-${ri}-${ci}`),
                  cool: rnd(`${id}-c${ri}-${ci}`) > 0.7,
                });
              }
            }
          }
          blds.push({key: key++, x, y, w, d, h, dist: distFromCenter(x + w / 2, y + d / 2), wins});
        }
      }
    }
  }
  blds.sort((a, b) => a.y + a.d - (b.y + b.d));

  const lamps: Lamp[] = [];
  for (let k = 0; k <= N; k++) {
    const c = ST / 2 + k * PITCH;
    for (let p = 10; p < SIZE; p += 48) {
      const id = `l${k}-${p}`;
      if (rnd(id) < 0.85) lamps.push({x: p, y: c, dist: distFromCenter(p, c), r: rnd(id + 'r')});
      if (rnd(id + 'v') < 0.85) lamps.push({x: c, y: p, dist: distFromCenter(c, p), r: rnd(id + 'q')});
    }
  }

  const cars: Car[] = [];
  for (let i = 0; i < 70; i++) {
    cars.push({
      horiz: rnd(`ch${i}`) < 0.5,
      street: Math.floor(rnd(`cs${i}`) * (N + 1)),
      dir: rnd(`cd${i}`) < 0.5 ? 1 : -1,
      off: rnd(`co${i}`) * SIZE,
      speed: 0.8 + rnd(`cv${i}`) * 1.2,
    });
  }
  return {blds, lamps, cars};
}

const SITES = [
  {x: HALF - 190, y: HALF + 60},
  {x: HALF + 260, y: HALF - 180},
  {x: HALF + 40, y: HALF + 330},
];

export type GridCam = {zoom: number; tilt: number; rot: number; tx: number; ty: number};

/**
 * Kota dari udara. Bidang kota (SVG) diputar dengan CSS 3D sehingga kamera bisa
 * zoom, miring, dan berputar. `power(d)` mengembalikan daya listrik 0..1 untuk jarak
 * ternormalisasi d (0 = pusat kota, 1 = tepi), sehingga gelombang padam/pulih
 * bisa menyebar dari pusat ke tepi.
 */
export const CityGrid: React.FC<{
  cam: GridCam;
  power: (d: number) => number;
  traffic?: number; // 0..1 jumlah mobil
  trafficSpeed?: number; // piksel per frame (skala 1)
  emergency?: number; // 0..1 cahaya fasilitas vital (rumah sakit)
  glow?: number; // 0..1 cahaya kota di cakrawala
  moon?: number; // 0..1 cahaya bulan pada jendela gelap
  stars?: number;
}> = ({cam, power, traffic = 1, trafficSpeed = 1, emergency = 0, glow = 1, moon = 0.3, stars = 0.6}) => {
  const f = useCurrentFrame();
  const city = useMemo(buildCity, []);
  const rad = (cam.tilt * Math.PI) / 180;
  const yp = (-HALF + cam.ty) * cam.zoom;
  const horizonY = 960 + (yp * Math.cos(rad) * PERSPECTIVE) / (PERSPECTIVE - yp * Math.sin(rad));
  const streetCoords: number[] = [];
  for (let k = 0; k <= N; k++) streetCoords.push(k * PITCH);
  const visibleCars = Math.floor(city.cars.length * clamp01(traffic));

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#01030a'}}>
      <Sky glow={glow} stars={stars} horizon={horizonY} />
      <div style={{position: 'absolute', inset: 0, perspective: PERSPECTIVE, perspectiveOrigin: '50% 50%'}}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: SIZE,
            height: SIZE,
            marginLeft: -HALF,
            marginTop: -HALF,
            transform: `rotateX(${cam.tilt}deg) rotateZ(${cam.rot}deg) scale(${cam.zoom}) translate(${cam.tx}px, ${cam.ty}px)`,
          }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <rect width={SIZE} height={SIZE} fill="#05070d" />
            {streetCoords.map((c) => (
              <React.Fragment key={c}>
                <rect x={0} y={c} width={SIZE} height={ST} fill="#0a0e17" />
                <rect x={c} y={0} width={ST} height={SIZE} fill="#0a0e17" />
              </React.Fragment>
            ))}
            {city.cars.slice(0, visibleCars).map((car, i) => {
              const pos = (((car.off + car.dir * f * car.speed * trafficSpeed) % SIZE) + SIZE) % SIZE;
              const lane = ST / 2 + car.street * PITCH + car.dir * 5;
              const x = car.horiz ? pos : lane;
              const y = car.horiz ? lane : pos;
              return (
                <g key={i}>
                  <Glow x={x} y={y} r={9} c={car.dir > 0 ? 'white' : 'red'} o={0.55} />
                  <circle cx={x} cy={y} r={2.2} fill={car.dir > 0 ? '#f4f8ff' : '#ff5a4a'} />
                </g>
              );
            })}
            {city.lamps.map((l, i) => {
              const o = litFn(power(l.dist), l.r);
              if (o < 0.03) return null;
              return (
                <g key={i}>
                  <Glow x={l.x} y={l.y} r={11} c="warm" o={o * 0.5} />
                  <circle cx={l.x} cy={l.y} r={2.3} fill="#ffe2b0" opacity={o} />
                </g>
              );
            })}
            {city.blds.map((b) => {
              const p = power(b.dist);
              const top = b.y - b.h;
              return (
                <g key={b.key}>
                  <rect x={b.x} y={b.y + b.d - b.h} width={b.w} height={b.h} fill="#0d1423" />
                  <rect x={b.x} y={top} width={b.w} height={b.d} fill={p > 0.3 ? '#1b2437' : '#141b2b'} />
                  {b.wins.map((w, i) => {
                    const o = litFn(p, w.r);
                    return o > 0.03 ? (
                      <rect key={i} x={w.x} y={w.y} width={8} height={10} fill={w.cool ? '#cfe6ff' : '#ffd49a'} opacity={o * 0.92} />
                    ) : (
                      <rect key={i} x={w.x} y={w.y} width={8} height={10} fill="#8fb0e8" opacity={0.05 + moon * 0.12} />
                    );
                  })}
                  {b.h > 200 ? (
                    <g>
                      <circle cx={b.x + b.w / 2} cy={top + b.d / 2} r={3} fill="#ff3b30" opacity={Math.sin(f * 0.18 + b.key) > 0.2 ? 1 : 0.15} />
                      {Math.sin(f * 0.18 + b.key) > 0.2 ? <Glow x={b.x + b.w / 2} y={top + b.d / 2} r={16} c="red" o={0.8} /> : null}
                    </g>
                  ) : null}
                </g>
              );
            })}
            {emergency > 0.02
              ? SITES.map((s, i) => (
                  <g key={i}>
                    <Glow x={s.x} y={s.y} r={70} c="warm" o={emergency * 0.85} />
                    <rect x={s.x - 16} y={s.y - 11} width={32} height={22} fill="#ffe0aa" opacity={emergency} />
                  </g>
                ))
              : null}
          </svg>
        </div>
      </div>
      {/* kabut di cakrawala menyamarkan tepi bidang kota */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizonY - 120,
          height: 460,
          background:
            'linear-gradient(to bottom, rgba(6,12,28,0) 0%, rgba(8,16,36,0.9) 27%, rgba(8,16,36,0) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
