<script lang="ts">
	import ActionButton from "$lib/components/ActionButton.svelte";
	import Controls from "$lib/components/Controls.svelte";
	import DynamicBackground from "$lib/components/DynamicBackground.svelte";
	import LogIn from "$lib/components/LogIn.svelte";
	import Menu from "$lib/components/Menu.svelte";
	import MenuItem from "$lib/components/MenuItem.svelte";
	import TrackInfo from "$lib/components/TrackInfo.svelte";
	import VolumeControl from "$lib/components/VolumeControl.svelte";
	import { mainMenu, spotifyWavePath } from "$lib/menu";
	import {
		authenticated,
		deviceIcon,
		like,
		pageWidth,
		playing,
		progress as progress_ms,
		state,
	} from "$lib/stores";
	import { callFunctionWhen, prettyTime, typeToIcon } from "$lib/utils";
	import { invoke } from "@tauri-apps/api";
	import { onDestroy, onMount } from "svelte";
	import { derived } from "svelte/store";

	const unsubState = callFunctionWhen(authenticated, () =>
		invoke<SpotifyApi.CurrentPlaybackResponse>("get_playback_state")
			.then(state.set)
			.catch(console.error)
	);
	const unsubKeepAlive = callFunctionWhen(
		derived(playing, (p) => !p),
		() => {
			console.info(prettyTime(Date.now()), "ping");
			const progress = $progress_ms ?? 0;
			invoke<number>("seek", { progress })
				.then(progress_ms.set)
				.catch(console.error);
		},
		25000
	);
	const unsubLike = callFunctionWhen(playing, () => {
		const trackId = $state?.item?.id;
		if (!trackId) return;
		invoke<boolean>("check_like", { trackId })
			.then(like.set)
			.catch(console.error);
	});

	let widthInterval: number;
	onMount(() => {
		widthInterval = setInterval(
			() => pageWidth.set(window.innerWidth),
			250
		);
	});
	onDestroy(() => {
		clearInterval(widthInterval);
		unsubState();
		unsubKeepAlive();
		unsubLike();
	});
</script>

<DynamicBackground />
<div class="fixed drag-region" data-tauri-drag-region />
<nav class="top transparent no-padding small-margin">
	<Menu align="right">
		<svg slot="icon" viewBox="0 0 240 240">
			<path d={spotifyWavePath} />
		</svg>
		{#each mainMenu as item}
			<MenuItem {...item} />
		{/each}
	</Menu>
	<Menu icon={deviceIcon} align="left">
		<VolumeControl />
		{#each { length: 2 } as device}
			<MenuItem
				icon={typeToIcon("computer")}
				text={"Example Device"}
				action={() => {}}
			/>
		{/each}
	</Menu>
</nav>

<main class="fixed middle row margin-sides small-margin center-align">
	{#if !$authenticated}
		<LogIn />
	{:else}
		<TrackInfo />
		<ActionButton />
	{/if}
</main>

<nav class="bottom align-center transparent no-padding small-margin">
	<Controls />
</nav>

<style>
	nav {
		height: fit-content;
		gap: clamp(0px, calc(11.5vw - 18.4px), 1rem);
		justify-content: space-between;
	}
	nav,
	main {
		width: calc(100% - 1rem);
		left: 50%;
		translate: calc(-50% - 0.5rem);
		max-width: 600px;
		pointer-events: none; /* allow drag region */
	}
	nav.bottom {
		z-index: 99;
	}
	:global(:not(nav, main, hgroup)) {
		pointer-events: all; /* ignore drag region */
	}
	.drag-region {
		top: 0.3rem;
		bottom: 0.3rem;
		left: 0.3rem;
		right: 0.3rem;
	}
</style>
