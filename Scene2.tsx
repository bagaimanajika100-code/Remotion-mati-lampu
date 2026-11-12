import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glow} from './Glow';
import {Sky} from './Sky';
import {Box, Cam, Car, FacadeWindows, Ground, Person, fog, proj, sc} from './World3D';
import {ramp, rnd} from './utils';

const CARS = [
  {x: 3.0, z0: 28, v: 0.062, color: '#1a2130', on: false},
  {x: 3.1, z0: 55, v: 0.07, color: '#231a1a', on: false},
  {x: 2.8, z0: 95, v: 0.05, color: '#182028', on: false},
  {x: 3.0, z0: 150, v: 0.06, color: '#1a2130', on: false},
  {x: -3.0, z0: 70, v: -0.09, color: '#1b2230', on: true},
  {x: -3.1, z0: 140, v: -0.08, color: '#222a38', on: true},
  {x: -2.9, z0: 210, v: -0.1, color: '#1a2130', on: true},
];
const PEOPLE = [
  {x: -8.0, z0: 20, v: 0.012, beam: 1},
  {x: 8.1, z0: 36, v: -0.008, beam: -1},
  {x: -8.4, z0: 58, v: 0.01, beam: 1},
  {x: 8.3, z0: 80, v: -0.01, beam: -1},
];

/** ADEGAN 2 (7-17 dtk): hari pertama. Level jalan, lalu naik ke aerial. */
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 185, 315);
  const camZ = f * 0.085 + k * 40;
  const cam: Cam = {x: 0, y: 1.7 + k * 58, z: camZ, f: 900, cx: 540, cy: 880 - k * 470};
  const shakeX = Math.sin(f * 0.07) * 1.6 * (1 - k);
  const shakeY = Math.cos(f * 0.09) * 1.2 * (1 - k);

  const buildings: React.ReactNode[] = [];
  for (let i = 38; i >= 0; i--) {
    for (const side of [1, -1]) {
      const zs = i * 20 + (side > 0 ? 0 : 7);
      const len = 16 + rnd(`bl${side}${i}`) * 3;
      if (zs + len < camZ + 1 || zs > camZ + 280) continue;
      const h = 14 + rnd(`bh${side}${i}`) * 48 + Math.min(70, zs * 0.14);
      const op = Math.max(0.1, fog(cam, zs, 330));
      buildings.push(
        <g key={`${side}-${i}`}>
          <Box c={cam} x0={side > 0 ? 10 : -26} x1={side > 0 ? 26 : -10} y0={0} y1={h} z0={zs} z1={zs + len} front="#0b1019" side="#0f1624" top="#161e2e" opacity={op} />
          <FacadeWindows
            c={cam}
            x={side > 0 ? 10 : -10}
            z0={zs}
            z1={zs + len}
            h={h}
            seed={`w${side}${i}`}
            lit={(r) => (r > 0.94 ? 0.7 + 0.3 * Math.sin(f * 0.3 + r * 90) : 0)}
            cols={4}
            floorH={3.4}
            opacity={op}
          />
        </g>
      );
    }
  }

  const furniture: React.ReactNode[] = [];
  for (let q = 11; q >= 0; q--) {
    const z = q * 24 + 6;
    if (z < camZ + 1 || z > camZ + 250) continue;
    for (const sx of [-6.5, 6.5]) {
      furniture.push(
        <g key={`p${q}${sx}`} opacity={Math.max(0.1, fog(cam, z, 300))}>
          <Box c={cam} x0={sx - 0.1} x1={sx + 0.1} y0={0} y1={7} z0={z} z1={z + 0.2} front="#10151f" side="#0b0f17" top="#10151f" />
          <Box c={cam} x0={sx - 0.5} x1={sx + 0.5} y0={7} y1={7.25} z0={z} z1={z + 0.6} front="#10151f" side="#0b0f17" top="#1a2231" />
        </g>
      );
    }
  }
  for (let q = 3; q >= 0; q--) {
    const tz = 50 + q * 80;
    if (tz < camZ + 1) continue;
    const s = sc(cam, tz);
    const op = Math.max(0.1, fog(cam, tz, 300));
    const flick = f < 70 && Math.sin(f * 1.3) > 0.6;
    const lamp = proj(cam, -3, 5.35, tz);
    furniture.push(
      <g key={`t${q}`} opacity={op}>
        <Box c={cam} x0={-6.6} x1={-6.4} y0={0} y1={6} z0={tz} z1={tz + 0.2} front="#10151f" side="#0b0f17" top="#10151f" />
        <Box c={cam} x0={-6.6} x1={-2.2} y0={5.8} y1={6} z0={tz} z1={tz + 0.2} front="#10151f" side="#0b0f17" top="#10151f" />
        <Box c={cam} x0={-3.2} x1={-2.8} y0={4.8} y1={5.8} z0={tz} z1={tz + 0.3} front="#06080c" side="#06080c" top="#10151f" />
        {lamp
          ? [0.3, 0, -0.3].map((dy, i) => (
              <circle key={i} cx={lamp[0]} cy={lamp[1] - dy * s * 1.0} r={0.09 * s} fill={flick && i === 1 ? '#ffb020' : '#10151c'} />
            ))
          : null}
        {lamp && flick ? <Glow x={lamp[0]} y={lamp[1]} r={0.8 * s} c="amber" o={0.7} /> : null}
      </g>
    );
  }

  const dashes: React.ReactNode[] = [];
  for (let zz = Math.floor(camZ / 8) * 8; zz < camZ + 300; zz += 8) {
    dashes.push(<Ground key={zz} c={cam} x0={-0.12} x1={0.12} z0={zz} z1={zz + 3.5} fill="#7b8498" opacity={0.5 * fog(cam, zz, 320)} />);
  }

  const cars = CARS.map((c, i) => ({...c, z: c.z0 + c.v * f, i})).sort((a, b) => b.z - a.z);

  return (
    <AbsoluteFill>
      <Sky glow={0.08} stars={1} horizon={cam.cy} moon moonX={800} moonY={Math.max(140, cam.cy - 560)} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, transform: `translate(${shakeX}px, ${shakeY}px)`}}>
        <rect x={0} y={cam.cy} width={1080} height={Math.max(0, 1920 - cam.cy)} fill="#05070c" />
        <Ground c={cam} x0={-6} x1={6} z0={camZ} z1={camZ + 420} fill="#0b0f17" />
        <Ground c={cam} x0={-10} x1={-6} z0={camZ} z1={camZ + 420} fill="#10151f" />
        <Ground c={cam} x0={6} x1={10} z0={camZ} z1={camZ + 420} fill="#10151f" />
        <Ground c={cam} x0={-5.9} x1={-5.75} z0={camZ} z1={camZ + 420} fill="#59627a" opacity={0.4} />
        <Ground c={cam} x0={5.75} x1={5.9} z0={camZ} z1={camZ + 420} fill="#59627a" opacity={0.4} />
        {dashes}
        {buildings}
        {furniture}
        {cars.map((c) => (
          <Car key={c.i} c={cam} x={c.x} z={c.z} oncoming={c.on} color={c.color} />
        ))}
        {PEOPLE.map((p, i) => (
          <Person key={i} c={cam} x={p.x} z={p.z0 + p.v * f} beam={p.beam} torch={0.75 + 0.25 * Math.sin(f * 0.15 + i)} />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(8,16,36,0) ${cam.cy - 150}px, rgba(8,16,36,0.55) ${cam.cy}px, rgba(8,16,36,0) ${cam.cy + 260}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
