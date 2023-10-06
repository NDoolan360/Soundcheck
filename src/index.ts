import './styles.css';
import './material-symbols-outlined.css';
import App from './App.svelte';

const app = new App({
    target: document.getElementById('app')!,
});

// Make it so clicks to body reset the active element focus
document.body.addEventListener('mousedown', () => {
    (document.activeElement as HTMLElement).blur();
});

window.onkeydown = function (e) {
    // Prevent reload and known external dialogs.
    if (
        (e.ctrlKey && ['f', 'g', 'p', 'r', 'u'].includes(e.key.toLowerCase())) ||
        ['f3', 'f5'].includes(e.key.toLowerCase())
    )
        e.preventDefault();
};

export default app;
