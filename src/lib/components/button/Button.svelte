<script lang="ts">
	import { readable, writable, type Readable } from "svelte/store";
	import { fade, slide } from "svelte/transition";
	import { getMenuOptions } from "../menu/context";
	import { getButtonOptions, setButtonOptions } from "./context";

	type ButtonShape = "square" | "circle" | undefined;

	const options = getButtonOptions();
	export let size = options?.size ?? "2rem";
	export let color = options?.color ?? "var(--on-primary)";
	export let background = options?.background ?? "var(--primary)";
	setButtonOptions(size, color, background);

	export let hoverColor = "white";
	export let height = size;
	export let width = size;

	export let disable: Readable<boolean> = readable(false);
	export let active = getMenuOptions()?.open ?? writable(true);
	export let shape: ButtonShape = undefined;

	export let click: (active: boolean) => boolean | void = () => {};
	export let leave: (active: boolean) => boolean | void = () => {};
</script>

<button
	on:click
	on:focus
	on:focusout
	on:click={() => ($active = click($active) ?? !$active)}
	on:focusout={() => ($active = leave($active) ?? $active)}
	style:color
	style:--hover-color={hoverColor}
	style:background
	style:min-height={height}
	style:min-width={width}
	style:font-size="calc(1 / 2 * {size})"
	class:active={$active}
	class:extend={$$slots.extend}
	class:circle={shape == "circle"}
	class:square={shape == "square"}
	aria-expanded={$active}
	aria-haspopup={$active == undefined ? undefined : true}
	disabled={$disable}
	transition:fade
>
	<slot size={`calc(${size} - 0.5rem)`} />
	{#if $$slots.extend && $active}
		<span
			class="extend text"
			transition:slide|local={{ axis: "x", duration: 300 }}
		>
			<slot name="extend" />
		</span>
	{/if}
</button>

<style>
	button {
		padding: 0;
		outline: none;
		border: none;
		border-radius: 1.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		cursor: pointer;

		transition: border-radius var(--speed), gap var(--speed),
			padding var(--speed);
	}

	button:disabled {
		opacity: 0.25;
		cursor: auto;
	}

	button:not(:disabled):after {
		content: "";
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		border-radius: inherit;
		opacity: 0;
		background-size: 5000%;
		background-position: center;
		background-image: radial-gradient(
			circle,
			var(--hover-color) 1%,
			transparent 1%
		);
	}

	button:is(:focus-visible, :hover):after {
		opacity: 0.4;
		background-size: 14142%;
		transition: background-size ease var(--speed);
	}

	.extend {
		padding: 0 0.5rem;
		max-width: 100%;
	}
	.text {
		padding: 0 0 0 0.35rem;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		text-align: left;
	}
	.square {
		border-radius: 0;
	}
	.circle {
		border-radius: 50%;
	}
</style>
