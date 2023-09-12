<script lang="ts">
	import { prettyTime } from '../utils';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	import '../sm3lte/styles/default-scheme.css';
	import '../sm3lte/styles/elevation.css';
	import Wave from './Wave.svelte';

	const dispatch = createEventDispatcher();

	export let progress = 0;
	export let playing = false;
	export let duration = 100;
	export let disabled = false;
	let progressBar: HTMLInputElement;
	let scrubbing = false;
	let thumbProgress: number;
	let sliderWidth: number;

	afterUpdate(() => {
		if (!scrubbing && progressBar?.value != undefined) progressBar.value = (progress ?? 0).toString();
	});

	$: if (!scrubbing) thumbProgress = progress;

	$: willDisable = disabled || duration == 0;
	$: thumbCenter = willDisable ? 0 : (!duration ? 0 : thumbProgress / duration) * (sliderWidth - 6) + 3;
	$: progressPos = `${Math.min(thumbCenter, sliderWidth)}px`;
</script>

<span class="progress-bar-wrapper">
	<Wave animate={playing} width={progressPos} amplitude={6} wavelength={32} frequency={1 / 3} thickness={7} />
	<label bind:clientWidth={sliderWidth} class="slider-wrapper">
		<input
			class="slider"
			style:background="linear-gradient(to right, transparent {progressPos}, rgb(var(--sm3-scheme-color-outline)) {progressPos})"
			bind:this={progressBar}
			on:change={() => {
				scrubbing = false;
				dispatch('click', Number(progressBar.value));
			}}
			on:input={() => {
				scrubbing = true;
				thumbProgress = Number(progressBar.value);
			}}
			type="range"
			max={duration}
			disabled={willDisable}
		/>
		<div class="time" style:--translate-x={progressPos}>
			{prettyTime(thumbProgress)} / {prettyTime(duration)}
		</div>
	</label>
</span>

<style>
	.progress-bar-wrapper {
		display: flex;
		flex: 1 1;
		align-items: center;
		justify-content: start;
		color: white;
	}

	.slider-wrapper {
		display: flex;
		width: 100%;
		align-items: center;
		margin: 0;
	}

	.time {
		position: absolute;
		top: 0;
		left: 0;
		height: fit-content;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: rgb(var(--sm3-scheme-color-surface-variant));
		color: rgb(var(--sm3-scheme-color-on-surface-variant));
		font-size: 0.75rem;
		font-weight: 700;
		pointer-events: none;
		translate: calc(var(--translate-x) - 50%) -150%;
		user-select: none;
	}

	.slider:is(:not(:hover), :disabled) + .time {
		display: none;
	}

	.slider {
		width: 100%;
		height: 4px;
		border-radius: 2px;
		appearance: none;
	}

	.slider::-webkit-slider-thumb {
		width: 6px;
		height: 1.25rem;
		border-radius: 3px;
		appearance: none;
		background: white;
		box-shadow: var(--sm3-sys-elevation-level3);
	}

	.slider:focus-visible {
		outline: none;
	}

	.slider:focus-visible::-webkit-slider-thumb {
		background-color: rgb(var(--sm3-scheme-color-outline));
		outline: auto 3px;
	}

	.slider:disabled {
		background: white;
		opacity: 0.25;
	}

	.slider:disabled::-webkit-slider-thumb {
		display: none;
	}
</style>
