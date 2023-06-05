<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { readable, type Readable } from "svelte/store";
	import { fly } from "svelte/transition";

	const dispatch = createEventDispatcher();

	export let icon: Readable<string> = readable("");
	export let active: Readable<boolean> = readable(false);
	export let disable: Readable<boolean> = readable(false);
	export let fill: Readable<boolean> = readable(false);
	let _class = "small transparent round square no-margin";
	export { _class as class };
	export let iconSize: string = "";
</script>

<button
	class={_class}
	in:fly
	on:click={() => dispatch("action")}
	disabled={$disable}	
	{...$$restProps}
>
	<slot name="icon">
		<i class={iconSize} class:fill={$fill}>{$icon}</i>
		{#if $active}
			<i class="indicator fill">circle</i>
		{/if}
	</slot>
	<slot />
</button>

<style>
	button {
		height: 2rem;
		width: 2rem;
	}
	button:hover::after,
	button:focus::after {
		background-color: var(--active);
	}
	.indicator {
		color: inherit;
		position: absolute;
		scale: 0.2;
		transform: translateY(275%);
	}
</style>
