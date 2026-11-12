/**
 * Konfigurasi proyek. Semua nilai bisa diubah di sini atau lewat CLI:
 *   npx remotion render MatiLampu out/video.mp4 --props='{"narrationEnabled":true}'
 */
export type VideoProps = {
  /** Putar narasi eksternal (MP3 di folder public/). */
  narrationEnabled: boolean;
  /** Nama file di folder public/, mis. "narration.mp3". */
  narrationFile: string;
  /** Volume 0..1. Audio TIDAK diubah kecepatan/pitch-nya. */
  narrationVolume: number;
  /** Tampilkan penghitung hari/jam di atas layar. */
  showHud: boolean;
  /** Tampilkan teks keterangan di bawah layar. */
  showCaptions: boolean;
  /** Tampilkan efek film grain halus. */
  showGrain: boolean;
};

export const defaultProps: VideoProps = {
  narrationEnabled: false,
  narrationFile: 'narration.mp3',
  narrationVolume: 1,
  showHud: true,
  showCaptions: true,
  showGrain: true,
};

/** Keterangan di bawah layar (detik awal, detik akhir, teks). */
export const CAPTIONS: {from: number; to: number; text: string}[] = [
  {from: 4.9, to: 6.9, text: 'Seluruh jaringan listrik kota padam serentak.'},
  {from: 7.6, to: 16.6, text: 'Hari 1: lampu lalu lintas mati, jalan melambat.'},
  {from: 17.6, to: 26.6, text: 'Hari 2–3: pendingin berhenti, sinyal seluler melemah.'},
  {from: 27.6, to: 38.6, text: 'Hari 4–5: rumah sakit bertahan dengan generator.'},
  {from: 39.6, to: 50.6, text: 'Hari 6–7: distribusi barang dan industri tersendat.'},
  {from: 52.0, to: 59.4, text: 'Listrik pulih. Kota menyala kembali, bertahap.'},
];
