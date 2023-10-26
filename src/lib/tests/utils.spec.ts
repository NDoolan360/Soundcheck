import { clamp, prettyTime } from '../utils';

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
});
