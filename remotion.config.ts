import {Config} from '@remotion/cli/config';

// Video vertikal 1080x1920 @ 30 FPS didefinisikan di Root.tsx (lihat timeline.ts).
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
