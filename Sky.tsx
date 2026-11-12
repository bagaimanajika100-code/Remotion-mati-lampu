import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rnd} from './utils';

type Star = {x: number; y: number; r: number; t: number};

export const Sky: React.FC<{
  glow?: number; // 0..1 cahaya kota di cakrawala
  stars?: number; // 0..1 kecerahan bintang
  horizon?: number; // posisi cakrawala (px dari atas)
  moon?: boolean;
  moonX?: number;
  moonY?: number;
}> = ({glow = 0, stars = 1, horizon = 900, moon = false, moonX = 820, moonY = 330}) => {
  const f = useCurrentFrame();
  const list = useMemo<Star[]>(() => {
    const out: Star[] = [];
    for (let i = 0; i < 150; i++) {
      out.push({x: rnd(`sx${i}`) * 1080, y: rnd(`sy${i}`) * 1100, r: 0.6 + rnd(`sr${i}`) * 1.3, t: rnd(`st${i}`) * 6});
    }
    return out;
  }, []);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(to bottom, #01030a 0%, #050b1b 45%, #0a1630 ${Math.max(20, horizon)}px, #05070d 100%)`,
      }}
    >
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {list.map((s, i) =>
          s.y < horizon - 20 ? (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#dfe9ff"
              opacity={stars * (0.35 + 0.35 * Math.sin(f * 0.05 + s.t) + 0.3) * (1 - s.y / (horizon + 200))}
            />
          ) : null
        )}
        {moon ? (
          <g>
            <circle cx={moonX} cy={moonY} r={170} fill="url(#g-blue)" opacity={0.35 * stars} />
            <circle cx={moonX} cy={moonY} r={34} fill="#eaf1ff" opacity={0.92 * stars} />
          </g>
        ) : null}
        <ellipse
          cx={540}
          cy={horizon}
          rx={760}
          ry={170}
          fill="url(#g-amber)"
          opacity={0.55 * glow}
        />
      </svg>
    </AbsoluteFill>
  );
};
