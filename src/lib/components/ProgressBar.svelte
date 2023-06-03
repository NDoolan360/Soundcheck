<script lang="ts">
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

	const progress = writable(0);
	const duration = writable(100000);
	const playing = writable(true);

	afterUpdate(() => {
		if (!scrubbing && progressBar?.value != undefined)
			progressBar.value = $progress.toString();
	});

	$: if (!scrubbing) {
		thumbProgress = $progress;
	}
	$: thumbCenter =
		(!$duration ? 0 : thumbProgress / $duration) * (sliderWidth - 6) + 3;
	$: disabled = $disable || $duration == 0;
</script>

<span
	class="max middle-align"
	style:--value="{Math.min(thumbCenter, sliderWidth)}px"
>
	<Wave
		running={playing}
		amplitude={6}
		wavelength={32}
		frequency={1 / 3}
		thickness={7}
	/>
	<label bind:clientWidth={sliderWidth} class="slider no-margin">
		<input
			bind:this={progressBar}
			on:change={() => {
				scrubbing = false;
				dispatch("action", Number(progressBar.value));
				$progress = Number(progressBar.value);
			}}
			on:input={() => {
				scrubbing = true;
				thumbProgress = Number(progressBar.value);
			}}
			type="range"
			max={$duration}
			{disabled}
		/>
		<div class="time tooltip round tiny-padding fill medium-elevate">
			{prettyTime(thumbProgress)} / {prettyTime($duration)}
		</div>
	</label>
</span>

<style>
	/* tooltip */
	.time {
		height: fit-content;
		left: 0;
		translate: var(--value) 40%;
		transition: none;
	}
	input[type="range"]:disabled + .time {
		display: none;
	}
	/* slider */
	input[type="range"] {
		height: 4px;
		background: linear-gradient(
			to right,
			transparent var(--value),
			var(--active) var(--value)
		);
	}
	/* slider thumb */
	input[type="range"]::-webkit-slider-thumb {
		box-shadow: var(--elevate2) !important;
		height: 1.25rem;
		width: 6px;
		border-radius: 3px;
		background: currentColor;
	}
	input[type="range"]:disabled::-webkit-slider-thumb {
		color: var(--outline);
	}
	input[type="range"]:focus-visible::-webkit-slider-thumb {
		outline: var(--active) solid 4px;
	}
</style>
