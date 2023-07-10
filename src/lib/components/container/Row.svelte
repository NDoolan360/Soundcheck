<script lang="ts">
	import { unfocusActive } from "$lib/utils";

	export let height = "auto";
	export let width = "100%";
	export let padding = "0";
	export let margin = "0";
	export let gap = "0";
	export let center = false;
</script>

<div
	style:height
	style:width
	style:padding
	style:margin
	style:gap
	style:justify-content={center ? "center" : "space-between"}
	data-tauri-drag-region
	role="none"
	on:mousedown={unfocusActive}
	{...$$restProps}
>
	<slot />
</div>

<style>
	* {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
</style>
