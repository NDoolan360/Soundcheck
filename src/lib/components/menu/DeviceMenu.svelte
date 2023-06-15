<script lang="ts">
	import { invoke } from "@tauri-apps/api";
	import { Menu, MenuItem } from ".";
	import { devices, state } from "../../stores";
	import { deviceTypeToIcon } from "../../utils";
	import { Button } from "../button";
	import { VolumeControl } from "../controls";
</script>

<Menu rightAlign>
	<Button slot="button">
		<svelte:component this={deviceTypeToIcon($state?.device?.type)} size="1rem" />
		<span slot="extend">{$state?.device?.name ?? "Not connected"}</span>
	</Button>
	<VolumeControl slot="header" />
	{#await devices.reload && devices.reload() then}
		{#each $devices.filter((d) => !d.is_active) as device}
			<MenuItem
				on:click={() => invoke("set_device", { deviceId: device.id })}
			>
				<svelte:component
					this={deviceTypeToIcon(device.type)}
					slot="icon"
				/>
				{device.name}
			</MenuItem>
		{/each}
	{/await}
</Menu>
