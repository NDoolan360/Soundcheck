<script lang="ts">
	import { tweened } from "svelte/motion";
	import type { Readable } from "svelte/store";

	export let amplitude: number;
	export let frequency: number;
	export let thickness: number;
	export let wavelength: number;
	export let running: Readable<boolean>;

	let svg: SVGSVGElement;
	let tween = tweened(0);

	$: {
		if ($running) {
			tween.set(-amplitude);
			if (svg) svg.unpauseAnimations();
		} else {
			tween.set(amplitude).then(() => {
				if (svg) svg.pauseAnimations();
			});
		}
	}

	$: d = `M${-wavelength / 2} ${amplitude}
			Q0 ${$tween} ${wavelength / 2} ${amplitude}
			T${(wavelength * 3) / 2} ${amplitude}
			T${(wavelength * 5) / 2} ${amplitude}`;
</script>

<svg
	bind:this={svg}
	height="{amplitude + thickness}px"
	width={wavelength}
	preserveAspectRatio="xMidYMid meet"
>
	<defs>
		<pattern
			id="sine"
			viewBox="0 0 {wavelength * 2} {amplitude * 2}"
			width={wavelength}
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			patternUnits="userSpaceOnUse"
		>
			<path
				{d}
				stroke="currentColor"
				stroke-width="{thickness}px"
				fill="none"
			/>
			<animateTransform
				attributeName="patternTransform"
				to="-{wavelength}"
				dur="{1 / frequency}s"
				repeatCount="indefinite"
			/>
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#sine)" />
</svg>

<style>
	svg {
		position: absolute;
		width: var(--value);
	}
</style>
