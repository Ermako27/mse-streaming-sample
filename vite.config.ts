import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        https: {
            cert: fs.readFileSync('.ssl/music.dev.pem'),
            key: fs.readFileSync('.ssl/music.dev.pem')
        },
        host: 'localhost.music.yandex.ru',
        port: 3000
    }
});
