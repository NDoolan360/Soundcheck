import { invoke } from "@tauri-apps/api";
import { derived, writable } from "svelte/store";
import subStore from "./subStore";
import { typeToIcon } from "./utils";

export type RepeatState = "off" | "track" | "context";

export const state = writable<SpotifyApi.CurrentPlaybackResponse | null>(
	null as SpotifyApi.CurrentPlaybackResponse | null
);
export const authenticated = writable(false);
invoke("is_authenticated")
	.then(authenticated.set as (v: unknown) => void)
	.catch(console.error);

export const pageWidth = writable(0);

export const playing = subStore<boolean, any>(state, "is_playing");
export const progress = subStore<number, any>(state, "progress_ms");
export const volume = subStore<number, any>(state, "device.volume_percent");
export const like = writable(false);
export const shuffle = subStore<boolean, any>(state, "shuffle_state");
export const repeat = subStore<RepeatState, any>(state, "repeat_state");

export const duration = derived(state, (s) => s?.item?.duration_ms ?? 0);
export const isEpisode = derived(
	state,
	(s) => s?.currently_playing_type == "episode"
);
export const disallows = derived(state, (s) => s?.actions?.disallows);
export const device = derived(
	state,
	(s) => s?.device ?? ({ type: "undefined" } as SpotifyApi.UserDevice)
);
export const deviceIcon = derived(device, (device: SpotifyApi.UserDevice) =>
	typeToIcon(device.type)
);
export const currentImage = (resolution: 0 | 1 | 2 = 0) =>
	derived([state, isEpisode], ([s, episode]) => {
		let out = undefined;
		if (!episode) {
			out = (s?.item as SpotifyApi.TrackObjectFull)?.album?.images[
				resolution
			]?.url;
		} else if (episode) {
			out = (s?.item as SpotifyApi.EpisodeObject)?.images[resolution]
				?.url;
		}
		return out ?? "./ambient.gif";
	});
