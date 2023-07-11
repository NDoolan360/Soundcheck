<script lang="ts">
	import { unfocusActive } from "$lib/utils";

	export let height = "100%";
	export let width = "100%";
	export let padding = "0";
	export let margin = "0";
</script>

<div
	style:height="calc({height} - 2 * {margin})"
	style:width="calc({width} - 2 * {margin})"
	style:padding
	style:margin
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
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}
</style>
