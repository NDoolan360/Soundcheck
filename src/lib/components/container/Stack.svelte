<script lang="ts">
	import { unfocusActive } from "$lib/utils";

	export let type = "div";
	export let height = "100%";
	export let width = "100%";
	export let padding = "0";
	export let margin = "0";
	export let gap = "0";
	export let color = "inherit";
	export let background = "inherit";
	export let center = false;
	const adjustedHeight = `calc(${height} - 2 * ${margin})`;
	const adjustedWidth = `calc(${width} - 2 * ${margin})`;
</script>

<svelte:element
	this={type}
	style:height={adjustedHeight}
	style:width={adjustedWidth}
	style:padding
	style:margin
	style:gap
	style:color
	style:background
	style:justify-content={center ? "center" : "space-between"}
	data-tauri-drag-region
	on:mousedown={unfocusActive}
	{...$$restProps}
>
	<slot />
</svelte:element>

<style>
	* {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
