import { get, writable } from '@square/svelte-store';
import type { RepeatState } from '../playback';
import { clamp, cloneObject, nextRepeat, prettyTime, toggle } from '../utils';

describe('Misc Helper Functions', () => {
    test('Clamp', () => {
        expect(clamp(15, 10, 25)).toEqual(15);
        expect(clamp(15, 20, 25)).toEqual(20);
        expect(clamp(15, 30, 25)).toEqual(25);
    });
    test('Pretty Time', () => {
        expect(prettyTime(0)).toBe('00:00');
        expect(prettyTime(10000)).toBe('00:10');
        expect(prettyTime(60000)).toBe('01:00');
        expect(prettyTime(3600000)).toBe('01:00:00');
    });
    test('Clone Object', () => {
        const test = { value: 1 };
        const test_clone = cloneObject(test);
        test_clone.value = 0;

        expect(test.value).toBe(1);
        expect(test_clone.value).toBe(0);
    });
    test('Toggle', () => {
        const mockStore = writable(false);

        toggle(mockStore);
        expect(get(mockStore)).toBe(true);

        toggle(mockStore);
        expect(get(mockStore)).toBe(false);
    });
    test('Get Next Repeat Value', () => {
        const mockRepeatState = writable<RepeatState>('off');

        nextRepeat(mockRepeatState);
        expect(get(mockRepeatState)).toBe('context');
        nextRepeat(mockRepeatState);
        expect(get(mockRepeatState)).toBe('track');
        nextRepeat(mockRepeatState);
        expect(get(mockRepeatState)).toBe('off');
    });
});
