import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glow} from './Glow';
import {FONT} from './Overlays';
import {Shot} from './Shot';
import {Sky} from './Sky';
import {Skyline} from './Skyline';
import {Box, Cam, Ground, Person, Quad, fog, proj, sc} from './World3D';
import {range, rnd} from './utils';

const Hospital: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = range(f, [0, 165], [1, 1.1]);
  const tx = range(f, [0, 165], [0, -30]);
  const fuel = range(f, [0, 165], [0.62, 0.38]);
  const siren = Math.sin(f * 0.5) > 0;
  const jx = Math.sin(f * 2) * 0.8;
  const jy = Math.cos(f * 2.3) * 0.6;
  const windows: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      const id = `h${r}${c}`;
      const x = 90 + c * 96;
      const y = 662 + r * 100;
      const base = r === 5 ? 1 : r === 4 ? (rnd(id) < 0.7 ? 1 : 0) : rnd(id) < 0.1 ? 1 : 0;
      const o = base * (0.8 + 0.2 * Math.sin(f * 0.7 + rnd(id + 'f') * 9));
      windows.push(
        o > 0.01 ? (
          <g key={id}>
            <Glow x={x + 28} y={y + 28} r={70} c="warm" o={o * 0.35} />
            <rect x={x} y={y} width={56} height={56} fill="#ffd49a" opacity={o} />
          </g>
        ) : (
          <rect key={id} x={x} y={y} width={56} height={56} fill="#8fb0e8" opacity={0.08} />
        )
      );
    }
  }
  const smoke: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const age = (f * 1.3 + i * 22) % 264;
    smoke.push(
      <circle key={i} cx={1030 + Math.sin(age * 0.05 + i) * 8 + age * 0.12} cy={940 - age} r={10 + age * 0.14} fill="#9aa4b8" opacity={0.18 * (1 - age / 264)} />
    );
  }
  return (
    <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${zoom})`, transformOrigin: '540px 1000px'}}>
      <Sky glow={0.02} stars={1} horizon={640} moon moonX={760} moonY={250} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={1262} width={1080} height={658} fill="#06080d" />
        <ellipse cx={460} cy={1270} rx={520} ry={60} fill="url(#g-warm)" opacity={0.28} />
        <rect x={70} y={640} width={800} height={622} fill="#0e1422" />
        <rect x={70} y={640} width={800} height={14} fill="#1a2234" />
        {windows}
        <rect x={380} y={560} width={180} height={80} fill="#0b101b" />
        <Glow x={470} y={600} r={120} c="red" o={0.55} />
        <rect x={457} y={574} width={26} height={52} fill="#ff4d3d" />
        <rect x={444} y={587} width={52} height={26} fill="#ff4d3d" />
        <rect x={150} y={1176} width={300} height={14} fill="#0a0e17" />
        <rect x={110} y={1196} width={190} height={66} rx={8} fill="#c9d1de" opacity={0.35} />
        <rect x={110} y={1226} width={190} height={8} fill="#ff4d3d" opacity={0.6} />
        <Glow x={150} y={1190} r={110} c={siren ? 'red' : 'blue'} o={0.75} />
        <Glow x={270} y={1190} r={110} c={siren ? 'blue' : 'red'} o={0.75} />
        <g transform={`translate(${jx},${jy})`}>
          <rect x={890} y={1060} width={180} height={202} rx={6} fill="#1b2330" />
          {Array.from({length: 8}).map((_, i) => (
            <line key={i} x1={906 + i * 22} x2={906 + i * 22} y1={1074} y2={1250} stroke="#262f40" strokeWidth={4} />
          ))}
          <rect x={1020} y={930} width={20} height={130} fill="#222b3b" />
          <circle cx={900} cy={1076} r={5} fill="#34d27b" />
          <Glow x={900} y={1076} r={30} c="green" o={0.8} />
        </g>
        {smoke}
        <rect x={880} y={990} width={190} height={46} rx={8} fill="rgba(3,6,12,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <rect x={892} y={1014} width={166} height={10} rx={5} fill="rgba(255,255,255,0.16)" />
        <rect x={892} y={1014} width={166 * fuel} height={10} rx={5} fill={fuel > 0.45 ? '#ffb020' : '#ff4d3d'} />
        <text x={894} y={1010} fill="#fff" fontSize={20} fontFamily={FONT} fontWeight={700}>
          BBM {Math.round(fuel * 100)}%
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const Station: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = {x: 0.5, y: 1.6, z: f * 0.05, f: 900, cx: 540, cy: 900};
  const sleepers: React.ReactNode[] = [];
  for (let z = Math.floor(cam.z); z < cam.z + 70; z += 1) {
    sleepers.push(<Ground key={z} c={cam} x0={-2.6} x1={0.8} z0={z} z1={z + 0.25} fill="#141820" opacity={fog(cam, z, 120)} />);
  }
  const pillars: React.ReactNode[] = [];
  for (let q = 8; q >= 0; q--) {
    const z = q * 14 + 6;
    if (z < cam.z + 1) continue;
    const lamp = proj(cam, 3.0, 4.6, z);
    pillars.push(
      <g key={q} opacity={Math.max(0.2, fog(cam, z, 180))}>
        <Box c={cam} x0={3.1} x1={3.4} y0={1.1} y1={5.6} z0={z} z1={z + 0.3} front="#141a26" side="#10151f" top="#141a26" />
        {lamp ? <Glow x={lamp[0]} y={lamp[1]} r={1.3 * sc(cam, z)} c="amber" o={0.35 + 0.3 * Math.max(0, Math.sin(f * 0.12 + q))} /> : null}
      </g>
    );
  }
  const people = [
    {x: 3.8, z: 14, beam: 0}, {x: 5.2, z: 20, beam: 0}, {x: 4.4, z: 31, beam: -1}, {x: 6.0, z: 42, beam: 0},
  ];
  return (
    <AbsoluteFill style={{background: '#06080d'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Ground c={cam} x0={-12} x1={10} z0={cam.z} z1={cam.z + 90} y={5.8} fill="#0a0d13" />
        <Ground c={cam} x0={-3} x1={1} z0={cam.z} z1={cam.z + 90} fill="#0a0d12" />
        {sleepers}
        <Ground c={cam} x0={-1.5} x1={-1.4} z0={cam.z} z1={cam.z + 90} fill="#46506a" />
        <Ground c={cam} x0={0.1} x1={0.2} z0={cam.z} z1={cam.z + 90} fill="#46506a" />
        <Quad c={cam} p={[[1, 0, cam.z + 0.6], [1, 1.1, cam.z + 0.6], [1, 1.1, cam.z + 90], [1, 0, cam.z + 90]]} fill="#0d1119" />
        <Ground c={cam} x0={1} x1={10} z0={cam.z} z1={cam.z + 90} y={1.1} fill="#161b26" />
        <Ground c={cam} x0={1} x1={1.5} z0={cam.z} z1={cam.z + 90} y={1.1} fill="#6b5a1d" opacity={0.45} />
        <Box c={cam} x0={-2.6} x1={-0.2} y0={0.5} y1={3.8} z0={14} z1={70} front="#0f1520" side="#121a28" top="#18212f" />
        {Array.from({length: 12}).map((_, i) => (
          <Quad key={i} c={cam} p={[[-0.2, 1.0, 15 + i * 4.6], [-0.2, 2.6, 15 + i * 4.6], [-0.2, 2.6, 18.3 + i * 4.6], [-0.2, 1.0, 18.3 + i * 4.6]]} fill={rnd(`tr${i}`) > 0.8 ? 'rgba(111,208,255,0.55)' : 'rgba(110,140,200,0.14)'} />
        ))}
        <Box c={cam} x0={2.5} x1={5.5} y0={4.2} y1={4.9} z0={30} z1={30.2} front="#05070b" side="#05070b" top="#05070b" />
        {pillars}
        {people.map((p, i) => (
          <Person key={i} c={cam} x={p.x} z={p.z} h={1.7} base={1.1} beam={p.beam} torch={0.8} />
        ))}
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(8,16,36,0) 700px, rgba(8,16,36,0.5) 900px, rgba(8,16,36,0) 1150px)'}} />
    </AbsoluteFill>
  );
};

const DarkTowers: React.FC = () => {
  const f = useCurrentFrame();
  const pan = f * 0.5;
  return (
    <AbsoluteFill>
      <Sky glow={0.02} stars={1} horizon={1000} moon moonX={300} moonY={280} />
      <Skyline baseY={1300} panX={pan} power={0.015} seed="dark" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={1300} width={1080} height={620} fill="#06080d" />
        <g transform={`translate(${-pan},0)`}>
          {Array.from({length: 4}).map((_, r) =>
            Array.from({length: 5}).map((__, c) => (
              <rect key={`${r}${c}`} x={760 + c * 24} y={1120 + r * 30} width={10} height={14} fill="#ffd49a" opacity={0.75 + 0.2 * Math.sin(f * 0.4 + r + c)} />
            ))
          )}
          <Glow x={820} y={1170} r={140} c="warm" o={0.3} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** ADEGAN 4 (27-39 dtk): hari keempat dan kelima. Rumah sakit, stasiun, gedung gelap. */
export const Scene4: React.FC = () => (
  <AbsoluteFill>
    <Shot from={0} duration={175} fade={0}>
      <Hospital />
    </Shot>
    <Shot from={165} duration={145} fade={12}>
      <Station />
    </Shot>
    <Shot from={300} duration={75} fade={12}>
      <DarkTowers />
    </Shot>
  </AbsoluteFill>
);
