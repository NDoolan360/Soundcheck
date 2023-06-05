<script lang="ts">
	import { device, deviceIcon, volume } from "$lib/stores";
	import { throttle } from "$lib/utils";
	import { invoke } from "@tauri-apps/api";

	let slider: HTMLInputElement;
	let sliderWidth: number;
	let thumbCenter: string;

	const inputAction = (e: { currentTarget: HTMLInputElement }) => {
		const volumePercent = Number(e.currentTarget.value);
		volume.set(volumePercent);
		throttle(() => {
			invoke<number>("set_volume", { volumePercent })
				.then(volume.set)
				.catch(console.error);
		}, 300)();
	};

	$: if ($volume != undefined)
		thumbCenter = ($volume / 100) * (sliderWidth - 30) + 10 + "px";

	const forbiddenTypes = ["smartphone"];
	$: disabled = !$device.is_active || forbiddenTypes.includes($deviceIcon);
</script>

<label
	class="slider small-padding no-margin no-radius fill"
	bind:clientWidth={sliderWidth}
>
	<input
		bind:this={slider}
		on:input={inputAction}
		type="range"
		value={$volume}
		style:--value={thumbCenter}
		max="100"
		step="5"
		{disabled}
	/>
	<span class="row middle-align no-margin transparent">
		<i class="tiny fill">
			{#if disabled}
				volume_off
			{:else if $device.volume_percent == 0}
				volume_mute
			{:else if ($device.volume_percent ?? 0) < 50}
				volume_down
			{:else}
				volume_up
			{/if}
		</i>
		{$device.name ?? ""}
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
