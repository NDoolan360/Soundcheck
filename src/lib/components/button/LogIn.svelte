<script lang="ts">
	import { Loader2, LogInIcon } from "lucide-svelte";
	import { Button } from ".";
	import { authenticated } from "../../stores";

	let loading: boolean = false;
	const authenticate = async () => {
		loading = true;
		await authenticated.set(false);
		loading = false;
	};
</script>

<Button on:click={authenticate}>
	{#if loading}
		<Loader2>
			<animateTransform
				attributeName="transform"
				type="rotate"
				dur="1s"
				from="0"
				to="360"
				repeatCount="indefinite"
			/>
		</Loader2>
	{:else}
		<LogInIcon />
	{/if}
	<span slot="extend">
		{#if !loading}
			Log in
		{/if}
	</span>
</Button>
