import { newSettingStore } from './utils';

export const darkMode = newSettingStore('darkMode', true);
export const keepOnTop = newSettingStore('keepOnTop', true);
export const alwaysShowControls = newSettingStore('alwaysShowControls', false);
export const alwaysShowArtwork = newSettingStore('alwaysShowArtwork', false);
export const artworkFillMode = newSettingStore('artworkFillMode', 'contain');
