<script lang="ts">
	import { LogIn } from "$lib/components/button";
	import { Row, Stack } from "$lib/components/container";
	import { ControlBar, PlayPauseFab } from "$lib/components/controls";
	import { DeviceMenu, MainMenu } from "$lib/components/menu";
	import {
		authenticated,
		autoPoll,
		images,
		optimisticProgress,
		pageWidth,
		preventWidthUpdate,
		subheading,
		title,
	} from "$lib/stores";
	import { schemeToCss } from "$lib/utils";
	import { themeFromImage } from "@material/material-color-utilities";
	import { safeLoad } from "@square/svelte-store";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

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

	const themeFromURL = async (source: string) => {
		const blob = await fetch(source).then((response) => response.blob());
		let image = new Image(64);
		image.src = URL.createObjectURL(blob);

		const theme = await themeFromImage(image);
		return schemeToCss(theme.schemes.dark);
	};

	$: themeFromURL($images[2].url)
		.then((theme) => {
			document.body.setAttribute(
				"style",
				`--background-image: url(${get(images)[0].url});` + theme
			);
		});
</script>

<Stack height="100vh" width="100vw" margin="0.35rem" padding="0.35rem">
	<Row height="1.5rem">
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
		opacity: 0.8;
		box-shadow: inset var(--on-primary) 0 0 min(25vw, 25vh);
	}
</style>
