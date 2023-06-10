<script lang="ts">
	import { authenticated } from "$lib/stores";

	let loading: boolean = false;
	const authenticate = async () => {
		loading = true;
		await authenticated.set(false);
		loading = false;
	};
</script>

<button on:click={authenticate}>
	{#if loading}
		<span class="loader small black" />
		<span>Loading...</span>
	{:else}
		<i>login</i>
		<span>Log in</span>
	{/if}
</button>
