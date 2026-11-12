import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CityGrid} from './CityGrid';
import {Glow} from './Glow';
import {Shot} from './Shot';
import {Sky} from './Sky';
import {Box, Cam, Ground, Person, Tank, fog, proj, sc} from './World3D';
import {range} from './utils';

const NightAerial: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <CityGrid
      cam={{
        zoom: range(f, [0, 200], [1.15, 1.0]),
        tilt: range(f, [0, 200], [66, 60]),
        rot: range(f, [0, 200], [4, -2]),
        tx: range(f, [0, 200], [60, -40]),
        ty: range(f, [0, 200], [-260, -40]),
      }}
      power={() => 0}
      traffic={0.12}
      trafficSpeed={0.35}
      emergency={0.9 + 0.1 * Math.sin(f * 0.2)}
      glow={0}
      moon={0.5}
      stars={1}
    />
  );
};

const Industry: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = {x: 0, y: 2.4 + f * 0.004, z: f * 0.05, f: 900, cx: 540, cy: 880};
  const dashes: React.ReactNode[] = [];
  for (let z = Math.floor(cam.z / 8) * 8; z < cam.z + 260; z += 8) {
    dashes.push(<Ground key={z} c={cam} x0={-0.12} x1={0.12} z0={z} z1={z + 3.5} fill="#7b8498" opacity={0.4 * fog(cam, z, 300)} />);
  }
  const warehouses: React.ReactNode[] = [];
  for (let i = 8; i >= 0; i--) {
    const z = 10 + i * 34;
    if (z + 28 < cam.z + 1) continue;
    warehouses.push(
      <g key={i} opacity={Math.max(0.15, fog(cam, z, 320))}>
        <Box c={cam} x0={12} x1={42} y0={0} y1={9 + (i % 3) * 2} z0={z} z1={z + 28} front="#0d1320" side="#111a29" top="#182133" />
        <Box c={cam} x0={11.9} x1={12.1} y0={0} y1={4} z0={z + 8} z1={z + 14} front="#06080c" side="#06080c" top="#06080c" />
      </g>
    );
  }
  const tanks = [
    {x: -16, z: 34, r: 5, h: 10}, {x: -17, z: 62, r: 5.5, h: 11}, {x: -16, z: 92, r: 5, h: 9}, {x: -19, z: 130, r: 6, h: 12},
  ];
  const trucks = [14, 31, 48, 65].map((z, i) => ({z: z + Math.sin(f * 0.02 + i) * 0.1, i}));
  const floods = [0, 1, 2, 3, 4, 5].map((q) => ({z: 20 + q * 36, on: q === 1 || q === 4}));
  const chimTop = proj(cam, -30, 55, 120);
  const beacon = Math.sin(f * 0.18) > 0.2;
  return (
    <AbsoluteFill>
      <Sky glow={0.02} stars={1} horizon={cam.cy} moon moonX={250} moonY={300} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={cam.cy} width={1080} height={1920 - cam.cy} fill="#05070c" />
        <Ground c={cam} x0={-6} x1={6} z0={cam.z} z1={cam.z + 360} fill="#090c12" />
        <Ground c={cam} x0={-6.2} x1={-5.9} z0={cam.z} z1={cam.z + 360} fill="#59627a" opacity={0.35} />
        <Ground c={cam} x0={5.9} x1={6.2} z0={cam.z} z1={cam.z + 360} fill="#59627a" opacity={0.35} />
        {dashes}
        {warehouses}
        {tanks.map((t, i) => (
          <Tank key={i} c={cam} x={t.x} z={t.z} r={t.r} h={t.h} />
        ))}
        <Tank c={cam} x={-30} z={120} r={1.8} h={55} body="#10161f" cap="#161e2b" />
        {chimTop && beacon ? <Glow x={chimTop[0]} y={chimTop[1]} r={50} c="red" o={0.9} /> : null}
        {floods.map((fl, i) => {
          const p = proj(cam, -8, 8, fl.z);
          if (!p || fl.z < cam.z + 2) return null;
          return (
            <g key={i}>
              <Box c={cam} x0={-8.1} x1={-7.9} y0={0} y1={8} z0={fl.z} z1={fl.z + 0.2} front="#10151f" side="#0b0f17" top="#10151f" />
              {fl.on ? <Glow x={p[0]} y={p[1]} r={2.6 * sc(cam, fl.z)} c="warm" o={0.45} /> : null}
            </g>
          );
        })}
        {[...trucks].reverse().map((t) => {
          if (t.z + 12 < cam.z + 1) return null;
          const s = sc(cam, Math.max(t.z, cam.z + 1));
          const l = proj(cam, 1.35, 0.9, t.z);
          const r = proj(cam, 3.65, 0.9, t.z);
          const hz = Math.sin(f * 0.35 + t.i * 1.7) > 0;
          return (
            <g key={t.i} opacity={Math.max(0.2, fog(cam, t.z, 300))}>
              <Box c={cam} x0={1.2} x1={3.8} y0={0.6} y1={4.1} z0={t.z} z1={t.z + 9} front="#161d2b" side="#10161f" top="#1c2536" />
              <Box c={cam} x0={1.3} x1={3.7} y0={0.4} y1={3.2} z0={t.z + 9.3} z1={t.z + 12} front="#1b2330" side="#10161f" top="#222c3d" />
              {l && r
                ? [l, r].map((p, i) => (
                    <g key={i}>
                      <Glow x={p[0]} y={p[1]} r={0.8 * s} c={hz ? 'amber' : 'red'} o={0.75} />
                      <circle cx={p[0]} cy={p[1]} r={0.12 * s} fill={hz ? '#ffb020' : '#ff4a3a'} />
                    </g>
                  ))
                : null}
            </g>
          );
        })}
        <Person c={cam} x={9} z={40} beam={-1} torch={0.8} />
        <Person c={cam} x={-8.5} z={24} beam={1} torch={0.7} />
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(8,16,36,0) 730px, rgba(8,16,36,0.55) 880px, rgba(8,16,36,0) 1140px)'}} />
    </AbsoluteFill>
  );
};

/** ADEGAN 5 (39-51 dtk): hari keenam dan ketujuh. Kota sepi dari udara, industri dan distribusi tersendat. */
export const Scene5: React.FC = () => (
  <AbsoluteFill>
    <Shot from={0} duration={205} fade={0}>
      <NightAerial />
    </Shot>
    <Shot from={195} duration={180} fade={14}>
      <Industry />
    </Shot>
  </AbsoluteFill>
);
