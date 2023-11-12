import { asyncDerived, asyncWritable, derived } from '@square/svelte-store';
import { invoke, window } from '@tauri-apps/api';
import ambient from '/ambient.svg?url';

type State = SpotifyApi.CurrentPlaybackResponse | null;
export type RepeatState = 'track' | 'context' | 'off';

export const authenticated = asyncWritable(
    [],
    async () => await invoke<boolean>('is_authenticated'),
    async (newAuth) =>
        await invoke<boolean>(newAuth ? 'authenticate' : 'deauthenticate', {
            window,
        }),
    { reloadable: true, initial: false }
);

export const state = asyncDerived(
    authenticated,
    async ($auth) => ($auth ? await invoke<State>('get_playback_state') : null),
    { reloadable: true, initial: null }
);

export const devices = asyncDerived(
    authenticated,
    async ($auth) => (!$auth ? [] : await invoke<SpotifyApi.UserDevice[]>('get_device_list')),
    { reloadable: true, initial: [] }
);

const currentItem = derived(state, ($s) => $s?.item);
export const duration = derived(currentItem, ($i) => $i?.duration_ms ?? 0);
export const trackId = derived(currentItem, ($i) => $i?.id);
export const currentType = derived(state, ($s) => $s?.currently_playing_type);
export const images = derived([currentItem, currentType, trackId], ([$currentItem, $currentType]) => {
    if ($currentType == 'episode') return ($currentItem as SpotifyApi.EpisodeObject).images;
    else if ($currentType == 'track') return ($currentItem as SpotifyApi.TrackObjectFull).album.images;
    else return [{ url: ambient, width: 361, height: 361 }];
});

export const title = derived(currentItem, ($i) => $i?.name ?? '');
export const subheading = derived([currentItem, currentType, trackId], ([$currentItem, $currentType]) => {
    if ($currentType == 'episode') return ($currentItem as SpotifyApi.EpisodeObject)?.show?.name;
    else if ($currentType == 'track')
        return ($currentItem as SpotifyApi.TrackObjectFull)?.artists.map((a) => a.name).join(', ');
    else return '';
});

export const songLink = derived([currentType, trackId], ([$type, $trackId]) =>
    $type && $trackId ? `https://open.spotify.com/${$type}/${$trackId}` : undefined
);
export const deepLink = derived([currentType, trackId], ([$type, $trackId]) =>
    $type && $trackId ? `spotify://${$type}/${$trackId}` : undefined
);

export const activeDevice = asyncWritable(
    state,
    async ($state) => $state?.device?.id ?? null,
    async (newDeviceId) => invoke('set_device', { deviceId: newDeviceId }),
    { reloadable: true, initial: null }
);

export const progress = asyncWritable(
    state,
    async ($state) => $state?.progress_ms ?? 0,
    async (newProgress) => invoke<void>('seek', { progress: newProgress }),
    { initial: 0 }
);
export const playing = asyncWritable(
    state,
    async ($state) => $state?.is_playing ?? false,
    async (newPlayState) => invoke<void>('set_playing', { playState: newPlayState }),
    { initial: false }
);
export const shuffle = asyncWritable(
    state,
    async ($state) => $state?.shuffle_state ?? false,
    async (newShuffleState) => invoke<void>('set_shuffle', { shuffleState: newShuffleState }),
    { initial: false }
);
export const repeat = asyncWritable(
    state,
    async ($state) => ($state?.repeat_state ?? 'off') as RepeatState,
    async (newRepeatState) => invoke<void>('set_repeat', { repeatState: newRepeatState }),
    { initial: 'off' as RepeatState }
);
export const liked = asyncWritable(
    trackId,
    async ($trackId) => (!$trackId ? false : await invoke<boolean>('check_liked', { trackId: $trackId })),
    async (likedState, $trackId) => {
        if ($trackId) return invoke<void>('set_liked', { trackId: $trackId, likedState });
    },
    { initial: false }
);
export const volume = asyncWritable(
    state,
    async ($state) => $state?.device?.volume_percent ?? 0,
    async (newVolumePercent) => invoke<void>('set_volume', { volumePercent: newVolumePercent }),
    { initial: 0 }
);

export const disallows = derived(state, ($state) => {
    const disallowArray = ($state?.actions?.disallows as string[]) ?? { includes: () => true };
    return {
        playPause: $state?.is_playing ? disallowArray.includes('pausing') : disallowArray.includes('resuming'),
        seeking: disallowArray.includes('seeking'),
        skippingNext: disallowArray.includes('skipping_next'),
        skippingPrev: disallowArray.includes('skipping_prev'),
        changeVolume: $state?.device?.id === undefined,
        link: $state?.item?.id === undefined,
        togglingLike: $state?.item?.id === undefined,
        togglingRepeat:
            (disallowArray.includes('toggling_repeat_context') && disallowArray.includes('toggling_repeat_track')) ||
            ($state?.repeat_state === 'context' && disallowArray.includes('toggling_repeat_context')) ||
            ($state?.repeat_state === 'track' && disallowArray.includes('toggling_repeat_track')),
        togglingShuffle: disallowArray.includes('toggling_shuffle'),
        transferringPlayback: disallowArray.includes('transferring_playback'),
        interruptingPlayback: disallowArray.includes('interrupting_playback'),
    };
});
