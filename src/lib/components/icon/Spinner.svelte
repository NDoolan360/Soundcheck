<script lang="ts">
	import { Loader2 } from "lucide-svelte";
</script>

<Loader2 {...$$props}>
	<animateTransform
		attributeName="transform"
		type="rotate"
		dur="1s"
		from="0"
		to="360"
		repeatCount="indefinite"
	/>
</Loader2>
