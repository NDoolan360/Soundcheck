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

export default app;
