import {
	currentType,
	disallows,
	displayedProgress,
	duration,
	liked,
	pageWidth,
	playing,
	progress,
	reloadState,
	repeat,
	shuffle,
	trackId,
} from "$lib/stores";
import { nextRepeat } from "$lib/utils";
import { derived } from "@square/svelte-store";
import { invoke } from "@tauri-apps/api";
import {
	Heart,
	Pause,
	Play,
	Repeat,
	Repeat1,
	RotateCcw,
	RotateCw,
	Shuffle,
	SkipBack,
	SkipForward,
} from "lucide-svelte";
import type { ComponentType } from "svelte";
import { get, readable, type Readable } from "svelte/store";
import { DynamicIcon } from "../icon";
import ProgressBar from "./ProgressBar.svelte";

type Control = {
	component: ComponentType;
	click: (value?: any) => void;
	props: {
		icon?: Readable<ComponentType>;
		fill?: Readable<boolean>;
		indicator?: Readable<boolean>;
		disable?: Readable<boolean>;
	};
};

const controlMap = derived(currentType, (currentType) => {
	return {
		track: {
			prev: [0, Infinity],
			play_pause: [0, 250],
			progress: [320, Infinity],
			next: [0, Infinity],
			shuffle: [190, Infinity],
			repeat: [380, Infinity],
			favourite: [0, Infinity],
		},
		episode: {
			replay_30: [0, Infinity],
			prev: [190, Infinity],
			play_pause: [0, 250],
			progress: [320, Infinity],
			next: [0, Infinity],
			forward_30: [0, Infinity],
		},
		ad: {},
		unknown: {},
	}[currentType ?? "track"];
});

const control_list = {
	replay_30: {
		component: DynamicIcon,
		click: () => progress.update((p) => Math.max(0, p - 30000)),
		props: {
			icon: readable(RotateCcw),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	prev: {
		component: DynamicIcon,
		click: () => {
			if (get(displayedProgress) < 3000)
				invoke("previous_track").then(() =>
					setTimeout(reloadState, 1000)
				);
			else progress.set(0);
		},
		props: {
			icon: readable(SkipBack),
			disable: derived(disallows, (d) => !d || d.skipping_prev),
		},
	},
	progress: {
		component: ProgressBar,
		click: ({ detail }) => progress.set(detail),
		props: {
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	play_pause: {
		component: DynamicIcon,
		click: () => playing.update((p) => !p),
		props: {
			icon: derived(playing, (p) => (p ? Pause : Play)),
			disable: derived(disallows, ($d) => !$d),
		},
	},
	next: {
		component: DynamicIcon,
		click: () =>
			invoke("next_track").then(() => setTimeout(reloadState, 1000)),
		props: {
			icon: readable(SkipForward),
			disable: derived(disallows, (d) => !d || d.skipping_next),
		},
	},
	forward_30: {
		component: DynamicIcon,
		click: () => progress.update((p) => Math.min(p + 30000, get(duration))),
		props: {
			icon: readable(RotateCw),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	shuffle: {
		component: DynamicIcon,
		click: () => shuffle.update((s) => !s),
		props: {
			icon: readable(Shuffle),
			indicator: shuffle,
			disable: derived(disallows, (d) => !d || d.toggling_shuffle),
		},
	},
	repeat: {
		component: DynamicIcon,
		click: () => repeat.update(nextRepeat),
		props: {
			icon: derived(repeat, (r) => (r == "track" ? Repeat1 : Repeat)),
			indicator: derived(repeat, (r) => (r ?? "off") != "off"),
			disable: derived(
				disallows,
				(d) =>
					!d || d.toggling_repeat_context || d.toggling_repeat_track
			),
		},
	},
	favourite: {
		component: DynamicIcon,
		click: () => liked.update((l) => !l),
		props: {
			icon: readable(Heart),
			disable: derived(trackId, ($t) => $t == undefined),
			fill: liked,
		},
	},
} as { [key: string]: Control };

const controls = derived(
	[pageWidth, controlMap],
	([pageWidth, controlMap]) =>
		Object.entries(controlMap)
			.filter(([_, [lo, hi]]) => lo < pageWidth && pageWidth <= hi)
			.map(([key, _]) => ({
				id: key,
				...control_list[key],
			})) as ({ id: string } & Control)[]
);

export default controls;
