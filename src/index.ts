import App from './App.svelte';
import './lib/keyboard.ts';

const app = new App({
    target: document.getElementById('app')!,
});

// Make it so clicks to body reset the active element focus
document.body.addEventListener('mousedown', () => {
    (document.activeElement as HTMLElement).blur();
});

export default app;
