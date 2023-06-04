import { derived, readable, type Readable } from 'svelte/store';
import { disallows, isEpisode, like, pageWidth, state } from './stores';
import type { ComponentType } from 'svelte';
import IconButton from "$lib/components/IconButton.svelte";
import ProgressBar from "$lib/components/ProgressBar.svelte";

type Control = {
    component: ComponentType;
    action: () => void;
    wrapperClass?: string;
    props: {
        icon?: Readable<string>;
        active?: Readable<boolean>;
        disable?: Readable<boolean>;
        fill?: Readable<boolean>;
    };
};

const controlMap = derived(isEpisode, (isEpisode) =>
    !isEpisode ? {
        "prev": [0, Infinity],
        "play_pause": [0, 250],
        "progress": [320, Infinity],
        "next": [0, Infinity],
        "favourite": [0, Infinity],
        "shuffle": [190, Infinity],
        "repeat": [250, Infinity]
    } : {
        "replay_30": [0, Infinity],
        "prev": [190, Infinity],
        "play_pause": [0, 250],
        "progress": [320, Infinity],
        "next": [0, Infinity],
        "forward_30": [0, Infinity]
    });

const controls = {
    replay_30: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("replay_30"),
            disable: disallows((d) => d?.seeking ?? true),
        },
    },
    prev: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("skip_previous"),
            disable: disallows((d) => d?.skipping_prev ?? true),
        },
    },
    progress: {
        component: ProgressBar,
        action: () => { },
        wrapperClass: "max row",
        props: {
            disable: disallows((d) => d?.seeking ?? true),
        },
    },
    play_pause: {
        component: IconButton,
        action: () => { },
        props: {
            icon: state.derive((state) => state?.is_playing ? "pause" : "play_arrow"),
            disable: disallows(
                (d) => (d?.pausing ?? true) || (d?.resuming ?? true)
            ),
        },
    },
    next: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("skip_next"),
            disable: disallows((d) => d?.skipping_next ?? true),
        },
    },
    forward_30: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("forward_30"),
            disable: disallows((d) => d?.seeking ?? true),
        },
    },
    shuffle: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("shuffle"),
            active: state.derive((state) => state?.shuffle_state ?? false),
            disable: disallows((d) => d?.toggling_shuffle ?? true),
        },
    },
    repeat: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("repeat"),
            active: state.derive(
                (state) => (state?.repeat_state ?? "off") != "off"
            ),
            disable: disallows(
                (d) =>
                    (d?.toggling_repeat_context ?? true) ||
                    (d?.toggling_repeat_track ?? true)
            ),
        },
    },
    favourite: {
        component: IconButton,
        action: () => { },
        props: {
            icon: readable("favorite"),
            disable: state.derive((state) => state?.item?.id === undefined),
            fill: like.derive((like) => like),
        },
    },
} as { [key: string]: Control };

export const lowerControls = derived([pageWidth, controlMap],
    ([pageWidth, controlMap]) =>
        Object.entries(controlMap)
            .filter(([_, [lo, hi]]) => lo < pageWidth && pageWidth <= hi)
            .map(([key, _]) => ({
                id: key,
                ...controls[key],
            })) as ({ id: string } & Control)[]
)