import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {XFADE} from './timeline';
import {clamp01} from './utils';

const FadeIn: React.FC<{fade: number; children: React.ReactNode}> = ({fade, children}) => {
  const f = useCurrentFrame();
  const o = fade > 0 ? clamp01(f / fade) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/**
 * Satu shot di timeline. Shot berikutnya menimpa shot sebelumnya dengan fade-in,
 * sehingga terjadi crossfade alami (shot sebelumnya tetap berjalan selama XFADE frame).
 */
export const Shot: React.FC<{
  from: number;
  duration: number;
  fade?: number;
  children: React.ReactNode;
}> = ({from, duration, fade = XFADE, children}) => (
  <Sequence from={from} durationInFrames={duration}>
    <FadeIn fade={fade}>{children}</FadeIn>
  </Sequence>
);
