<script lang="ts">
	import { writeText } from "@tauri-apps/api/clipboard";
	import { WebviewWindow } from "@tauri-apps/api/window";
	import { Clipboard, XCircle } from "lucide-svelte";
	import { Menu, MenuItem } from ".";
	import { songLink } from "$lib/stores";
	import { Button } from "../button";
</script>

<Menu>
	<Button slot="button">
		<svg viewBox="0 0 240 240">
			<path
				d="M174 173c-1 4-5 4-10 3A133 133 0 00 60 164c-4 0-9-1-10-5 0-5 3-9 6-9 45-11 85-7 117 13 3 1 4 7 1 10ZM190 140c-3 4-9 6-13 3a165 165 0 00-120-13c-4 1-10-1-11-7-2-4 1-10 5-12 45-12 99-7 136 16 4 3 6 9 3 13Zm1-33a196 196 0 00-140-14c-5 1-11-2-12-7-3-6 1-13 7-15 41-12 113-10 157 16 4 3 7 10 3 16-3 6-10 7-15 4Z"
			/>
		</svg>
	</Button>
	{#if $songLink}
		<MenuItem
			on:click={() => {
				if ($songLink !== undefined) {
					writeText($songLink).then(() => {
						// TODO add toast notification
					});
				}
			}}
		>
			<Clipboard slot="icon" />
			Copy to Clipboard
		</MenuItem>
	{/if}
	<MenuItem
		background="var(--error)"
		color="var(--on-error)"
		on:click={() => {
			WebviewWindow.getByLabel("player")?.close();
			WebviewWindow.getByLabel("auth")?.close();
		}}
	>
		<XCircle slot="icon" />
		Close
	</MenuItem>
</Menu>
