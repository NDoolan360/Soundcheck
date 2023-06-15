<script lang="ts">
	import { state, volume } from "$lib/stores";
	import { Volume, Volume1, Volume2, VolumeX } from "lucide-svelte";
	import Row from "../container/Row.svelte";
	import { getMenuOptions } from "../menu/context";

	let slider: HTMLInputElement;
	let scrubbing = false;
	let thumbProgress: number;
	let sliderWidth: number;

	let size = getMenuOptions().size ?? "1.75rem";
	let iconSize = `calc(${size} - 0.25rem)`;

	$: if (!scrubbing) thumbProgress = $volume;
	$: thumbCenter = (thumbProgress / 100) * (sliderWidth - 24) + 12;

	const restrictedInputTypes = ["smartphone"];
	$: disabled =
		!$state?.device?.is_active ||
		restrictedInputTypes.includes($state?.device?.type.toLowerCase());
</script>

<Row --slider-size={size}>
	<span class="slider-wrapper" bind:clientWidth={sliderWidth}>
		<input
			class="slider"
			bind:this={slider}
			on:change={() => {
				scrubbing = false;
				$volume = Number(slider.value);
			}}
			on:input={() => {
				scrubbing = true;
				thumbProgress = Number(slider.value);
			}}
			type="range"
			value={$volume}
			style:--value="{thumbCenter}px"
			max="100"
			step="5"
			{disabled}
		/>
	</span>
	<span class="icon">
		{#if disabled}
			<VolumeX size={iconSize} />
		{:else if thumbProgress == 0}
			<Volume size={iconSize} />
		{:else if (thumbProgress ?? 0) < 50}
			<Volume1 size={iconSize} />
		{:else}
			<Volume2 size={iconSize} />
		{/if}
	</span>
</Row>

<style>
	.slider-wrapper {
		width: 100%;
		height: var(--slider-size);
	}
	.slider {
		width: 100%;
		background: transparent;
		appearance: none;
		-webkit-appearance: none;
		border-radius: var(--slider-size);
	}
	.slider::-webkit-slider-runnable-track {
		height: var(--slider-size);
		border-radius: var(--slider-size);
		background: linear-gradient(
			to right,
			var(--primary-container) var(--value),
			var(--on-primary-container) var(--value)
		);
	}
	.slider::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		background: var(--primary-container);
		height: var(--slider-size);
		width: var(--slider-size);
		border: none;
		border-radius: 50%;
	}
	.icon {
		min-height: var(--slider-size);
		min-width: var(--slider-size);
		color: var(--primary);

		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	.slider:disabled {
		background: var(--active);
		cursor: not-allowed !important;
	}
	.slider:disabled::-webkit-slider-runnable-track {
		--value: 0;
	}
	.slider:disabled::-webkit-slider-thumb {
		background: var(--active);
	}
</style>
