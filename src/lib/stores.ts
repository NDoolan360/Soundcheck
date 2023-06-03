import { derived, writable } from 'svelte/store';
import { pollingWritable } from './PollingWritable';

export const state = pollingWritable({} as SpotifyApi.CurrentPlaybackResponse | undefined, 5, 4);
export const like = pollingWritable(false, 5);
export const authenticated = pollingWritable(false, 1800);

export const pageWidth = writable(0);

export const playing = state.derive((state) => state?.is_playing ?? false);
export const device = state.derive((state) => state?.device ?? { type: 'undefined' } as SpotifyApi.UserDevice);
export const isEpisode = state.derive((state) => state?.currently_playing_type === 'episode');

export const disallows = <T>(fn: (values: SpotifyApi.DisallowsObject | undefined) => T) => {
    return derived(state.derive((state) => state?.actions?.disallows), fn);
}
export const currentImage = (resolution: (1 | 2 | 3) = 1) => state.derive((state) => {
    switch (state?.currently_playing_type) {
        case 'track':
            return (state?.item as SpotifyApi.TrackObjectFull)?.album.images[--resolution].url;
        case 'episode':
            return (state?.item as SpotifyApi.EpisodeObject)?.images[--resolution].url;
    }
    return './ambient.gif';
})
