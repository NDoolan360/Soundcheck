<script lang="ts">
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import { setButtonOptions } from "../button/context";
	import { Row } from "../container";
	import controls from "./controls";
	import { preventWidthUpdate } from "$lib/stores";

	setButtonOptions("2rem", "white", "transparent");
</script>

<Row>
	{#each $controls as control (control.id)}
		<span
			animate:flip={{ duration: 800 }}
			in:fly={{ y: 15, delay: 400 }}
			on:introstart={() => ($preventWidthUpdate = true)}
			on:introend={() => ($preventWidthUpdate = false)}
			class:grow={control.id == "progress"}
		>
			<svelte:component
				this={control.component}
				on:click={control.click}
				{...control.props}
			/>
		</span>
	{/each}
</Row>

<style>
	.grow {
		flex: 1 1 auto;
		max-width: 40vw;
	}
</style>
