<script lang="ts">
	import { currentImage, pageWidth } from "$lib/stores";
	import "beercss";
	import "material-dynamic-colors";
	import { onDestroy, onMount } from "svelte";
	import type { Unsubscriber } from "svelte/store";

	// Default theme
	ui("mode", "dark");
	ui("theme", {
		light: "--primary:#00677d;--on-primary:#fff;--primary-container:#adecff;--on-primary-container:#001f27;--secondary:#4b6269;--on-secondary:#fff;--secondary-container:#cee7f0;--on-secondary-container:#061e25;--tertiary:#585c7d;--on-tertiary:#fff;--tertiary-container:#dde0ff;--on-tertiary-container:#141937;--error:#ba1b1b;--error-container:#ffdad4;--on-error:#fff;--on-error-container:#410001;--background:#fafcfd;--on-background:#191c1d;--surface:#fafcfd;--on-surface:#191c1d;--surface-variant:#dbe4e8;--on-surface-variant:#40484b;--outline:#70797c;--inverse-on-surface:#eff1f2;--inverse-surface:#2e3132;--inverse-primary:#59d6f7;--shadow:#000;",
		dark: "--primary:#4cd9df;--on-primary:#00373a;--primary-container:#004f52;--on-primary-container:#6ef6fc;--secondary:#b1cccd;--on-secondary:#1b3435;--secondary-container:#334b4c;--on-secondary-container:#cce8e9;--tertiary:#b5c7e9;--on-tertiary:#1e314c;--tertiary-container:#354763;--on-tertiary-container:#d3e3ff;--error:#ffb4a9;--error-container:#930006;--on-error:#680003;--on-error-container:#ffdad4;--background:#191c1c;--on-background:#e0e3e3;--surface:#191c1c;--on-surface:#e0e3e3;--surface-variant:#3f4949;--on-surface-variant:#bec8c8;--outline:#899393;--inverse-on-surface:#191c1c;--inverse-surface:#e0e3e3;--inverse-primary:#00696d;--shadow:#000;",
	});

	let background: HTMLImageElement;
	let unsubBackground: Unsubscriber;
	let pageWidthInterval: number;

	const highRes = currentImage(1);
	const lowRes = currentImage(3);
	onMount(() => {
		unsubBackground = highRes.subscribe((src) => {
			(ui("theme", $lowRes) as Promise<IBeerCssTheme>).then(() => {
				background.src = src;
			});
		});
		pageWidthInterval = setInterval(
			() => ($pageWidth = window.innerWidth),
			250
		);
	});
	onDestroy(() => {
		unsubBackground();
		clearInterval(pageWidthInterval);
	});
</script>

<img class="fixed responsive no-padding" alt="" bind:this={background} />
<div class="fixed responsive" />
<slot />

<style>
	div {
		height: 100vh;
		box-shadow: 0 0 100px max(5vw, 5vh) var(--on-primary) inset;
	}
	:global(*:disabled, *:disabled::-webkit-slider-thumb) {
		cursor: auto !important;
	}
	:global(i) {
		font-variation-settings: "FILL" 0 !important;
	}
	:global(.fill) {
		font-variation-settings: "FILL" 1 !important;
	}
</style>
