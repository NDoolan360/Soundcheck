import IconButton from "$lib/components/IconButton.svelte";
import ProgressBar from "$lib/components/ProgressBar.svelte";
import { derived } from "@square/svelte-store";
import { invoke } from "@tauri-apps/api";
import type { ComponentType } from "svelte";
import { get, readable, type Readable } from "svelte/store";
import {
	currentType,
	disallows,
	duration,
	liked,
	pageWidth,
	playing,
	progress,
	repeat,
	shuffle,
	state,
	trackId,
} from "./stores";
import { nextRepeat } from "./utils";

type Control = {
	component: ComponentType;
	action: (value?: any) => void;
	wrapperClass?: string;
	props: {
		icon?: Readable<string>;
		active?: Readable<boolean>;
		disable?: Readable<boolean>;
		fill?: Readable<boolean>;
	};
};

const controlMap = derived(currentType, (currentType) =>
	currentType == undefined || currentType == "track"
		? {
				prev: [0, Infinity],
				play_pause: [0, 250],
				progress: [320, Infinity],
				next: [0, Infinity],
				favourite: [0, Infinity],
				shuffle: [190, Infinity],
				repeat: [250, Infinity],
		  }
		: {
				replay_30: [0, Infinity],
				prev: [190, Infinity],
				play_pause: [0, 250],
				progress: [320, Infinity],
				next: [0, Infinity],
				forward_30: [0, Infinity],
		  }
);

const controls = {
	replay_30: {
		component: IconButton,
		action: () => progress.update((p) => Math.max(0, p - 30000)),
		props: {
			icon: readable("replay_30"),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	prev: {
		component: IconButton,
		action: () =>
			invoke("previous_track").finally(() => state && state.reload!()),
		props: {
			icon: readable("skip_previous"),
			disable: derived(disallows, (d) => !d || d.skipping_prev),
		},
	},
	progress: {
		component: ProgressBar,
		action: ({ detail }) => progress.set(detail),
		wrapperClass: "max row",
		props: {
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	play_pause: {
		component: IconButton,
		action: () => playing.update((p) => !p),
		props: {
			icon: derived(playing, (p) => (p ? "pause" : "play_arrow")),
			disable: derived(disallows, ($d) => !$d),
		},
	},
	next: {
		component: IconButton,
		action: () =>
			invoke("next_track").finally(() => state && state.reload!()),
		props: {
			icon: readable("skip_next"),
			disable: derived(disallows, (d) => !d || d.skipping_next),
		},
	},
	forward_30: {
		component: IconButton,
		action: () =>
			progress.update((p) => Math.min(p + 30000, get(duration))),
		props: {
			icon: readable("forward_30"),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	shuffle: {
		component: IconButton,
		action: () => shuffle.update((s) => !s),
		props: {
			icon: readable("shuffle"),
			active: shuffle,
			disable: derived(disallows, (d) => !d || d.toggling_shuffle),
		},
	},
	repeat: {
		component: IconButton,
		action: () => repeat.update(nextRepeat),
		props: {
			icon: derived(repeat, (r) =>
				r == "track" ? "repeat_one" : "repeat"
			),
			active: derived(repeat, (r) => (r ?? "off") != "off"),
			disable: derived(
				disallows,
				(d) =>
					!d || d.toggling_repeat_context || d.toggling_repeat_track
			),
		},
	},
	favourite: {
		component: IconButton,
		action: () => liked.update((l) => !l),
		props: {
			icon: readable("favorite"),
			disable: derived(trackId, ($t) => $t == undefined),
			fill: liked,
		},
	},
} as { [key: string]: Control };

export const lowerControls = derived(
	[pageWidth, controlMap],
	([pageWidth, controlMap]) =>
		Object.entries(controlMap)
			.filter(([_, [lo, hi]]) => lo < pageWidth && pageWidth <= hi)
			.map(([key, _]) => ({
				id: key,
				...controls[key],
			})) as ({ id: string } & Control)[]
);
