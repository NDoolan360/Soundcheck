import { get } from '@square/svelte-store';
import { invoke } from '@tauri-apps/api';
import { disallows, liked, loading, playing, progress, repeat, shuffle, volume } from './playback';
import { nextRepeat, toggle } from './utils';

window.onkeydown = function (e: KeyboardEvent) {
    const ctrl = e.ctrlKey && !e.altKey;
    const shift = !e.ctrlKey && e.shiftKey && !e.altKey;
    const altShift = !e.ctrlKey && e.shiftKey && e.altKey;
    switch (e.key.toLowerCase()) {
        // Allow keyboard activation for buttons
        case 'tab':
        case 'enter':
            break;
        // Allow keyboard activation for buttons
        case '?':
        case '/':
            if (ctrl) {
                // TODO add modal showing key bindings
            }
            break;
        case ' ':
            // Make sure we're not currently focusing any input elements
            if (document.activeElement === document.body && !get(disallows).playPause) toggle(playing);
            break;
        case 'b':
            if (altShift && !get(disallows).togglingLike) toggle(liked);
            break;
        case 's':
            if (ctrl && !get(disallows).togglingShuffle) toggle(shuffle);
            break;
        case 'r':
            if (ctrl && !get(disallows).togglingRepeat) {
                // Prevent page refresh from occuring
                e.preventDefault();
                nextRepeat(repeat);
            }
            break;
        case 'arrowleft':
            if (ctrl && !get(disallows).skippingPrev) {
                invoke('previous_track').then(() => loading.set(true));
            } else if (shift && !get(disallows).seeking) {
                progress.update((v) => v - 10000);
            }
            break;
        case 'arrowright':
            if (ctrl && !get(disallows).skippingNext) {
                invoke('next_track').then(() => loading.set(true));
            } else if (shift && !get(disallows).seeking) {
                progress.update((v) => v + 10000);
            }
            break;
        case 'arrowup':
            if (ctrl && !get(disallows).changeVolume) {
                volume.update((v) => v + 10);
            }
            break;
        case 'arrowdown':
            if (ctrl && !get(disallows).changeVolume) {
                volume.update((v) => v - 10);
            }
            break;
        default:
            e.preventDefault();
    }
};
