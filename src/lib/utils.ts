import { Store } from 'tauri-plugin-store-api';
import { asyncWritable } from '@square/svelte-store';

export function optional<T>(): T | undefined {
    return undefined;
}

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(min, value), max);

const newEventsListener = (events: string[], listener: (...args: any) => void) => {
    events.forEach((event) => document.addEventListener(event, listener));
    return {
        destroy() {
            events.forEach((event) => document.removeEventListener(event, listener));
        },
    };
};

export const loseFocus = (node: HTMLElement, callback: Function) =>
    newEventsListener(['mousedown', 'mouseleave', 'touchstart', 'focusin'], ({ target }: Event) => {
        if (!node.contains(target as HTMLElement)) callback();
    });

export const gainFocus = (node: HTMLElement, callback: Function) =>
    newEventsListener(['mouseover', 'touchstart', 'focusin'], ({ target }: Event) => {
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
            if (await store.has(key)) return (await store.get<T>(key))!;
            else {
                await store.set(key, initial);
                store.save();
                return initial;
            }
        },
        async (value: T) => {
            await store.set(key, value);
            store.save();
            return value;
        },
        { initial }
    );
};
