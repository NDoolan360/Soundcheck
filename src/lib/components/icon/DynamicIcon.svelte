<script lang="ts">
	import { Circle, type Icon } from "lucide-svelte";
	import type { ComponentType } from "svelte";
	import { readable, type Readable } from "svelte/store";
	import { fade } from "svelte/transition";
	import Button from "../button";

	export let icon: Readable<ComponentType & Icon>;
	export let fill: Readable<Boolean> = readable(false);
	export let indicator: Readable<boolean> = readable(false);
	export let disable: Readable<boolean> = readable(false);
</script>

<Button {disable} on:click>
	<svelte:component
		this={$icon}
		fill={$fill ? "currentColor" : "transparent"}
	/>
	{#if indicator && $indicator}
		<span class="indicator" transition:fade>
			<Circle fill="currentColor" />
		</span>
	{/if}
</Button>

<style>
	.indicator {
		position: fixed;
		transform: translateY(50%) scale(0.2);
	}
</style>
