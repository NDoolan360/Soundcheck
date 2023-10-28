import { render } from '@testing-library/svelte';
import App from '../../App.svelte';
import { alwaysShowArtwork, alwaysShowControls, artworkFillMode } from '../settings';

global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
        blob: () => Promise.resolve(undefined),
    })
) as () => Promise<Response>;

beforeEach(async () => {
    alwaysShowControls.set(false);
    alwaysShowArtwork.set(false);
    artworkFillMode.set('contain');
});

describe('Visual Settings', () => {
    test('Render default inactive', () => {
        render(App, { screenActive: false });
        // Present
        expect(document.getElementById('track-image')).not.toBeNull();
        // Absent
        expect(document.getElementsByTagName('main').length).toBeFalsy();
    });
    test('Render default active', () => {
        render(App, { screenActive: true });
        // Present
        expect(document.getElementsByTagName('main').length).toBeTruthy();
        // Absent
        expect(document.getElementById('track-image')).toBeNull();
    });
    test('Render inactive with alwaysShowArtwork', async () => {
        await alwaysShowArtwork.set(true);
        render(App, { screenActive: false });
        // Present
        expect(document.getElementById('track-image')).not.toBeNull();
        // Absent
        expect(document.getElementsByTagName('main').length).toBeFalsy();
    });
    test('Render active with alwaysShowArtwork', async () => {
        await alwaysShowArtwork.set(true);
        render(App, { screenActive: true });
        // Present
        expect(document.getElementsByTagName('main').length).toBeTruthy();
        expect(document.getElementById('track-image')).not.toBeNull();
    });
    test('Render inactive with alwaysShowControls', async () => {
        await alwaysShowControls.set(true);
        render(App, { screenActive: false });
        // Present
        expect(document.getElementsByTagName('main').length).toBeTruthy();
        // Absent
        expect(document.getElementById('track-image')).toBeNull();
    });
    test('Render active with alwaysShowControls', async () => {
        await alwaysShowControls.set(true);
        render(App, { screenActive: true });
        // Present
        expect(document.getElementsByTagName('main').length).toBeTruthy();
        // Absent
        expect(document.getElementById('track-image')).toBeNull();
    });
    test('Render with artworkFillMode contain', async () => {
        await artworkFillMode.set('contain');
        render(App, { screenActive: false });
        // Present
        expect(document.getElementById('track-image')?.style.objectFit === 'contain').toBeTruthy();
        expect(document.getElementById('lowres-image')).not.toBeNull();
    });
    test('Render with artworkFillMode cover', async () => {
        await artworkFillMode.set('cover');
        render(App, { screenActive: false });
        // Present
        expect(document.getElementById('track-image')?.style.objectFit === 'cover').toBeTruthy();
        // Absent
        expect(document.getElementById('lowres-image')).toBeNull();
    });
});
