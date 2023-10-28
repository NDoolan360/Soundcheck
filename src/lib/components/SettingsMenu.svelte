<script lang="ts">
    import { clipboard, invoke, window as tauriWindow } from '@tauri-apps/api';
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';
    import Button from '../sub_components/Button.svelte';
    import Snackbar from '../sub_components/Snackbar.svelte';
    import Switch from '../sub_components/Switch.svelte';
    import { activeDevice, authenticated, deepLink, devices, disallows, songLink, volume } from '../playback';
    import { alwaysShowArtwork, alwaysShowControls, artworkFillMode, darkMode, keepOnTop } from '../settings';
    import { loseFocus, toggle, inBrowser } from '../utils';
    import { onMount } from 'svelte';

    const closeMenu = () => ($menu = false);

    let menu = writable(false);
    let triggerCopiedSnackbar: () => void;

    onMount(() => {
        let autoReloadDevices: NodeJS.Timeout;
        invoke<number>('refresh_rate', {}).then((refresh_rate) => {
            autoReloadDevices = setInterval(() => devices.reload!(), refresh_rate * 3);
        });
        return () => clearInterval(autoReloadDevices);
    });

    $: !inBrowser && tauriWindow.appWindow.setAlwaysOnTop($keepOnTop);
</script>

<div use:loseFocus={closeMenu}>
    <Button id="spotify-logo" filled selected height="1.8rem" width="1.8rem" on:click={() => toggle(menu)}>
        <svg slot="button-icon" viewBox="0 0 512 512">
            <path stroke-width={50} d="M95 173s170-49 317 33" />
            <path stroke-width={42.5} d="M109 256s139-45 271 32m-186-17" />
            <path stroke-width={33.3} d="M116 334s139-39 235 26" />
        </svg>
    </Button>
    {#if $menu}
        <div
            id="menu"
            transition:slide
            style:--comp-switch-size-height="1.5rem"
            style:--comp-switch-size-width="2.5rem"
        >
            <span>
                <label for="volume">Volume:</label>
                <input id="volume" type="range" bind:value={$volume} max="100" disabled={$disallows.changeVolume} />
            </span>
            <span>
                <label for="device-list">Device:</label>
                <select id="device-list" bind:value={$activeDevice} disabled={$disallows.transferringPlayback}>
                    <option hidden disabled selected value={null}> None </option>
                    {#each $devices as device (device.id)}
                        <option value={device.id}>
                            {device.name}
                        </option>
                    {:else}
                        <option value={undefined}>None</option>
                    {/each}
                </select>
            </span>
            <hr />
            <Button id={$authenticated ? 'logout' : 'login'} filled on:click={() => toggle(authenticated)}>
                {$authenticated ? 'Log Out' : 'Log In'}
            </Button>
            <Button
                id="copy-link"
                filled
                on:click={() => {
                    if ($songLink) clipboard.writeText($songLink).then(triggerCopiedSnackbar);
                }}
                disabled={$disallows.link}
            >
                Copy Song Link
            </Button>
            <Button id="deep-link" filled href={$deepLink} disabled={$disallows.link}>Open in Spotify</Button>
            <hr />
            <h3>Settings</h3>
            <span>
                <label for="dark-mode">Dark Mode:</label>
                <Switch label="dark-mode" bind:checked={$darkMode}>
                    <i slot="switch-unchecked-icon" class="material-symbols-outlined"> light_mode </i>
                    <i slot="switch-checked-icon" class="material-symbols-outlined"> dark_mode </i>
                </Switch>
            </span>
            <span>
                <label for="keep-on-top">Keep On Top:</label>
                <Switch label="keep-on-top" bind:checked={$keepOnTop}>
                    <i slot="switch-unchecked-icon" class="material-symbols-outlined"> layers_clear </i>
                    <i slot="switch-checked-icon" class="material-symbols-outlined"> layers </i>
                </Switch>
            </span>
            <span>
                <label for="always-show-controls">Always Show Controls:</label>
                <Switch label="always-show-controls" bind:checked={$alwaysShowControls}>
                    <i slot="switch-unchecked-icon" class="material-symbols-outlined"> do_not_touch </i>
                    <i slot="switch-checked-icon" class="material-symbols-outlined"> hand_gesture </i>
                </Switch>
            </span>
            <span>
                <label for="always-show-art">Always Show Artwork:</label>
                <Switch label="always-show-art" bind:checked={$alwaysShowArtwork}>
                    <i slot="switch-unchecked-icon" class="material-symbols-outlined"> hide_image </i>
                    <i slot="switch-checked-icon" class="material-symbols-outlined"> image </i>
                </Switch>
            </span>
            <span>
                <label for="cover-art">Artwork Fill Mode:</label>
                <select id="cover-art" bind:value={$artworkFillMode}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                </select>
            </span>
        </div>
    {/if}
</div>
<Snackbar dismissable width="fit-content" bind:open={triggerCopiedSnackbar}>Link Copied</Snackbar>

<style>
    div {
        display: flex;
        flex-direction: column;
        justify-content: start;
        pointer-events: none;
    }

    span {
        display: flex;
        max-width: 100%;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.35rem;
        pointer-events: none;
    }

    input[type='range'],
    select {
        min-width: 3.5rem;
        flex: 1 1;
    }

    hr {
        border: none;
        border-bottom: 2px solid rgb(var(--scheme-color-outline));
    }

    :global(#spotify-logo) svg path {
        fill: none;
        stroke: rgb(var(--scheme-color-on-primary));
        stroke-linecap: round;
    }

    :global(:is(#logout, #login, #copy-link, #deep-link)) {
        min-height: fit-content;
        padding: 0 12px;
        white-space: normal;
    }

    #menu {
        position: absolute;
        z-index: 9;
        top: 2rem;
        max-width: calc(100vw - 2.5rem);
        max-height: calc(100vh - 4rem);
        padding: 0.5rem;
        border-radius: 0.25rem;
        background-color: rgb(var(--scheme-color-surface-container));
        color: rgb(var(--scheme-color-on-surface));
        gap: 1rem;
        overflow-y: auto;
        pointer-events: auto;
    }

    #menu::-webkit-scrollbar {
        width: 0.5rem;
    }

    #menu::-webkit-scrollbar-track {
        background-color: rgb(var(--scheme-color-surface-container));
        border-bottom-right-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }

    #menu::-webkit-scrollbar-thumb {
        border-radius: 0.25rem;
        background-color: rgb(var(--scheme-color-on-surface-variant));
    }
</style>
