import React from 'react';
import {Glow} from './Glow';
import {clamp01, rnd} from './utils';

/**
 * Mesin proyeksi perspektif sederhana (kamera menghadap +Z).
 * Dunia: X = kanan, Y = atas (meter), Z = maju. Semua dihitung per frame, tanpa gambar diam.
 */
export type Cam = {x: number; y: number; z: number; f: number; cx: number; cy: number};
export type P2 = [number, number];
export type P3 = [number, number, number];

export const proj = (c: Cam, X: number, Y: number, Z: number): P2 | null => {
  const dz = Z - c.z;
  if (dz < 0.4) return null;
  const s = c.f / dz;
  return [c.cx + (X - c.x) * s, c.cy - (Y - c.y) * s];
};
export const sc = (c: Cam, Z: number): number => c.f / Math.max(0.4, Z - c.z);
export const fog = (c: Cam, Z: number, far = 260): number => clamp01(1 - (Z - c.z) / far);

export const pts = (a: (P2 | null)[]): string | null => {
  for (const p of a) if (p === null) return null;
  return (a as P2[]).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
};

export const Quad: React.FC<{c: Cam; p: P3[]; fill: string; opacity?: number}> = ({c, p, fill, opacity = 1}) => {
  const s = pts(p.map((q) => proj(c, q[0], q[1], q[2])));
  return s ? <polygon points={s} fill={fill} opacity={opacity} /> : null;
};

/** Bidang datar (lantai/jalan) pada ketinggian y. */
export const Ground: React.FC<{c: Cam; x0: number; x1: number; z0: number; z1: number; y?: number; fill: string; opacity?: number}> = ({
  c, x0, x1, z0, z1, y = 0, fill, opacity = 1,
}) => {
  const za = Math.max(z0, c.z + 0.6);
  if (z1 <= za) return null;
  return <Quad c={c} p={[[x0, y, za], [x1, y, za], [x1, y, z1], [x0, y, z1]]} fill={fill} opacity={opacity} />;
};

/** Balok dengan sisi yang terlihat saja (depan, samping, atas). */
export const Box: React.FC<{
  c: Cam; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number;
  front: string; side: string; top: string; opacity?: number;
}> = ({c, x0, x1, y0, y1, z0, z1, front, side, top, opacity = 1}) => {
  const za = Math.max(z0, c.z + 0.6);
  if (z1 <= za) return null;
  return (
    <g opacity={opacity}>
      {c.x < x0 ? <Quad c={c} p={[[x0, y0, za], [x0, y1, za], [x0, y1, z1], [x0, y0, z1]]} fill={side} /> : null}
      {c.x > x1 ? <Quad c={c} p={[[x1, y0, za], [x1, y1, za], [x1, y1, z1], [x1, y0, z1]]} fill={side} /> : null}
      {c.y > y1 ? <Quad c={c} p={[[x0, y1, za], [x1, y1, za], [x1, y1, z1], [x0, y1, z1]]} fill={top} /> : null}
      {z0 > c.z + 0.6 ? <Quad c={c} p={[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]} fill={front} /> : null}
    </g>
  );
};

/** Jendela pada fasad sisi jalan (bidang X = konstan). `lit(r)` -> 0..1 */
export const FacadeWindows: React.FC<{
  c: Cam; x: number; z0: number; z1: number; h: number; seed: string;
  lit: (r: number) => number; cols: number; floorH: number; warm?: string; opacity?: number;
}> = ({c, x, z0, z1, h, seed, lit, cols, floorH, warm = '#ffd49a', opacity = 1}) => {
  if (z1 <= c.z + 0.8) return null;
  const rows = Math.floor((h - 1) / floorH);
  const cw = (z1 - z0) / cols;
  const winW = cw * 0.55;
  const winH = floorH * 0.55;
  const s = sc(c, Math.max((z0 + z1) / 2, c.z + 1));
  const tiny = winW * s < 1 && winH * s < 1;
  const out: React.ReactNode[] = [];
  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const wz0 = z0 + ci * cw + cw * 0.2;
      if (wz0 < c.z + 0.8) continue;
      const l = lit(rnd(`${seed}-${ri}-${ci}`));
      if (tiny && l <= 0.02) continue;
      const wy0 = ri * floorH + floorH * 0.25;
      const poly = pts([proj(c, x, wy0, wz0), proj(c, x, wy0, wz0 + winW), proj(c, x, wy0 + winH, wz0 + winW), proj(c, x, wy0 + winH, wz0)]);
      if (!poly) continue;
      out.push(
        l > 0.02 ? (
          <polygon key={`${ri}-${ci}`} points={poly} fill={warm} opacity={0.9 * l} />
        ) : (
          <polygon key={`${ri}-${ci}`} points={poly} fill="rgba(110,140,200,0.13)" />
        )
      );
    }
  }
  return <g opacity={opacity}>{out}</g>;
};

/** Mobil (tampak belakang jika searah, tampak depan jika berlawanan arah). */
export const Car: React.FC<{
  c: Cam; x: number; z: number; oncoming?: boolean; color?: string; lights?: number; len?: number;
}> = ({c, x, z, oncoming = false, color = '#1a2130', lights = 1, len = 4.2}) => {
  if (z + len <= c.z + 0.8) return null;
  const f = fog(c, z, 300);
  const lz = Math.max(z, c.z + 0.8);
  const lp = proj(c, x - 0.62, 0.7, lz);
  const rp = proj(c, x + 0.62, 0.7, lz);
  const s = sc(c, lz);
  return (
    <g opacity={Math.max(0.15, f)}>
      <Box c={c} x0={x - 0.9} x1={x + 0.9} y0={0.25} y1={0.95} z0={z} z1={z + len} front={color} side="#0e131d" top="#202a3b" />
      <Box c={c} x0={x - 0.75} x1={x + 0.75} y0={0.95} y1={1.45} z0={z + 0.9} z1={z + len - 1} front="#0d121b" side="#0a0f17" top="#1a2231" />
      {lp && rp && z > c.z + 0.8
        ? [lp, rp].map((p, i) => (
            <g key={i}>
              <Glow x={p[0]} y={p[1]} r={(oncoming ? 1.9 : 0.9) * s} c={oncoming ? 'white' : 'red'} o={(oncoming ? 0.85 : 0.75) * lights} />
              <circle cx={p[0]} cy={p[1]} r={0.13 * s} fill={oncoming ? '#f6faff' : '#ff4a3a'} opacity={lights} />
            </g>
          ))
        : null}
    </g>
  );
};

/** Orang berdiri/berjalan dengan senter. `beam` = arah sinar (+1 kanan, -1 kiri). */
export const Person: React.FC<{
  c: Cam; x: number; z: number; h?: number; base?: number; color?: string; beam?: number; torch?: number;
}> = ({c, x, z, h = 1.7, base = 0, color = '#05070b', beam = 0, torch = 1}) => {
  if (z <= c.z + 1) return null;
  const foot = proj(c, x, base, z);
  const head = proj(c, x, base + h, z);
  if (!foot || !head) return null;
  const s = sc(c, z);
  const w = 0.55 * s;
  const hand = proj(c, x + beam * 0.35, base + 1.0, z);
  const g1 = proj(c, x + beam * 7, base, z - 1.8);
  const g2 = proj(c, x + beam * 7, base, z + 2.8);
  return (
    <g opacity={Math.max(0.2, fog(c, z, 200))}>
      {beam !== 0 && hand && g1 && g2 ? (
        <g opacity={torch}>
          <polygon points={`${hand[0]},${hand[1]} ${g1[0]},${g1[1]} ${g2[0]},${g2[1]}`} fill="rgba(255,244,215,0.2)" />
          <Glow x={hand[0]} y={hand[1]} r={0.55 * s} c="white" o={0.9} />
        </g>
      ) : null}
      <rect x={foot[0] - w / 2} y={head[1] + 0.2 * s} width={w} height={foot[1] - head[1] - 0.2 * s} rx={w * 0.3} fill={color} />
      <circle cx={head[0]} cy={head[1] + 0.13 * s} r={0.13 * s} fill={color} />
    </g>
  );
};

/** Tangki/silo silinder sederhana (badan + tutup elips). */
export const Tank: React.FC<{c: Cam; x: number; z: number; r: number; h: number; body?: string; cap?: string}> = ({
  c, x, z, r, h, body = '#141c2a', cap = '#1d2738',
}) => {
  if (z <= c.z + 1) return null;
  const b = proj(c, x, 0, z);
  const t = proj(c, x, h, z);
  if (!b || !t) return null;
  const s = sc(c, z);
  const w = r * s;
  return (
    <g opacity={Math.max(0.15, fog(c, z, 320))}>
      <rect x={b[0] - w} y={t[1]} width={2 * w} height={b[1] - t[1]} fill={body} />
      <ellipse cx={b[0]} cy={b[1]} rx={w} ry={w * 0.18} fill={body} />
      <ellipse cx={t[0]} cy={t[1]} rx={w} ry={w * 0.18} fill={cap} />
    </g>
  );
};
