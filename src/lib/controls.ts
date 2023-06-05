import { derived, get, readable, type Readable } from "svelte/store";
import {
	disallows,
	isEpisode,
	like,
	pageWidth,
	playing,
	repeat,
	shuffle,
	state,
	type RepeatState,
} from "./stores";
import type { ComponentType } from "svelte";
import IconButton from "$lib/components/IconButton.svelte";
import ProgressBar from "$lib/components/ProgressBar.svelte";
import { invoke } from "@tauri-apps/api";
import { nextRepeat } from "./utils";

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
	!isEpisode
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
		action: () => {},
		props: {
			icon: readable("replay_30"),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	prev: {
		component: IconButton,
		action: () => {},
		props: {
			icon: readable("skip_previous"),
			disable: derived(disallows, (d) => !d || d.skipping_prev),
		},
	},
	progress: {
		component: ProgressBar,
		action: () => {},
		wrapperClass: "max row",
		props: {
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	play_pause: {
		component: IconButton,
		action: () => {
			const playState = !get(playing);
			playing.set(playState);
			invoke<boolean>("set_playing", { playState })
				.then(playing.set)
				.catch(console.error);
		},
		props: {
			icon: derived(state, (s) =>
				s?.is_playing ? "pause" : "play_arrow"
			),
			disable: derived(disallows, (d) => !d),
		},
	},
	next: {
		component: IconButton,
		action: () => {},
		props: {
			icon: readable("skip_next"),
			disable: derived(disallows, (d) => !d || d.skipping_next),
		},
	},
	forward_30: {
		component: IconButton,
		action: () => {},
		props: {
			icon: readable("forward_30"),
			disable: derived(disallows, (d) => !d || d.seeking),
		},
	},
	shuffle: {
		component: IconButton,
		action: () => {
			const shuffleState = !get(shuffle);
			shuffle.set(shuffleState);
			invoke<boolean>("set_shuffle", { shuffleState })
				.then(shuffle.set)
				.catch(console.error);
		},
		props: {
			icon: readable("shuffle"),
			active: derived(state, (s) => s?.shuffle_state ?? false),
			disable: derived(disallows, (d) => !d || d.toggling_shuffle),
		},
	},
	repeat: {
		component: IconButton,
		action: () => {
			const repeatState = nextRepeat(get(repeat));
			repeat.set(repeatState);
			invoke<RepeatState>("set_repeat", { repeatState })
				.then(repeat.set)
				.catch(console.error);
		},
		props: {
			icon: derived(state, (state) =>
				state?.repeat_state == "track" ? "repeat_one" : "repeat"
			),
			active: derived(state, (s) => (s?.repeat_state ?? "off") != "off"),
			disable: derived(
				disallows,
				(d) =>
					!d || d.toggling_repeat_context || d.toggling_repeat_track
			),
		},
	},
	favourite: {
		component: IconButton,
		action: () => {
			const likeState = !get(like);
			const trackId = get(state)?.item?.id;
			like.update((v) => !v);
			invoke<boolean>("set_like", { likeState, trackId })
				.then(like.set)
				.catch(console.error);
		},
		props: {
			icon: readable("favorite"),
			disable: derived(state, (s) => s?.item?.id == undefined),
			fill: like,
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
