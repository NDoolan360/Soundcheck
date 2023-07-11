<script lang="ts">
	import { LogIn } from "$lib/components/button";
	import { Row, Stack } from "$lib/components/container";
	import { ControlBar, PlayPauseFab } from "$lib/components/controls";
	import { DeviceMenu, MainMenu } from "$lib/components/menu";
	import {
		authenticated,
		autoPoll,
		optimisticProgress,
		pageWidth,
		preventWidthUpdate,
		subheading,
		title
	} from "$lib/stores";
	import { safeLoad } from "@square/svelte-store";
	import { onMount } from "svelte";

	document.body.setAttribute(
		"style",
		"--background-image: url(./ambient.gif);--primary: #00dce5; --on-primary: #003739; --primary-container: #004f53; --on-primary-container: #62f7ff; --secondary: #b1cccd; --on-secondary: #1b3436; --secondary-container: #324b4c; --on-secondary-container: #cce8e9; --tertiary: #b6c7e9; --on-tertiary: #1f314c; --tertiary-container: #364764; --on-tertiary-container: #d6e3ff; --error: #ffb4ab; --on-error: #690005; --error-container: #93000a; --on-error-container: #ffb4ab; --background: #191c1c; --on-background: #e0e3e3; --surface: #191c1c; --on-surface: #e0e3e3; --surface-variant: #3f4949; --on-surface-variant: #bec8c9; --outline: #899393; --outline-variant: #3f4949; --shadow: #000000; --scrim: #000000; --inverse-surface: #e0e3e3; --inverse-on-surface: #2d3131; --inverse-primary: #00696e;"
	);

	onMount(() => {
		const widthInterval = setInterval(
			() => !$preventWidthUpdate && pageWidth.set(window.innerWidth),
			150
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

<Stack height="100vh" width="100vw" margin="0.35rem" padding="0.35rem">
	<Row>
		<MainMenu />
		<DeviceMenu />
	</Row>
	<Row center={!$authenticated}>
		{#await safeLoad(authenticated) then}
			{#if !$authenticated}
				<LogIn />
			{:else}
				<hgroup style:color="white">
					<h3>{$title}</h3>
					<p>{$subheading}</p>
				</hgroup>
				<PlayPauseFab />
			{/if}
		{/await}
	</Row>
	<ControlBar />
</Stack>

<style>
	hgroup {
		pointer-events: none;
		flex: 1 1 auto;
		overflow: hidden;
		user-select: none;
		mask-image: linear-gradient(90deg, #000 90%, transparent);
		-webkit-mask-image: linear-gradient(90deg, #000 90%, transparent);
	}

	:global(:root) {
		--speed: 0.3s;
		--elevate: 0 0.25rem 0.5rem 0 rgb(0 0 0 / 0.4);
	}

	:global(*) {
		margin: 0;
		padding: 0;
		position: relative;
		white-space: nowrap;
		box-sizing: border-box;
	}

	:global(html, body) {
		height: 100vh;
		overflow: hidden;
	}
	:global(body) {
		font-family: Roboto, "Arial Nova", Arial, sans-serif;
		background-color: var(--on-primary);
	}
	:global(body::before) {
		content: "";
		position: absolute;
		height: 100%;
		width: 100%;
		background-image: var(--background-image, url("./ambient.gif"));
		background-size: cover;
		background-position: center;
		opacity: 0.75;
		box-shadow: inset var(--on-primary) 0 0 min(25vw, 25vh);
	}
</style>
