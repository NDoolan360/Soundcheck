<script>
	import "beercss";
	import "material-dynamic-colors";
</script>

<slot />

<style>
	:global(*) {
		user-select: none;
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

	:global(.mini) {
		min-height: 1.5rem;
		max-height: 1.5rem;
		min-width: 1.5rem;
		max-width: 1.5rem;
	}

	:global(.no-radius) {
		border-radius: 0 !important;
	}

	:global(.padding-sides) {
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}

	:global(.margin-sides) {
		margin-top: 0 !important;
		margin-bottom: 0 !important;
	}
</style>
