<script lang="ts">
    import { isReloadable, type Loadable } from '@square/svelte-store';
    import { clipboard, invoke, window } from '@tauri-apps/api';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    import ProgressBar from './lib/components/ProgressBar.svelte';
    import { alwaysShowArtwork, artworkFillMode, darkMode, interactiveOnHover, keepOnTop } from './lib/settings';
    import Button from './lib/sm3lte/Button.svelte';
    import { updateStyleSheet } from './lib/sm3lte/MaterialThemeController';
    import ProgressIndicator from './lib/sm3lte/ProgressIndicator.svelte';
    import Snackbar from './lib/sm3lte/Snackbar.svelte';
    import Switch from './lib/sm3lte/Switch.svelte';
    import {
        activeDevice,
        authenticated,
        currentType,
        deepLink,
        devices,
        disallows,
        duration,
        images,
        liked,
        playing,
        progress,
        repeat,
        shuffle,
        songLink,
        state,
        subheading,
        title,
        trackId,
        volume,
        type RepeatState,
    } from './lib/stores';
    import { clamp, gainFocus, loseFocus } from './lib/utils';

    const repeatMap = {
        off: 'context',
        context: 'track',
        track: 'off',
    } as { [name: string]: RepeatState };
    const reload = <T,>(loadbale: Loadable<T>, delay = 10, cb = () => {}) => {
        setTimeout(() => isReloadable(loadbale) && loadbale.reload().then(cb), delay);
    };
    const loadingState = (delay: number) => {
        stateLoading = true;
        reload(state, delay, () => (stateLoading = false));
    };

    let mainWidth: number;
    let mainHeight: number;
    let screenInactive = true;
    let menuOpen = false;
    let stateLoading = false;
    let triggerCopiedSnackbar: () => void;

    gainFocus(document.body, () => (screenInactive = false));
    loseFocus(document.body, () => (screenInactive = true));

    onMount(() => {
        let autoReloadState: number;
        let autoReloadDevices: number;
        invoke<number>('refresh_rate', {}).then((refresh_rate) => {
            autoReloadState = setInterval(reload, refresh_rate, state);
            autoReloadDevices = setInterval(reload, refresh_rate * 3, devices);
        });
        const optimiticProgressUpdate = setInterval(
            (delta: number) => {
                if ($playing && displayedProgress + delta > $duration) {
                    loadingState($duration - displayedProgress + 500);
                } else if ($playing) displayedProgress += delta;
            },
            1000,
            990
        );
        return () => [autoReloadState, autoReloadDevices, optimiticProgressUpdate].forEach(clearInterval);
    });

    $: {
        $trackId;
        const image = get<SpotifyApi.ImageObject[]>(images).at(-1)!;
        fetch(image.url)
            .then((response) => response.blob())
            .then((blob) => {
                let img = new Image(image.width, image.height);
                img.src = URL.createObjectURL(blob);
                updateStyleSheet(img, $darkMode);
            });
    }
    $: displayedProgress = $progress;
    $: window.appWindow.setAlwaysOnTop($keepOnTop);
</script>

{#if (screenInactive && $interactiveOnHover) || $alwaysShowArtwork}
    {#if $artworkFillMode === 'contain'}
        <div id="lowres-image" style:background-image="url({$images.at(-1)?.url})" transition:fade|global />
    {/if}
    <img
        id="track-image"
        alt="Track Art"
        src={$images.at(0)?.url}
        style:object-fit={$artworkFillMode}
        transition:fade|global
    />
{/if}
{#if !screenInactive || !$interactiveOnHover}
    <div id="vignette" transition:fade />
    <main data-tauri-drag-region bind:clientWidth={mainWidth} bind:clientHeight={mainHeight} transition:fade>
        {#if mainHeight > 70}
            <section id="header" use:loseFocus={() => (menuOpen = false)}>
                <Button id="spotify-logo" on:click={() => (menuOpen = !menuOpen)}>
                    <svg slot="button-icon" viewBox="0 0 512 512">
                        <path stroke-width={50} d="M95 173s170-49 317 33" />
                        <path stroke-width={42.5} d="M109 256s139-45 271 32m-186-17" />
                        <path stroke-width={33.3} d="M116 334s139-39 235 26" />
                    </svg>
                </Button>
                {#if menuOpen}
                    <div id="menu" transition:slide>
                        <span>
                            <label for="volume">Volume:</label>
                            <input
                                id="volume"
                                type="range"
                                bind:value={$volume}
                                max="100"
                                disabled={$disallows.changeVolume}
                            />
                        </span>
                        <span>
                            <label for="device-list">Device:</label>
                            <select
                                id="device-list"
                                bind:value={$activeDevice}
                                disabled={$devices.length == 0 || $disallows.transferringPlayback}
                            >
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
                        <Button
                            id={$authenticated ? 'logout' : 'login'}
                            on:click={() => ($authenticated = !$authenticated)}
                        >
                            {$authenticated ? 'Log Out' : 'Log In'}
                        </Button>
                        <Button
                            id="copy-link"
                            on:click={() => {
                                if ($songLink) clipboard.writeText($songLink).then(triggerCopiedSnackbar);
                            }}
                            disabled={$disallows.link}
                        >
                            Copy Song Link
                        </Button>
                        <Button id="deep-link" href={$deepLink} disabled={$disallows.link}>Open in Spotify</Button>
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
                            <label for="interactive-on-hover">Interactive Only On Hover:</label>
                            <Switch label="interactive-on-hover" bind:checked={$interactiveOnHover}>
                                <i slot="switch-unchecked-icon" class="material-symbols-outlined"> do_not_touch </i>
                                <i slot="switch-checked-icon" class="material-symbols-outlined"> hand_gesture </i>
                            </Switch>
                        </span>
                        <span>
                            <label for="enforce-art">Always Show Artwork:</label>
                            <Switch label="enforce-art" bind:checked={$alwaysShowArtwork}>
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
            </section>
            <Snackbar dismissable width="fit-content" bind:open={triggerCopiedSnackbar}>Link Copied</Snackbar>
        {/if}
        <aside id="close">
            <Button
                id="close-button"
                on:click={() => {
                    window.WebviewWindow.getByLabel('player')?.close();
                    window.WebviewWindow.getByLabel('auth')?.close();
                }}
            >
                <i slot="button-icon" class="material-symbols-outlined"> close </i>
            </Button>
        </aside>
        {#if mainHeight > 110}
            <section id="info">
                <hgroup>
                    <h3>{$title}</h3>
                    <p>{$subheading}</p>
                </hgroup>
                {#if mainWidth > 200 && mainHeight > 125}
                    <span in:fade>
                        <Button
                            id="play-pause-fab"
                            FAB
                            selected
                            radius={!$playing ? '50%' : undefined}
                            on:click={() => ($playing = !$playing)}
                            disabled={$disallows.playPause}
                        >
                            <i slot="button-icon" class="material-symbols-outlined">
                                {#if stateLoading}
                                    <ProgressIndicator label="loading-state-fab" circular indeterminate />
                                {:else}
                                    {$playing ? 'pause' : 'play_arrow'}
                                {/if}
                            </i>
                        </Button>
                    </span>
                {/if}
            </section>
        {/if}
        <section id="controls" class={$currentType}>
            {#if $currentType === 'episode'}
                <span in:fade>
                    <Button
                        id="replay-10"
                        type="standard"
                        on:click={() => ($progress = clamp(0, $progress - 10000, $duration))}
                        disabled={$disallows.seeking}
                    >
                        <i slot="button-icon" class="material-symbols-outlined"> replay_10 </i>
                    </Button>
                </span>
            {/if}
            {#if ($currentType === 'episode' && mainWidth > 300) || mainWidth > 135}
                <span in:fade>
                    <Button
                        id="skip-previous"
                        type="standard"
                        on:click={() => invoke('previous_track').then(() => loadingState(500))}
                        disabled={$disallows.skippingPrev}
                    >
                        <i slot="button-icon" class="material-symbols-outlined"> skip_previous </i>
                    </Button>
                </span>
            {/if}
            {#if !(mainWidth > 200 && mainHeight > 125)}
                <span in:fade>
                    <Button
                        id="play-pause"
                        type="standard"
                        on:click={() => ($playing = !$playing)}
                        disabled={$disallows.playPause}
                    >
                        <i slot="button-icon" class="material-symbols-outlined">
                            {#if stateLoading}
                                <ProgressIndicator label="loading-state" circular indeterminate />
                            {:else}
                                {$playing ? 'pause' : 'play_arrow'}
                            {/if}
                        </i>
                    </Button>
                </span>
            {/if}
            {#if mainWidth > 200}
                <span id="progress" in:fade>
                    <ProgressBar
                        playing={$playing}
                        progress={displayedProgress}
                        duration={$duration}
                        on:click={({ detail }) => ($progress = detail)}
                        disabled={$disallows.seeking}
                    />
                </span>
            {/if}
            {#if ($currentType === 'episode' && mainWidth > 250) || mainWidth > 100}
                <span in:fade>
                    <Button
                        id="skip-next"
                        type="standard"
                        on:click={() => invoke('next_track').then(() => loadingState(500))}
                        disabled={$disallows.skippingNext}
                    >
                        <i slot="button-icon" class="material-symbols-outlined"> skip_next </i>
                    </Button>
                </span>
            {/if}
            {#if $currentType === 'track'}
                {#if mainWidth > 250}
                    <span in:fade>
                        <Button
                            id="favorite"
                            selected={$liked}
                            on:click={() => ($liked = !$liked)}
                            disabled={$disallows.togglingLike}
                        >
                            <i slot="button-icon" class="material-symbols-outlined"> favorite </i>
                        </Button>
                    </span>
                {/if}
                {#if mainWidth > 300}
                    <span in:fade>
                        <Button
                            id="shuffle"
                            selected={$shuffle}
                            on:click={() => ($shuffle = !$shuffle)}
                            disabled={$disallows.togglingShuffle}
                        >
                            <i slot="button-icon" class="material-symbols-outlined"> shuffle </i>
                        </Button>
                    </span>
                {/if}
                {#if mainWidth > 350}
                    <span in:fade>
                        <Button
                            id="repeat"
                            selected={$repeat != 'off'}
                            on:click={() => ($repeat = repeatMap[$repeat])}
                            disabled={$disallows.togglingRepeat}
                        >
                            <i slot="button-icon" class="material-symbols-outlined">
                                {$repeat == 'track' ? 'repeat_one' : 'repeat'}
                            </i>
                        </Button>
                    </span>
                {/if}
            {:else if $currentType === 'episode'}
                <span in:fade>
                    <Button
                        id="forward-10"
                        type="standard"
                        on:click={() => ($progress = clamp(0, $progress + 10000, $duration))}
                        disabled={$disallows.seeking}
                    >
                        <i slot="button-icon" class="material-symbols-outlined"> forward_10 </i>
                    </Button>
                </span>
            {/if}
        </section>
    </main>
{/if}

<style>
    main {
        display: flex;
        height: 100%;
        flex-direction: column;
    }

    :global(:is(button, a, input, select)) {
        pointer-events: auto;
    }

    :is(div, hgroup) {
        display: flex;
        flex-direction: column;
        justify-content: start;
        pointer-events: none;
    }

    :is(section, span) {
        display: flex;
        max-width: 100%;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.35rem;
        pointer-events: none;
    }

    section:first-of-type {
        margin-bottom: auto;
    }

    section:last-of-type {
        margin-top: auto;
    }

    input[type='range'],
    :global(#progress),
    select {
        min-width: 3.5rem;
        flex: 1 1;
    }

    hr {
        border: none;
        border-bottom: 2px solid rgb(var(--sm3-scheme-color-outline));
    }

    :is(img, #lowres-image, #vignette) {
        position: absolute;
        z-index: -10;
        width: 100%;
        height: 100%;
        inset: 0;
    }

    img {
        backdrop-filter: blur(12px);
    }

    #lowres-image {
        background-position: center;
        background-size: cover;
    }

    #vignette {
        background-color: rgb(var(--sm3-scheme-color-inverse-primary) / 40%);
        box-shadow: inset 0 0 80px rgb(var(--sm3-scheme-color-inverse-primary));
    }

    :global(#spotify-logo) {
        --sm3-comp-button-size-height: 1.8rem;
        --sm3-comp-button-size-width: 1.8rem;
    }

    :global(#spotify-logo) svg path {
        fill: none;
        stroke: rgb(var(--sm3-scheme-color-on-primary));
        stroke-linecap: round;
    }

    :global(:is(#logout, #login, #copy-link, #deep-link)) {
        min-height: fit-content;
        padding: 0 12px;
        white-space: normal;
    }

    #close {
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;

        --sm3-comp-button-size-height: 2rem;
        --sm3-comp-button-size-width: 3rem;
        --sm3-comp-button-size-radius: 0;
        --sm3-comp-button-color-text: white;
        --sm3-comp-button-color-background: transparent;
    }

    #close :global(#close-button:is(:hover, :focus-visible)) {
        --sm3-comp-button-color-background: red;
    }

    #menu {
        position: absolute;
        z-index: 9;
        top: 2rem;
        max-width: calc(100vw - 2.5rem);
        max-height: calc(100vh - 4rem);
        padding: 0.5rem;
        border-radius: 0.5rem;
        background-color: rgb(var(--sm3-scheme-color-surface-container));
        color: rgb(var(--sm3-scheme-color-on-surface-container));
        gap: 1rem;
        overflow-y: auto;
        pointer-events: auto;

        --sm3-comp-switch-size-height: 1.5rem;
        --sm3-comp-switch-size-width: 2.5rem;
    }

    #info {
        flex-wrap: nowrap;
    }

    #info hgroup {
        overflow: hidden;
    }

    #info hgroup * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    #controls :global(.standard) {
        --sm3-comp-button-color-text: white;
    }
</style>
