import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        environment: 'jsdom',
        globals: true,
        deps: {
            web: {
                transformAssets: true,
            },
        },
        experimentalVmThreads: true,
    },
});
