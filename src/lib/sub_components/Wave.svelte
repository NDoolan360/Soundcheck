<svelte:options namespace="svg" />

<script lang="ts">
    import { tweened } from 'svelte/motion';

    export let amplitude: number;
    export let frequency: number;
    export let thickness: number;
    export let wavelength: number;
    export let animate: boolean;
    export let width: string;

    let svg: SVGSVGElement;
    let tween = tweened(amplitude);
    let d = '';

    $: {
        if (animate) {
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

<svg bind:this={svg} height="{amplitude + thickness}px" style:width preserveAspectRatio="xMidYMid meet">
    <defs>
        <pattern
            id="sine"
            viewBox="0 0 {wavelength * 2} {amplitude * 2}"
            width={wavelength}
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            patternUnits="userSpaceOnUse"
        >
            <path {d} stroke="currentColor" stroke-width="{thickness}px" fill="none" />
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
    }
</style>
