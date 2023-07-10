import {
	asyncDerived,
	asyncWritable,
	derived,
	reloadAll,
	type Loadable,
} from "@square/svelte-store";
import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { get, writable } from "svelte/store";

type State = SpotifyApi.CurrentPlaybackResponse | null;
export type RepeatState = "off" | "track" | "context";

export const pageWidth = writable(0);
export const preventWidthUpdate = writable(false);
export const displayedProgress = writable(0);

export function optimisticProgress(frequency: number) {
	const interval = setInterval(() => {
		if (get(playing)) {
			if (get(displayedProgress) + frequency > get(duration)) {
				state.reload && state.reload();
			} else {
				displayedProgress.update((p) => p + frequency);
			}
		}
	}, frequency);
	return () => clearInterval(interval);
}

export const authenticated = asyncWritable(
	[],
	async () => await invoke<boolean>("is_authenticated"),
	async () => await invoke<boolean>("authenticate", { window: appWindow }),
	{ reloadable: true }
);

export const devices = asyncDerived(
	[],
	async () => await invoke<SpotifyApi.UserDevice[]>("get_device_list"),
	{ reloadable: true }
);

export const state = asyncDerived(
	authenticated,
	async ($auth) => {
		if (!$auth) return null;
		const state = await invoke<State>("get_playback_state");
		displayedProgress.set(state?.progress_ms ?? 0);
		return state;
	},
	{ reloadable: true }
);

export const reloadState = () => reloadAll(state);

export function autoPoll(frequency: number) {
	const interval = setInterval(reloadState, frequency);
	return () => clearInterval(interval);
}

export const disallows = derived(state, ($s) => $s?.actions.disallows);
export const currentType = derived(state, ($s) => $s?.currently_playing_type);
export const currentItem = derived(state, ($s) => $s?.item);
export const duration = derived(currentItem, ($i) => $i?.duration_ms ?? 0);
export const trackId = derived(currentItem, ($i) => $i?.id);
export const images: Loadable<SpotifyApi.ImageObject[]> = derived(
	trackId,
	() => {
		if (get(currentType) == "episode")
			return (<SpotifyApi.EpisodeObject>get(currentItem)).images;
		else if (get(currentType) == "track")
			return (<SpotifyApi.TrackObjectFull>get(currentItem)).album.images;
		else return new Array(3).fill({ url: "./ambient.gif" });
	}
);
export const title = derived(currentItem, ($i) => $i?.name ?? "");
export const subheading = derived(trackId, () => {
	if (get(currentType) == "episode")
		return (<SpotifyApi.EpisodeObject>get(currentItem)).show.name ?? "";
	else if (get(currentType) == "track")
		return (<SpotifyApi.TrackObjectFull>get(currentItem)).artists
			.map((a) => a.name)
			.join(", ");
	else return "";
});
export let songLink = derived([currentType, trackId], ([$type, $trackId]) =>
	$type && $trackId
		? `https://open.spotify.com/${$type}/${$trackId}`
		: undefined
);

export const progress = asyncWritable(
	state,
	async ($state) => $state?.progress_ms ?? 0,
	async (progress) => {
		displayedProgress.set(progress);
		invoke<void>("seek", { progress });
	}
);

export const playing = asyncWritable(
	state,
	async ($state) => $state?.is_playing ?? false,
	async (playState) => invoke<void>("set_playing", { playState })
);

export const shuffle = asyncWritable(
	state,
	async ($state) => $state?.shuffle_state ?? false,
	async (shuffleState) => invoke<void>("set_shuffle", { shuffleState })
);

export const repeat = asyncWritable(
	state,
	async ($state) => ($state?.repeat_state as RepeatState) ?? false,
	async (repeatState) => invoke<void>("set_repeat", { repeatState })
);

export const liked = asyncWritable(
	trackId,
	async ($trackId) =>
		!$trackId
			? false
			: await invoke<boolean>("check_liked", { trackId: $trackId }),
	async (likedState, $trackId) => {
		if ($trackId)
			return invoke<void>("set_liked", { trackId: $trackId, likedState });
	}
);

export const volume = asyncWritable(
	state,
	async ($state) => $state?.device?.volume_percent ?? 0,
	async (volumePercent) => invoke<void>("set_volume", { volumePercent })
);
