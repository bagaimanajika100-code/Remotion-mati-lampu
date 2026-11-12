export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_SECONDS = 60;
export const TOTAL_FRAMES = FPS * TOTAL_SECONDS; // 1800
export const XFADE = 15; // lama crossfade antaradegan (frame)

export const toFrame = (seconds: number): number => Math.round(seconds * FPS);

/** Batas waktu tiap adegan (detik) di timeline tunggal. */
export const SCENE_TIMES = {
  s1: [0, 7],
  s2: [7, 17],
  s3: [17, 27],
  s4: [27, 39],
  s5: [39, 51],
  s6: [51, 60],
} as const;

/** Saat lampu kota padam di adegan 1 (frame lokal = frame global). */
export const BLACKOUT_FRAME = 135;

/** Peta waktu video (detik) -> jam sejak pemadaman (0..168 jam = 7 hari). */
export const HOURS_KEYS = [0, 4.5, 7, 17, 27, 39, 51, 60];
export const HOURS_VALUES = [0, 0, 2, 24, 72, 120, 168, 168];
