import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
    },
    build: {
        outDir: 'build',
    },
    envPrefix: [
        'VITE_',
        'TAURI_PLATFORM',
        'TAURI_ARCH',
        'TAURI_FAMILY',
        'TAURI_PLATFORM_VERSION',
        'TAURI_PLATFORM_TYPE',
        'TAURI_DEBUG',
    ],
});
