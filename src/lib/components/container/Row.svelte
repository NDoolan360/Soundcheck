<script lang="ts">
	import { unfocusActive } from "$lib/utils";
</script>

<div
	data-tauri-drag-region
	role="none"
	on:mousedown={unfocusActive}
	{...$$restProps}
>
	<slot />
</div>

<style>
	* {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
</style>
