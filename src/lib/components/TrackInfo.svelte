<script lang="ts">
	import { currentItem, currentType, state, trackId } from "$lib/stores";
	import { derived, get } from "@square/svelte-store";

	let title = derived(currentItem, ($i) => $i?.name ?? "");
	let subheading = derived(trackId, () => {
		if (get(currentType) == "episode")
			return (<SpotifyApi.EpisodeObject>get(currentItem)).show.name ?? "";
		else if (get(currentType) == "track")
			return (<SpotifyApi.TrackObjectFull>get(currentItem)).artists
				.map((a) => a.name)
				.join(", ");
		else return "";
	});
</script>

<hgroup class="left-align medium-line">
	<h1 class="large-text">{$title}</h1>
	<p class="medium-text">{$subheading}</p>
</hgroup>

<style>
	hgroup {
		flex: 1 1 auto;
		width: fit-content;
		overflow: hidden;
		mask-image: linear-gradient(90deg, #000 80%, transparent);
		-webkit-mask-image: linear-gradient(90deg, #000 80%, transparent);
	}
	hgroup > * {
		transform: scale(1.15) translateX(7.5%);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
