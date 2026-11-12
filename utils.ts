import {Easing, interpolate, random} from 'remotion';

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** 0 -> 1 halus antara frame `start` dan `end`. */
export const ramp = (frame: number, start: number, end: number): number =>
  smooth((frame - start) / (end - start));
/** Angka acak deterministik (aman untuk render paralel). */
export const rnd = (seed: string | number): number => random(seed);
export const range = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = Easing.inOut(Easing.cubic)
): number =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
/**
 * Seberapa menyala sebuah titik cahaya: p = daya (0..1), r = ambang acak (0..1).
 * Saat p turun, lampu padam satu per satu (bukan serentak) sehingga terlihat alami.
 */
export const litFn = (p: number, r: number): number => clamp01((p - r * 0.6) / 0.4);
