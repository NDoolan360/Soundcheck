import type { Loadable, WritableLoadable } from '@square/svelte-store';
import { mockIPC } from '@tauri-apps/api/mocks';
import {
    activeDevice,
    authenticated,
    currentType,
    deepLink,
    devices,
    duration,
    images,
    liked,
    playing,
    progress,
    repeat,
    shuffle,
    songLink,
    state,
    subheading,
    title,
    trackId,
    volume,
    type RepeatState,
    disallows,
} from '../stores';
import {
    MOCK_AUTH_DISALLOWS,
    MOCK_DEVICE_LIST,
    MOCK_EPISODE_DEEP_LINK,
    MOCK_EPISODE_SONG_LINK,
    MOCK_EPISODE_STATE,
    MOCK_TRACK_DEEP_LINK,
    MOCK_TRACK_SONG_LINK,
    MOCK_TRACK_STATE,
    MOCK_UNAUTH_DISALLOWS,
} from './test.data';
import { cloneObject } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mock_state: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mock_devices: any[];
let mock_auth: boolean = false;

const setGlobal = async (auth: boolean, stateType: string) => {
    switch (stateType) {
        case 'track':
            mock_state = cloneObject(MOCK_TRACK_STATE);
            break;
        case 'episode':
            mock_state = cloneObject(MOCK_EPISODE_STATE);
            break;
        default:
            mock_state = null;
    }
    mock_devices = cloneObject(MOCK_DEVICE_LIST);

    await authenticated.set(auth);
    await state.reload!();
    await devices.reload!();
};

beforeEach(() => {
    mockIPC((cmd, args) => {
        switch (cmd) {
            case 'is_authenticated':
                return mock_auth;
            case 'authenticate':
                mock_auth = true;
                return true;
            case 'deauthenticate':
                mock_auth = false;
                return false;
            case 'get_playback_state':
                return mock_state;
            case 'get_device_list':
                return mock_devices;
            case 'set_device':
                mock_state.device.id = args.deviceId as string;
                mock_devices.forEach((dev) => (dev.is_active = dev.id === args.deviceId));
                break;
            case 'seek':
                mock_state.progress_ms = args.progress as number;
                break;
            case 'set_playing':
                mock_state.is_playing = args.playState as boolean;
                break;
            case 'set_shuffle':
                mock_state.shuffle_state = args.shuffleState as boolean;
                break;
            case 'set_repeat':
                mock_state.repeat_state = args.repeatState as RepeatState;
                break;
            case 'set_liked':
                // TODO
                break;
            case 'check_liked':
                // TODO
                break;
            case 'set_volume':
                mock_state.device.volume_percent = args.volumePercent as number;
                mock_devices.find((dev) => dev.id === mock_state.device.id).volume_percent =
                    args.volumePercent as number;
                break;
        }
    });
});

const testWithScenarios = <T>(
    label: string,
    store: Loadable<T>,
    scenarios: {
        getWithTrack?: { value: unknown };
        getWithEpisode?: { value: unknown };
        getWithAuth?: { value: unknown };
        getWithoutAuth?: { value: unknown };
        setValue?: { value: T; expectedOutcome: () => Promise<boolean> };
    }
) => {
    if (scenarios.getWithTrack)
        test(`Get ${label} with track state`, async () => {
            await setGlobal(true, 'track');
            const value = await store.load();
            expect(value).toStrictEqual(scenarios.getWithTrack!.value);
        });
    if (scenarios.getWithEpisode)
        test(`Get ${label} with episode state`, async () => {
            await setGlobal(true, 'episode');
            const value = await store.load();
            expect(value).toStrictEqual(scenarios.getWithEpisode!.value);
        });
    if (scenarios.getWithAuth)
        test(`Get ${label} with auth`, async () => {
            await setGlobal(true, 'track');
            const value = await store.load();
            expect(value).toStrictEqual(scenarios.getWithAuth!.value);
        });
    if (scenarios.getWithoutAuth)
        test(`Get ${label} without auth`, async () => {
            await setGlobal(false, 'track');
            const value = await store.load();
            expect(value).toStrictEqual(scenarios.getWithoutAuth!.value);
        });
    if (scenarios.setValue) {
        test(`Set ${label}`, async () => {
            await setGlobal(true, 'track');
            await (store as WritableLoadable<T>).set(scenarios.setValue!.value);
            const outcome = await scenarios.setValue?.expectedOutcome();
            expect(outcome).toBeTruthy();
        });
    }
};

describe('Data Stores', () => {
    testWithScenarios('authenticated', authenticated, {
        getWithAuth: { value: true },
        getWithoutAuth: { value: false },
    });
    testWithScenarios('playback state', state, {
        getWithTrack: { value: MOCK_TRACK_STATE },
        getWithEpisode: { value: MOCK_EPISODE_STATE },
        getWithoutAuth: { value: null },
    });
    testWithScenarios('devices', devices, {
        getWithAuth: { value: MOCK_DEVICE_LIST },
        getWithoutAuth: { value: [] },
    });
});

describe('Interactive Data Stores', () => {
    testWithScenarios('active device', activeDevice, {
        getWithAuth: { value: MOCK_DEVICE_LIST[0].id },
        getWithoutAuth: { value: null },
        setValue: {
            value: 'test-device-id-2',
            expectedOutcome: async () =>
                mock_state.device.id === 'test-device-id-2' &&
                mock_devices.find((dev) => dev.is_active).id === 'test-device-id-2',
        },
    });
    testWithScenarios('progress', progress, {
        getWithAuth: { value: MOCK_TRACK_STATE.progress_ms },
        getWithoutAuth: { value: 0 },
        setValue: {
            value: 10000,
            expectedOutcome: async () => mock_state.progress_ms === 10000,
        },
    });
    testWithScenarios('playing', playing, {
        getWithAuth: { value: MOCK_TRACK_STATE.is_playing },
        getWithoutAuth: { value: false },
        setValue: {
            value: false,
            expectedOutcome: async () => mock_state.is_playing === false,
        },
    });
    testWithScenarios('shuffle', shuffle, {
        getWithAuth: { value: MOCK_TRACK_STATE.shuffle_state },
        getWithoutAuth: { value: false },
        setValue: {
            value: false,
            expectedOutcome: async () => mock_state.shuffle_state === false,
        },
    });
    testWithScenarios('repeat', repeat, {
        getWithAuth: { value: MOCK_TRACK_STATE.repeat_state },
        getWithoutAuth: { value: 'off' },
        setValue: {
            value: 'track',
            expectedOutcome: async () => mock_state.repeat_state === 'track',
        },
    });
    testWithScenarios('liked', liked, {
        getWithoutAuth: { value: false },
        // getWithoutAuth: { value: //TODO },
        // setValue: { value: //TODO , expectedOutcome: async () => // TODO },
    });
    testWithScenarios('volume', volume, {
        getWithAuth: { value: MOCK_DEVICE_LIST[0].volume_percent },
        getWithoutAuth: { value: 0 },
        setValue: {
            value: 100,
            expectedOutcome: async () =>
                mock_state.device.volume_percent === 100 &&
                mock_devices.find((dev) => dev.is_active).volume_percent === 100,
        },
    });
});

describe('Derived Stores', () => {
    testWithScenarios('duration', duration, {
        getWithAuth: { value: MOCK_TRACK_STATE.item.duration_ms },
        getWithoutAuth: { value: 0 },
    });
    testWithScenarios('track Id', trackId, {
        getWithAuth: { value: MOCK_TRACK_STATE.item.id },
        getWithoutAuth: { value: undefined },
    });
    testWithScenarios('current Type', currentType, {
        getWithAuth: { value: MOCK_TRACK_STATE.currently_playing_type },
        getWithoutAuth: { value: undefined },
    });
    testWithScenarios('images', images, {
        getWithTrack: { value: MOCK_TRACK_STATE.item.album.images },
        getWithEpisode: { value: MOCK_EPISODE_STATE.item.images },
        getWithoutAuth: {
            value: [
                {
                    height: 361,
                    url: '/ambient.svg',
                    width: 361,
                },
            ],
        },
    });
    testWithScenarios('title', title, {
        getWithAuth: { value: MOCK_TRACK_STATE.item.name },
        getWithoutAuth: { value: '' },
    });
    testWithScenarios('subheading', subheading, {
        getWithTrack: { value: MOCK_TRACK_STATE.item.artists[0].name },
        getWithEpisode: { value: MOCK_EPISODE_STATE.item.show.name },
        getWithoutAuth: { value: '' },
    });
    testWithScenarios('disallows', disallows, {
        getWithTrack: { value: MOCK_AUTH_DISALLOWS },
        getWithEpisode: { value: MOCK_AUTH_DISALLOWS },
        getWithoutAuth: { value: MOCK_UNAUTH_DISALLOWS },
    });
});

describe('Generated Links', () => {
    testWithScenarios('song Link', songLink, {
        getWithTrack: { value: MOCK_TRACK_SONG_LINK },
        getWithEpisode: { value: MOCK_EPISODE_SONG_LINK },
        getWithoutAuth: { value: undefined },
    });
    testWithScenarios('deep Link', deepLink, {
        getWithTrack: { value: MOCK_TRACK_DEEP_LINK },
        getWithEpisode: { value: MOCK_EPISODE_DEEP_LINK },
        getWithoutAuth: { value: undefined },
    });
});
