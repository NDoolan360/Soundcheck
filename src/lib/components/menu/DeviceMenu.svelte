<script lang="ts">
	import { invoke } from "@tauri-apps/api";
	import { Loader2, MonitorOff } from "lucide-svelte";
	import { derived } from "svelte/store";
	import { Menu, MenuItem } from ".";
	import { authenticated, devices, state } from "../../stores";
	import { deviceTypeToIcon } from "../../utils";
	import { Button } from "../button";
	import { VolumeControl } from "../controls";
	import { isReloadable } from "@square/svelte-store";
	import { slide } from "svelte/transition";
	import Spinner from "../icon/Spinner.svelte";
</script>

<Menu rightAlign>
	<Button slot="button" disable={derived(authenticated, (a) => !a)}>
		<svelte:component
			this={deviceTypeToIcon($state?.device?.type)}
			size="1rem"
			style="min-width: 1rem; min-height: 1rem;"
		/>
		<span slot="extend">{$state?.device?.name ?? "Not connected"}</span>
	</Button>
	<VolumeControl slot="header" />
	<!-- Guarantee spinner runs for at least 1 second -->
	{#await isReloadable(devices) && Promise.all( [devices.reload(), new Promise( (resolve) => setTimeout(resolve, 750) )] )}
		<li class="menu-item" role="menuitem" transition:slide|global>
			<Spinner size="1rem" />
			<p>Loading...</p>
		</li>
	{:then}
		{#if $devices.length > 0}
			{#each $devices.filter((d) => !d.is_active) as device}
				<MenuItem
					on:click={() =>
						invoke("set_device", { deviceId: device.id })}
				>
					<svelte:component
						this={deviceTypeToIcon(device.type)}
						slot="icon"
					/>
					{device.name}
				</MenuItem>
			{/each}
		{:else}
			<li class="menu-item" role="menuitem" in:slide|global>
				<MonitorOff size="1rem" />
				<p>No Devices</p>
			</li>
		{/if}
	{/await}
</Menu>

<style>
	.menu-item {
		width: 100%;
		height: 2rem;
		background-color: var(--primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		user-select: none;
		font-size: 75%;
	}
</style>
