<script lang="ts">
	import { disallows, playing } from "$lib/stores";
	import { derived } from "@square/svelte-store";
	import { Button } from "../button";
	import controls from "./controls";
</script>

{#if !$controls.find((c) => c.id == "play_pause")}
	<Button
		size="5rem"
		on:click={() => ($playing = !$playing)}
		shape={$playing ? undefined : "circle"}
		disable={derived(disallows, (d) => !d)}
	>
		<svg height="2.5rem" viewBox="0 0 24 24" class="tiny">
			<path
				d={$playing
					? "M6 19 10 19 10 5 6 5ZM14 19 18 19 18 5 14 5Z"
					: "M8 19 12 16.5 12 7.5 8 5ZM12 16.5 19 12 19 12 12 7.5Z"}
				style:transition="d var(--speed)"
			/>
		</svg>
	</Button>
{/if}
