<script lang="ts">
	import { state, volume } from "$lib/stores";
	import { afterUpdate } from "svelte";

	let slider: HTMLInputElement;
	let scrubbing = false;
	let thumbProgress: number;
	let sliderWidth: number;

	$: if (!scrubbing) thumbProgress = $volume;

	$: thumbCenter = (thumbProgress / 100) * (sliderWidth - 30) + 10;

	const restrictedInputTypes = ["smartphone"];
	$: disabled =
		!$state?.device?.is_active ||
		restrictedInputTypes.includes($state?.device?.type);
</script>

<label
	class="slider small-padding no-margin no-radius fill"
	bind:clientWidth={sliderWidth}
>
	<input
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
	<span class="row middle-align no-margin transparent">
		<i class="tiny fill">
			{#if disabled}
				volume_off
			{:else if $state?.device.volume_percent == 0}
				volume_mute
			{:else if ($state?.device.volume_percent ?? 0) < 50}
				volume_down
			{:else}
				volume_up
			{/if}
		</i>
		{$state?.device.name ?? ""}
	</span>
</label>

<style>
	label {
		height: fit-content;
		min-width: 9rem;
	}
	span {
		width: 100%;
		white-space: nowrap !important;
		z-index: 101;
		gap: 0.25rem;
		padding-left: 0.125rem;
		pointer-events: none;
		width: calc(100% - 1.5rem);
		translate: 0 -4.5px;
		height: fit-content;
		overflow: hidden;
	}
	i {
		pointer-events: none;
		color: var(--primary);
	}
	input {
		height: 100%;
		background: linear-gradient(
			to right,
			var(--primary-container) var(--value),
			var(--inverse-primary) var(--value)
		);
	}
	input:disabled {
		background: var(--active);
		cursor: not-allowed !important;
	}
	input::-webkit-slider-thumb {
		background-color: var(--primary-container);
	}
	input:disabled::-webkit-slider-thumb {
		background: transparent;
	}
</style>
