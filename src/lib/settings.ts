import { newSettingStore } from './utils';

export let darkMode = newSettingStore('darkMode', true);
export let keepOnTop = newSettingStore('keepOnTop', true);
export let interactiveOnHover = newSettingStore('interactiveOnHover', true);
export let alwaysShowArtwork = newSettingStore('alwaysShowArtwork', false);
export let artworkFillMode = newSettingStore('artworkFillMode', 'contain');
