<svelte:options namespace="svg" />

<script lang="ts">
	import { tweened, type Readable } from 'svelte/motion';
	import './styles/default-scheme.css';
	import { optional } from '../utils';
	import type { Linecap, ProgressColorOptions } from './types';

	const shrink = (node: Element) => {
		const sw = parseFloat(getComputedStyle(node).strokeWidth);
		return {
			css: (t: number) => `stroke-width: ${t * sw}`,
		};
	};
	const duration = <T extends number>(from: T, to: T): number =>
		Math.abs(from - to) * 10;
	const circleAtts = {
		cx: '50%',
		cy: '50%',
		style: 'r: calc(50% - var(--_thickness) / 2);',
	};
	const lineAtts = {
		x1: '0%',
		x2: '100%',
		y1: '50%',
		y2: '50%',
	};

	export let label: string;
	export let circular: boolean = false;
	export let progress: Readable<number> = tweened<number>(0, { duration });
	export let hidden = false;
	export let indeterminate = false;
	export let slot = optional<string>();

	// Styles
	export let width = optional<string>();
	export let thickness = optional<string>();
	export let linecap = optional<Linecap>();
	export let color: ProgressColorOptions = {};

	$: dynamicElementAtts = circular ? circleAtts : lineAtts;
	$: ariaAttributes = {
		'aria-label': label,
		'aria-valuemin': 0,
		'aria-valuenow': indeterminate ? undefined : $progress,
		'aria-valuemax': 100,
	};
</script>

<svg
	style:--sm3-comp-progress-size-width={width}
	style:--sm3-comp-progress-size-thickness={thickness}
	style:--sm3-comp-progress-style-linecap={linecap}
	style:--sm3-comp-progress-color-track={color.track}
	style:--sm3-comp-progress-color-indicator={color.indicator}
	class:circular
	class:indeterminate
	class:linear={!circular}
	role="progressbar"
	{...ariaAttributes}
	{...{ slot }}
>
	{#if !hidden}
		<svelte:element
			this={circular ? 'circle' : 'line'}
			class="track"
			role="presentation"
			{...dynamicElementAtts}
			transition:shrink
		/>
		<svelte:element
			this={circular ? 'circle' : 'line'}
			style:--sm3-val-progress={$progress > 0 ? $progress : ''}
			class="indicator"
			pathLength="99.99"
			role="presentation"
			{...dynamicElementAtts}
			transition:shrink
		/>
	{/if}
</svg>

<style>
	svg {
		display: block;
		overflow: visible;

		--_thickness: var(--sm3-comp-progress-size-thickness, 4px);
	}

	svg.linear {
		width: var(--sm3-comp-progress-size-width, 100%);
		height: var(--_thickness);
	}

	svg.circular {
		width: var(--sm3-comp-progress-size-width, 48px);
		height: var(--sm3-comp-progress-size-width, 48px);
		transform: rotate(-90deg);
	}

	svg * {
		fill: transparent;
		stroke-linecap: var(--sm3-comp-progress-style-linecap, butt);
		stroke-width: var(--_thickness);
		transition: stroke-dashoffset 0.4s;
	}

	.indicator {
		stroke: var(
			--sm3-comp-progress-color-indicator,
			rgb(var(--sm3-scheme-color-primary))
		);
		stroke-dasharray: calc(1px * var(--sm3-val-progress, 0)),
			calc(1px * (100 - var(--sm3-val-progress, 0)));
	}

	line.track {
		stroke: var(
			--sm3-comp-progress-color-track,
			rgb(var(--sm3-scheme-color-surface-container-highest))
		);
	}

	circle.track {
		stroke: var(--sm3-comp-progress-color-track, transparent);
	}

	svg.indeterminate line.indicator {
		animation: linear-indeterminate 2.5s infinite;
	}

	svg.indeterminate circle.indicator {
		animation:
			circular-spin infinite calc(8s / 5) linear,
			circular-expand-contract infinite calc(4s / 3)
				cubic-bezier(0.4, 0, 0.2, 1),
			circular-delayed-rotate infinite calc(16s / 3)
				cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}

	@keyframes linear-indeterminate {
		0% {
			animation-timing-function: cubic-bezier(0.65, 0.8, 0.7, 0.34);
			stroke-dasharray: 0, 100px;
			stroke-dashoffset: 0;
		}

		60% {
			animation-timing-function: cubic-bezier(0.15, 0.85, 0.45, 1);
			stroke-dasharray: 70px, 50px;
			stroke-dashoffset: -100;
		}

		100% {
			stroke-dasharray: 0, 100px;
			stroke-dashoffset: -200;
		}
	}

	@keyframes circular-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes circular-expand-contract {
		0%,
		100% {
			stroke-dasharray: 2.778px, 97.222;
		}

		50% {
			stroke-dasharray: 75px, 25px;
		}
	}

	@keyframes circular-delayed-rotate {
		0%,
		12.5% {
			stroke-dashoffset: 0;
		}

		25%,
		37.5% {
			stroke-dashoffset: -75;
		}

		50%,
		62.5% {
			stroke-dashoffset: -150;
		}

		75%,
		87.5% {
			stroke-dashoffset: -225;
		}

		100% {
			stroke-dashoffset: -300;
		}
	}
</style>
