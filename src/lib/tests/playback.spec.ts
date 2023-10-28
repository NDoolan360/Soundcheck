import { reloadAll, type Loadable, type WritableLoadable } from '@square/svelte-store';
import { mockIPC } from '@tauri-apps/api/mocks';
import {
    activeDevice,
    authenticated,
    currentType,
    deepLink,
    devices,
    disallows,
    displayedProgress,
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
    loading,
} from '../playback';
import { cloneObject } from '../utils';
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
import { get } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockState: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockDevices: any[];
let mockAuth: boolean = false;

const setGlobal = async (auth: boolean, stateType: string) => {
    switch (stateType) {
        case 'track':
            mockState = cloneObject(MOCK_TRACK_STATE);
            break;
        case 'episode':
            mockState = cloneObject(MOCK_EPISODE_STATE);
            break;
        default:
            mockState = null;
    }
    mockDevices = cloneObject(MOCK_DEVICE_LIST);
    mockAuth = auth;

    await reloadAll([authenticated, state, devices, activeDevice, progress]);
};

beforeAll(() => {
    mockIPC((cmd, args) => {
        switch (cmd) {
            case 'is_authenticated':
                return mockAuth;
            case 'authenticate':
                mockAuth = true;
                return true;
            case 'deauthenticate':
                mockAuth = false;
                return false;
            case 'get_playback_state':
                return mockState;
            case 'get_device_list':
                return mockDevices;
            case 'set_device':
                mockState.device.id = args.deviceId as string;
                mockDevices.forEach((dev) => (dev.is_active = dev.id === args.deviceId));
                break;
            case 'seek':
                mockState.progress_ms = args.progress as number;
                break;
            case 'set_playing':
                mockState.is_playing = args.playState as boolean;
                break;
            case 'set_shuffle':
                mockState.shuffle_state = args.shuffleState as boolean;
                break;
            case 'set_repeat':
                mockState.repeat_state = args.repeatState as RepeatState;
                break;
            case 'set_liked':
                // TODO
                break;
            case 'check_liked':
                // TODO
                break;
            case 'set_volume':
                mockState.device.volume_percent = args.volumePercent as number;
                mockDevices.find((dev) => dev.id === mockState.device.id).volume_percent = args.volumePercent as number;
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
        setValue?: { value: T; expected: (value: T) => Promise<void> }[];
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
        Promise.all(
            scenarios.setValue!.map(async (testValue): Promise<void> => {
                test(`Set ${label}: ${testValue.value}`, async () => {
                    await setGlobal(true, 'track');
                    await (store as WritableLoadable<T>).set(testValue.value);
                    testValue.expected(testValue.value);
                });
            })
        );
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
        setValue: [
            {
                value: 'test-device-id-1',
                expected: async () => {
                    expect(mockState.device.id).toBe('test-device-id-1');
                    expect(mockDevices.find((dev) => dev.is_active).id).toBe('test-device-id-1');
                },
            },
            {
                value: 'test-device-id-2',
                expected: async () => {
                    expect(mockState.device.id).toBe('test-device-id-2');
                    expect(mockDevices.find((dev) => dev.is_active).id).toBe('test-device-id-2');
                },
            },
        ],
    });
    testWithScenarios('progress', progress, {
        getWithAuth: { value: MOCK_TRACK_STATE.progress_ms },
        getWithoutAuth: { value: 0 },
        setValue: [
            {
                value: 10000,
                expected: async () => expect(mockState.progress_ms).toBe(10000),
            },
            {
                value: 100000,
                expected: async () => expect(mockState.progress_ms).toBe(100000),
            },
        ],
    });
    testWithScenarios('displayed progress', displayedProgress, {
        getWithAuth: { value: MOCK_TRACK_STATE.progress_ms },
        getWithoutAuth: { value: 0 },
        setValue: [
            {
                value: 10000,
                expected: async () => {
                    expect(mockState.progress_ms).toBe(MOCK_TRACK_STATE.progress_ms);
                    expect(get(displayedProgress)).toBe(10000);
                },
            },
            {
                value: MOCK_TRACK_STATE.item.duration_ms + 10000,
                expected: async () => {
                    expect(mockState.progress_ms).toBe(MOCK_TRACK_STATE.progress_ms);
                    expect(get(displayedProgress)).toBe(MOCK_TRACK_STATE.item.duration_ms);
                    expect(get(loading)).toBe(true);
                },
            },
        ],
    });
    testWithScenarios('playing', playing, {
        getWithAuth: { value: MOCK_TRACK_STATE.is_playing },
        getWithoutAuth: { value: false },
        setValue: [
            {
                value: false,
                expected: async () => expect(mockState.is_playing).toBe(false),
            },
            {
                value: true,
                expected: async () => expect(mockState.is_playing).toBe(true),
            },
        ],
    });
    testWithScenarios('shuffle', shuffle, {
        getWithAuth: { value: MOCK_TRACK_STATE.shuffle_state },
        getWithoutAuth: { value: false },
        setValue: [
            {
                value: false,
                expected: async () => expect(mockState.shuffle_state).toBe(false),
            },
            {
                value: true,
                expected: async () => expect(mockState.shuffle_state).toBe(true),
            },
        ],
    });
    testWithScenarios('repeat', repeat, {
        getWithAuth: { value: MOCK_TRACK_STATE.repeat_state },
        getWithoutAuth: { value: 'off' },
        setValue: [
            {
                value: 'track',
                expected: async () => expect(mockState.repeat_state).toBe('track'),
            },
            {
                value: 'off',
                expected: async () => expect(mockState.repeat_state).toBe('off'),
            },
            {
                value: 'context',
                expected: async () => expect(mockState.repeat_state).toBe('context'),
            },
        ],
    });
    testWithScenarios('liked', liked, {
        getWithoutAuth: { value: false },
        // getWithoutAuth: { value: //TODO },
        // setValue: [{ value: //TODO , expected: async () => // TODO }],
    });
    testWithScenarios('volume', volume, {
        getWithAuth: { value: MOCK_DEVICE_LIST[0].volume_percent },
        getWithoutAuth: { value: 0 },
        setValue: [
            {
                value: 0,
                expected: async () => {
                    expect(mockState.device.volume_percent).toBe(0);
                    expect(mockDevices.find((dev) => dev.is_active).volume_percent).toBe(0);
                },
            },
            {
                value: 100,
                expected: async () => {
                    expect(mockState.device.volume_percent).toBe(100);
                    expect(mockDevices.find((dev) => dev.is_active).volume_percent).toBe(100);
                },
            },
        ],
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
                    url: '/ambient.gif',
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
