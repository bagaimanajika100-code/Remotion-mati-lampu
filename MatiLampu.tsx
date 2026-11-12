import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {GlowDefs} from './Glow';
import {Caption, Grain, Hud, Vignette} from './Overlays';
import {Shot} from './Shot';
import {VideoProps, defaultProps} from './config';
import {SCENE_TIMES, XFADE, toFrame} from './timeline';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {Scene4} from './Scene4';
import {Scene5} from './Scene5';
import {Scene6} from './Scene6';

/**
 * Komposisi tunggal "MatiLampu": semua adegan berada di satu timeline (1800 frame @ 30 FPS).
 * Tiap adegan menimpa adegan sebelumnya dengan crossfade (XFADE frame), jadi hasil render
 * adalah SATU video utuh, bukan klip terpisah.
 */
export const MatiLampu: React.FC<VideoProps> = (props) => {
  const p = {...defaultProps, ...props};
  const {s1, s2, s3, s4, s5, s6} = SCENE_TIMES;
  const dur = (a: readonly [number, number]) => toFrame(a[1] - a[0]) + XFADE;

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <GlowDefs />
      <Shot from={toFrame(s1[0])} duration={dur(s1)} fade={0}>
        <Scene1 />
      </Shot>
      <Shot from={toFrame(s2[0])} duration={dur(s2)}>
        <Scene2 />
      </Shot>
      <Shot from={toFrame(s3[0])} duration={dur(s3)}>
        <Scene3 />
      </Shot>
      <Shot from={toFrame(s4[0])} duration={dur(s4)}>
        <Scene4 />
      </Shot>
      <Shot from={toFrame(s5[0])} duration={dur(s5)}>
        <Scene5 />
      </Shot>
      <Shot from={toFrame(s6[0])} duration={toFrame(s6[1] - s6[0])}>
        <Scene6 />
      </Shot>

      <Vignette />
      {p.showGrain ? <Grain /> : null}
      {p.showHud ? <Hud /> : null}
      {p.showCaptions ? <Caption /> : null}

      {/* Narasi eksternal opsional: diputar apa adanya (tanpa ubah kecepatan/pitch/isi). */}
      {p.narrationEnabled ? <Audio src={staticFile(p.narrationFile)} volume={p.narrationVolume} /> : null}
    </AbsoluteFill>
  );
};
