import { Hct, SchemeContent } from '@material/material-color-utilities';
import { render } from '@testing-library/svelte';
import App from '../src/App.svelte';
import { toKebabCase, updateStyleSheet } from '../src/lib/theme';

global.fetch = vi.fn().mockImplementation(
    () =>
        Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(undefined),
        })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;

describe('Theme Controller Functions', () => {
    test('String to kebab-case', () => {
        expect(toKebabCase('TestString')).toEqual('test-string');
        expect(toKebabCase('testString')).toEqual('test-string');
    });
    test('Update stylesheet from Hex (light)', async () => {
        render(App, { screenActive: true });
        await updateStyleSheet('#00CDD5', false, undefined, '', 'test');
        const lightStylesheet = document.adoptedStyleSheets.at(0)?.cssRules[0].cssText;
        expect(lightStylesheet).toContain('--test-color-surface: 244 251 251;');
        expect(lightStylesheet).toContain('--test-color-inverse-surface: 43 50 50;');
        expect(lightStylesheet).toContain('--test-color-primary: 0 105 109;');
        expect(lightStylesheet).toContain('--test-color-secondary-container: 187 240 243;');
        expect(lightStylesheet).toContain('--test-color-on-secondary-fixed-variant: 23 78 81;');
    });
    test('Update stylesheet from Hex (Dark)', async () => {
        render(App, { screenActive: true });
        await updateStyleSheet('#00CDD5', true, undefined, '', 'test');
        const darkStylesheet = document.adoptedStyleSheets.at(0)?.cssRules[0].cssText;
        expect(darkStylesheet).toContain('--test-color-primary-palette-key-color: 0 205 213;');
        expect(darkStylesheet).toContain('--test-color-surface-container: 26 33 33;');
        expect(darkStylesheet).toContain('--test-color-on-primary-container: 0 44 46;');
        expect(darkStylesheet).toContain('--test-color-primary-fixed: 96 247 255;');
        expect(darkStylesheet).toContain('--test-color-on-tertiary-fixed-variant: 93 50 131;');
    });
    test('Update stylesheet from argbSource', async () => {
        await updateStyleSheet(4208235073, true, undefined, undefined, 'test');
        const stylesheet = document.adoptedStyleSheets.at(0)?.cssRules[0].cssText;
        expect(stylesheet).toContain('--test-color-tertiary-palette-key-color: 156 166 75;');
        expect(stylesheet).toContain('--test-color-shadow: 0 0 0;');
        expect(stylesheet).toContain('--test-color-tertiary: 195 206 110;');
        expect(stylesheet).toContain('--test-color-primary-fixed: 255 221 186;');
        expect(stylesheet).toContain('--test-color-on-secondary-fixed: 43 23 0;');
    });
    test('Update stylesheet from Scheme', async () => {
        render(App, { screenActive: true });
        const testScheme = new SchemeContent(Hct.fromInt(4278232773), true, 0);
        await updateStyleSheet(testScheme, true, undefined, 'content', 'test');
        const stylesheet = document.adoptedStyleSheets.at(0)?.cssRules[0].cssText;
        expect(stylesheet).toContain('--test-color-surface-dim: 15 20 22;');
        expect(stylesheet).toContain('--test-color-inverse-surface: 222 227 230;');
        expect(stylesheet).toContain('--test-color-on-primary: 0 54 65;');
        expect(stylesheet).toContain('--test-color-tertiary-container: 178 124 204;');
        expect(stylesheet).toContain('--test-color-tertiary-fixed-dim: 232 179 255;');
    });
});
