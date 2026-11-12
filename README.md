# BAGAIMANA JIKA MATI LAMPU SELAMA 1 MINGGU?

Proyek Remotion, semua file ada di satu level (tanpa folder). Video vertikal 1080x1920, 30 FPS, 60 detik, satu komposisi `MatiLampu`.

## Pakai
1. Simpan semua file ini dalam satu folder yang sama.
2. `npm install`
3. Pratinjau: `npm run dev` (pilih komposisi MatiLampu)
4. Render: `npm run render` -> hasil `mati-lampu.mp4` di folder yang sama

Butuh Node.js 18+. Render beberapa menit; jika berat: `npx remotion render index.ts MatiLampu video.mp4 --concurrency=2`.
Jika ada error versi: `npx remotion upgrade`.

## Narasi MP3 eksternal (opsional)
Remotion membaca audio dari folder bernama `public`. Hanya jika memakai narasi, buat folder `public`, isi dengan `narration.mp3`, lalu `npm run render:narasi`
(atau set `narrationEnabled: true` di config.ts). Audio diputar apa adanya, tanpa ubah kecepatan, pitch, atau isi. Tanpa narasi, tidak perlu folder apa pun.

## Peta file
- index.ts, Root.tsx, MatiLampu.tsx: titik masuk dan timeline tunggal
- config.ts: opsi (narasi, HUD, caption, grain) dan teks keterangan
- timeline.ts, utils.ts: waktu adegan dan fungsi bantu
- Scene1.tsx ... Scene6.tsx: enam adegan (0-7, 7-17, 17-27, 27-39, 39-51, 51-60 detik)
- CityGrid, Skyline, World3D, Sky, Glow, Shot, Overlays: komponen visual bersama

Visual dibuat dengan kode (SVG + perspektif), gaya 3D vektor sinematik, bukan footage fotorealistis. Remotion gratis untuk individu/perusahaan kecil: remotion.dev/license
