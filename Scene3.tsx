import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Glow} from './Glow';
import {FONT} from './Overlays';
import {Shot} from './Shot';
import {Sky} from './Sky';
import {Skyline} from './Skyline';
import {Box, Cam, Ground, Person, Quad, proj, sc} from './World3D';
import {clamp01, range, ramp, rnd} from './utils';

const PRODUCT_COLORS = ['#3b4a6b', '#6b3b3b', '#3b6b4f', '#6b5f3b', '#4f3b6b', '#2f5f6b'];

/** Panel suhu freezer (elemen diegetik di kamera close-up). */
const TempPanel: React.FC<{f: number}> = ({f}) => {
  const temp = Math.round(interpolate(f, [0, 120], [-16, 8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const danger = temp > -10;
  return (
    <div
      style={{
        position: 'absolute', top: 1110, left: 190, width: 700, height: 250, borderRadius: 26,
        background: 'rgba(3,6,12,0.82)', border: '2px solid rgba(255,255,255,0.12)', fontFamily: FONT,
        opacity: clamp01((f - 15) / 20), textAlign: 'center', boxShadow: '0 0 60px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{color: 'rgba(255,255,255,0.65)', fontSize: 30, fontWeight: 600, letterSpacing: 5, marginTop: 24}}>SUHU FREEZER</div>
      <div style={{color: danger ? '#ff4d3d' : '#6fd0ff', fontSize: 130, fontWeight: 800, lineHeight: 1.15, textShadow: `0 0 36px ${danger ? 'rgba(255,77,61,0.7)' : 'rgba(111,208,255,0.7)'}`}}>
        {temp > 0 ? '+' : ''}{temp}°C
      </div>
      <div style={{color: 'rgba(255,255,255,0.5)', fontSize: 26, fontWeight: 500}}>batas aman penyimpanan beku: −18°C</div>
    </div>
  );
};

const Supermarket: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = {x: 0, y: 1.55, z: f * 0.06, f: 900, cx: 540, cy: 900};
  const shelves: React.ReactNode[] = [];
  for (let i = 12; i >= 0; i--) {
    const z = 4 + i * 3.6;
    if (z + 3.2 < cam.z + 1) continue;
    const prods: React.ReactNode[] = [];
    for (let r = 0; r < 5; r++) {
      for (let cI = 0; cI < 6; cI++) {
        const z0 = z + 0.12 + cI * 0.5;
        const y0 = 0.15 + r * 0.36;
        const q = [proj(cam, -3.9, y0, z0), proj(cam, -3.9, y0, z0 + 0.4), proj(cam, -3.9, y0 + 0.3, z0 + 0.4), proj(cam, -3.9, y0 + 0.3, z0)];
        if (q.some((p) => p === null)) continue;
        prods.push(<polygon key={`${r}-${cI}`} points={q.map((p) => `${p![0].toFixed(1)},${p![1].toFixed(1)}`).join(' ')} fill={PRODUCT_COLORS[Math.floor(rnd(`pr${i}${r}${cI}`) * 6)]} opacity={0.5} />);
      }
    }
    shelves.push(
      <g key={`s${i}`}>
        <Box c={cam} x0={-5.2} x1={-3.9} y0={0} y1={1.9} z0={z} z1={z + 3.2} front="#1b2230" side="#232c3d" top="#2a3446" />
        {prods}
        <Box c={cam} x0={3.6} x1={5.4} y0={0} y1={2.1} z0={z} z1={z + 3.2} front="#1b2736" side="#1c2a3b" top="#2a3446" />
        <Quad c={cam} p={[[3.6, 0.15, z + 0.1], [3.6, 1.95, z + 0.1], [3.6, 1.95, z + 3.1], [3.6, 0.15, z + 3.1]]} fill="rgba(120,180,230,0.16)" />
        <Quad c={cam} p={[[3.6, 0.3, z + 0.3], [3.6, 0.7, z + 0.3], [3.6, 0.7, z + 2.9], [3.6, 0.3, z + 2.9]]} fill="rgba(190,215,240,0.18)" />
      </g>
    );
  }
  const exit = proj(cam, 0, 3.5, 46);
  const es = sc(cam, 46);
  const lamps = [10, 24, 38].map((z) => proj(cam, 0, 4.1, z));
  return (
    <AbsoluteFill style={{background: '#06080d'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Ground c={cam} x0={-7} x1={7} z0={cam.z} z1={cam.z + 60} y={4.2} fill="#0a0d13" />
        <Ground c={cam} x0={-7} x1={7} z0={cam.z} z1={cam.z + 60} y={0} fill="#141a24" />
        {Array.from({length: 24}).map((_, i) => {
          const z = Math.floor(cam.z / 2) * 2 + i * 2;
          return <Ground key={i} c={cam} x0={-7} x1={7} z0={z} z1={z + 0.06} fill="rgba(255,255,255,0.05)" />;
        })}
        <Quad c={cam} p={[[-7, 0, 46], [7, 0, 46], [7, 4.2, 46], [-7, 4.2, 46]]} fill="#10151e" />
        {shelves}
        {exit ? (
          <g>
            <Glow x={exit[0]} y={exit[1]} r={1.7 * es} c="green" o={0.95} />
            <rect x={exit[0] - 0.5 * es} y={exit[1] - 0.17 * es} width={1.0 * es} height={0.34 * es} fill="#34d27b" opacity={0.9} />
          </g>
        ) : null}
        {lamps.map((p, i) =>
          p ? <Glow key={i} x={p[0]} y={p[1]} r={0.9 * sc(cam, [10, 24, 38][i])} c="amber" o={0.35 + 0.1 * Math.sin(f * 0.1 + i)} /> : null
        )}
        <Person c={cam} x={-2.2} z={11} beam={1} torch={0.8 + 0.2 * Math.sin(f * 0.2)} />
        <Person c={cam} x={2.0} z={17} beam={-1} torch={0.8 + 0.2 * Math.sin(f * 0.17 + 1)} />
        <Person c={cam} x={-0.6} z={27} beam={1} torch={0.8 + 0.2 * Math.sin(f * 0.23 + 2)} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(255,246,225,0.08), rgba(0,0,0,0) 55%)'}} />
      <TempPanel f={f} />
    </AbsoluteFill>
  );
};

const CellTower: React.FC = () => {
  const f = useCurrentFrame();
  const sc2 = range(f, [0, 110], [1, 1.12]);
  const ty = range(f, [0, 110], [0, 110]);
  const braces: React.ReactNode[] = [];
  const topY = 540;
  const baseY = 1750;
  const legAt = (y: number) => {
    const t = (y - topY) / (baseY - topY);
    return 14 + t * 150;
  };
  for (let y = topY + 60; y < baseY; y += 70) {
    const a = legAt(y);
    const b = legAt(y + 70);
    braces.push(<line key={y} x1={540 - a} y1={y} x2={540 + b} y2={y + 70} stroke="#222c40" strokeWidth={3} />);
    braces.push(<line key={`b${y}`} x1={540 + a} y1={y} x2={540 - b} y2={y + 70} stroke="#222c40" strokeWidth={3} />);
    braces.push(<line key={`h${y}`} x1={540 - a} y1={y} x2={540 + a} y2={y} stroke="#222c40" strokeWidth={3} />);
  }
  const barsOn = 4 - Math.floor(ramp(f, 10, 85) * 4.99);
  const ledOn = f < 45 ? 1 : 0;
  const beacon = Math.sin(f * 0.2) > 0.1;
  return (
    <AbsoluteFill>
      <Sky glow={0.03} stars={1} horizon={1500} moon moonX={230} moonY={330} />
      <Skyline baseY={1780} panX={f * 0.25} power={0.02} seed="tw" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, transform: `translateY(${ty}px) scale(${sc2})`, transformOrigin: '540px 1750px'}}>
        <line x1={540 - 14} y1={topY} x2={540 - 164} y2={baseY} stroke="#2b374f" strokeWidth={7} />
        <line x1={540 + 14} y1={topY} x2={540 + 164} y2={baseY} stroke="#2b374f" strokeWidth={7} />
        {braces}
        {[470, 540, 610].map((x, i) => (
          <g key={x}>
            <rect x={x - 16} y={620} width={32} height={120} rx={4} fill="#3a465e" />
            <circle cx={x} cy={752} r={5} fill="#34d27b" opacity={ledOn * (0.6 + 0.4 * Math.sin(f * 0.5 + i))} />
            {ledOn ? <Glow x={x} y={752} r={24} c="green" o={0.8} /> : null}
          </g>
        ))}
        <circle cx={540} cy={topY - 6} r={6} fill="#ff3b30" opacity={beacon ? 1 : 0.15} />
        {beacon ? <Glow x={540} y={topY - 6} r={70} c="red" o={0.9} /> : null}
      </svg>
      <div
        style={{
          position: 'absolute', top: 1110, left: 190, width: 700, height: 250, borderRadius: 26,
          background: 'rgba(3,6,12,0.82)', border: '2px solid rgba(255,255,255,0.12)', fontFamily: FONT,
          opacity: clamp01((f - 8) / 20), textAlign: 'center',
        }}
      >
        <div style={{color: 'rgba(255,255,255,0.65)', fontSize: 30, fontWeight: 600, letterSpacing: 5, marginTop: 24}}>SINYAL SELULER</div>
        <svg width={700} height={150}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={250 + i * 54} y={120 - (i + 1) * 28} width={36} height={(i + 1) * 28} rx={5} fill={i < barsOn ? '#6fd0ff' : 'rgba(255,255,255,0.14)'} />
          ))}
          {barsOn === 0 ? (
            <g stroke="#ff4d3d" strokeWidth={9} strokeLinecap="round">
              <line x1={500} y1={50} x2={550} y2={100} />
              <line x1={550} y1={50} x2={500} y2={100} />
            </g>
          ) : null}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const QuietCbd: React.FC = () => {
  const f = useCurrentFrame();
  const pan = f * 0.6;
  const shops: React.ReactNode[] = [];
  for (let i = -1; i < 6; i++) {
    const x = i * 270 - ((pan * 1.3) % 270) * 1;
    shops.push(
      <g key={i + Math.floor((pan * 1.3) / 270)}>
        <rect x={x} y={1340} width={266} height={290} fill="#0e131c" />
        <rect x={x} y={1340} width={266} height={46} fill="#090c12" />
        {Array.from({length: 14}).map((_, j) => (
          <line key={j} x1={x + 8} x2={x + 258} y1={1400 + j * 16} y2={1400 + j * 16} stroke="#18202e" strokeWidth={3} />
        ))}
      </g>
    );
  }
  const people = [
    {x: 260, v: 0.5, beam: 1},
    {x: 760, v: -0.35, beam: -1},
    {x: 980, v: -0.6, beam: -1},
  ];
  return (
    <AbsoluteFill>
      <Sky glow={0.04} stars={0.9} horizon={1150} moon moonX={760} moonY={300} />
      <Skyline baseY={1330} panX={pan} power={0.03} seed="cbd" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={0} y={1330} width={1080} height={590} fill="#07090e" />
        {shops}
        <rect x={0} y={1630} width={1080} height={290} fill="#0a0d14" />
        <rect x={0} y={1630} width={1080} height={8} fill="#161d2a" />
        {people.map((p, i) => {
          const x = p.x + p.v * f;
          return (
            <g key={i}>
              <polygon points={`${x + p.beam * 20},1690 ${x + p.beam * 330},1760 ${x + p.beam * 330},1660`} fill="rgba(255,244,215,0.16)" />
              <Glow x={x + p.beam * 20} y={1690} r={44} c="white" o={0.8} />
              <rect x={x - 20} y={1620} width={40} height={130} rx={14} fill="#04060a" />
              <circle cx={x} cy={1604} r={19} fill="#04060a" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** ADEGAN 3 (17-27 dtk): hari kedua dan ketiga. Supermarket, menara seluler, pusat kota sepi. */
export const Scene3: React.FC = () => (
  <AbsoluteFill>
    <Shot from={0} duration={130} fade={0}>
      <Supermarket />
    </Shot>
    <Shot from={120} duration={105} fade={12}>
      <CellTower />
    </Shot>
    <Shot from={215} duration={100} fade={12}>
      <QuietCbd />
    </Shot>
  </AbsoluteFill>
);
