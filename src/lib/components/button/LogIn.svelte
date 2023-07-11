<script lang="ts">
	import { LogInIcon } from "lucide-svelte";
	import { Button } from ".";
	import { authenticated } from "../../stores";
	import { Spinner } from "../icon";

	let loading: boolean = false;
	const authenticate = async () => {
		loading = true;
		await authenticated.set(false);
		loading = false;
	};
</script>

<Button on:click={authenticate}>
	{#if loading}
		<Spinner />
	{:else}
		<LogInIcon />
	{/if}
	<span slot="extend">
		{#if !loading}
			Log in
		{/if}
	</span>
</Button>
