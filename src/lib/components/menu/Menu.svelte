<script lang="ts">
	import { writable } from "svelte/store";
	import { setButtonOptions } from "../button/context";
	import { getMenuOptions, setMenuOptions } from "./context";

	const options = getMenuOptions();
	export let open = options?.open ?? writable(false);
	export let size = options?.size ?? "1.5rem";
	setMenuOptions(open, size);
	setButtonOptions(size);

	let uid = crypto.randomUUID();
	export let color = "var(--on-primary)";
	export let background = "var(--primary)";
	export let rightAlign = false;

	let leave = (e: FocusEvent) => {
		var parent: HTMLElement = e.relatedTarget as HTMLElement;
		do {
			if (!parent || parent.tagName === "BODY") break;
			if (parent.id == `button-menu-${uid}`) return;
		} while ((parent = parent.parentElement!));
		$open = false;
	};
</script>

<div id={`button-menu-${uid}`} on:focusout={leave}>
	<slot name="button" />
	{#if $open}
		<menu class:right-align={rightAlign}>
			{#if $$slots.header}
				<span
					style:color
					style:background
					style:padding="calc({size}/4)"
				>
					<slot name="header" />
				</span>
			{/if}
			{#if $$slots.default}
				<slot />
			{/if}
		</menu>
	{/if}
</div>

<style>
	div {
		z-index: 101;
		align-items: center;
		justify-content: center;
	}
	menu {
		max-width: calc(100vw - 1.4rem);
		max-height: calc(100vh - 3.2rem);
		border-radius: 0.5rem;

		position: absolute;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		list-style: none;

		box-shadow: var(--elevate);
		translate: 0 3px;
	}
	menu.right-align {
		right: 0;
	}
	span {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;
	}
</style>
