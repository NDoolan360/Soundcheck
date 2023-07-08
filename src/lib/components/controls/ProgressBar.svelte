<script lang="ts">
	import { displayedProgress, duration, playing } from "$lib/stores";
	import { prettyTime } from "$lib/utils";
	import { afterUpdate, createEventDispatcher } from "svelte";
	import { writable } from "svelte/store";
	import Wave from "./Wave.svelte";

	const dispatch = createEventDispatcher();

	export let disable = writable(false);
	let progressBar: HTMLInputElement;
	let scrubbing = false;
	let thumbProgress: number;
	let sliderWidth: number;

	afterUpdate(() => {
		if (!scrubbing && progressBar?.value != undefined)
			progressBar.value = ($displayedProgress ?? 0).toString();
	});

	$: if (!scrubbing) thumbProgress = $displayedProgress;

	$: disabled = $disable || $duration == 0;
	$: thumbCenter = disabled
		? 0
		: (!$duration ? 0 : thumbProgress / $duration) * (sliderWidth - 6) + 3;
</script>

<span
	class="progress-bar-wrapper"
	style:--value="{Math.min(thumbCenter, sliderWidth)}px"
>
	<Wave
		running={playing}
		amplitude={6}
		wavelength={32}
		frequency={1 / 3}
		thickness={7}
	/>
	<label bind:clientWidth={sliderWidth} class="slider-wrapper">
		<input
			class="slider"
			bind:this={progressBar}
			on:change={() => {
				scrubbing = false;
				dispatch("click", Number(progressBar.value));
			}}
			on:input={() => {
				scrubbing = true;
				thumbProgress = Number(progressBar.value);
			}}
			type="range"
			max={$duration}
			{disabled}
		/>
		<div class="time">
			{prettyTime(thumbProgress)} / {prettyTime($duration)}
		</div>
	</label>
</span>

<style>
	.progress-bar-wrapper {
		color: white;
		display: flex;
		justify-content: start;
		align-items: center;
	}
	.slider-wrapper {
		width: 100%;
		margin: 0;
		display: flex;
		align-items: center;
	}

	.time {
		position: absolute;
		height: fit-content;
		pointer-events: none;
		user-select: none;
		top: 0;
		left: 0;
		translate: calc(var(--value) - 50%) -150%;
		color: var(--on-surface-variant);
		background-color: var(--surface-variant);
		padding: 0.25rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
	}
	.slider:is(:not(:hover), :disabled) + .time {
		display: none;
	}

	.slider {
		width: 100%;
		appearance: none;
		-webkit-appearance: none;
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(
			to right,
			transparent var(--value),
			#ffffff75 var(--value)
		);
	}
	.slider::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		box-shadow: var(--elevate) !important;
		height: 1.25rem;
		width: 6px;
		border-radius: 3px;
		background: white;
	}
	.slider:disabled {
		background: white;
		opacity: 0.25;
		--value:
	}
	.slider:disabled::-webkit-slider-thumb {
		display: none;
	}
	.slider:focus-visible::-webkit-slider-thumb {
		outline: var(--active) solid 4px;
	}
</style>
