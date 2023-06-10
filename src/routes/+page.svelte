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
		autoPoll,
		pageWidth,
		state,
		playing,
		optimisticProgress,
	} from "$lib/stores";
	import { deviceTypeToIcon } from "$lib/utils";
	import { safeLoad } from "@square/svelte-store";
	import { onMount } from "svelte";
	import { derived } from "@square/svelte-store";

	let widthInterval: number;
	onMount(() => {
		widthInterval = setInterval(
			() => pageWidth.set(window.innerWidth),
			250
		);
		const clearAutoPoll = autoPoll(5000);
		const stopOptimiticUpdate = optimisticProgress(1000);
		return () => {
			clearInterval(widthInterval);
			clearAutoPoll();
			stopOptimiticUpdate();
		};
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
	<Menu
		icon={derived(state, (state) => deviceTypeToIcon(state?.device?.type))}
		align="left"
	>
		<VolumeControl />
		{#each { length: 2 } as device}
			<MenuItem
				icon={deviceTypeToIcon("computer")}
				text={"Example Device"}
				action={() => {}}
			/>
		{/each}
	</Menu>
</nav>

<main class="fixed middle row margin-sides small-margin center-align">
	{#await safeLoad(authenticated) then}
		{#if !$authenticated}
			<LogIn />
		{:else}
			<TrackInfo />
			<ActionButton />
		{/if}
	{/await}
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
