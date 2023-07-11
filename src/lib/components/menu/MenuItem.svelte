<script lang="ts">
	import { readable } from "svelte/store";
	import Button from "../button";
	import { getMenuOptions } from "./context";
	import { slide } from "svelte/transition";

	let uid = crypto.randomUUID();
	const size = getMenuOptions().size;

	export let background: string | undefined = undefined;
	export let color: string | undefined = undefined;
</script>

<li role="menuitem" id={uid} in:slide|global>
	<Button
		shape="square"
		height="calc({size} + 0.5rem"
		width="100%"
		{background}
		{color}
		on:click
	>
		<slot name="icon" />
		<slot slot="extend" />
	</Button>
</li>
