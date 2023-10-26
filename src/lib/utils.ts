import { asyncWritable } from '@square/svelte-store';
import { Store } from 'tauri-plugin-store-api';

const inBrowser = window.__TAURI_IPC__ === undefined;
export const testingMode = typeof process !== 'undefined' && process.env['MODE'] === 'test';

export function optional<T>(): T | undefined {
    return undefined;
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(min, value), max);

const newEventsListener = (events: string[], listener: (_: Event) => void) => {
    events.forEach((event) => document.addEventListener(event, listener));
    return {
        destroy() {
            events.forEach((event) => document.removeEventListener(event, listener));
        },
    };
};

export const loseFocus = (node: HTMLElement, callback: () => void) =>
    newEventsListener(['mousedown', 'mouseleave', 'touchstart', 'focusin'], ({ target }) => {
        if (!node.contains(target as HTMLElement)) callback();
    });

export const gainFocus = (node: HTMLElement, callback: () => void) =>
    newEventsListener(['mouseover', 'touchstart', 'focusin'], ({ target }) => {
        if (node.contains(target as HTMLElement)) callback();
    });

// Util for converting raw times to pretty times
export const prettyTime = (rawTime: number) => {
    const date = new Date(rawTime ?? 0);
    return date.getUTCHours() > 0 ? date.toISOString().substring(11, 19) : date.toISOString().substring(14, 19);
};

export const newSettingStore = <T>(key: string, initial: T) => {
    const store = new Store('.soundcheck-settings.json');
    return asyncWritable<[], T>(
        [],
        async () => {
            if (!inBrowser) {
                if (await store.has(key)) return (await store.get<T>(key))!;
                await store.set(key, initial);
                store.save();
            }
            return initial;
        },
        async (value: T) => {
            if (!inBrowser) {
                await store.set(key, value);
                store.save();
            }
            return value;
        },
        { initial }
    );
};
