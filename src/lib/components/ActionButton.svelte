<script lang="ts">
	import IconButton from "$lib/components/IconButton.svelte";
	import { lowerControls } from "$lib/controls";
	import { disallows, liked, playing, state } from "$lib/stores";
	import { derived } from "@square/svelte-store";

	const action = () => ($playing = !$playing);
</script>

{#if !$lowerControls.find((c) => c.id == "play_pause")}
	<IconButton
		class="extra {$playing ? 'round square' : 'circle'}"
		on:action={action}
		disable={derived(disallows, (d) => !d)}
	>
		<svg slot="icon" viewBox="0 0 24 24" class="tiny">
			<path
				d={$playing
					? "M6 19 10 19 10 5 6 5ZM14 19 18 19 18 5 14 5Z"
					: "M8 19 12 16.5 12 7.5 8 5ZM12 16.5 19 12 19 12 12 7.5Z"}
				style:transition="d var(--speed3)"
			/>
		</svg>
	</IconButton>
{/if}
