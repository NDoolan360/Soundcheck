<script lang="ts">
    import { isReloadable, type Loadable } from '@square/svelte-store';
    import { clipboard, invoke, window as tauriWindow } from '@tauri-apps/api';
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    import Button from './lib/components/Button.svelte';
    import Controls from './lib/components/Controls.svelte';
    import ProgressIndicator from './lib/components/ProgressIndicator.svelte';
    import Snackbar from './lib/components/Snackbar.svelte';
    import Switch from './lib/components/Switch.svelte';
    import {
        activeDevice,
        authenticated,
        currentType,
        deepLink,
        devices,
        disallows,
        duration,
        images,
        loading,
        playing,
        progress,
        songLink,
        state,
        subheading,
        title,
        trackId,
        volume,
    } from './lib/playback';
    import { alwaysShowArtwork, alwaysShowControls, artworkFillMode, darkMode, keepOnTop } from './lib/settings';
    import { updateStyleSheet } from './lib/theme';
    import { gainFocus, loseFocus, toggle } from './lib/utils';
    import SettingsMenu from './lib/components/SettingsMenu.svelte';

    const reload = <T,>(loadbale: Loadable<T>, delay = 10, cb = () => {}) => {
        setTimeout(() => isReloadable(loadbale) && loadbale.reload().then(cb), delay);
    };

    export let screenActive = false;

    let mainWidth: number;
    let mainHeight: number;

    gainFocus(document.body, () => (screenActive = true));
    loseFocus(document.body, () => (screenActive = false));

    onMount(() => {
        const unsubKeepOnTop = keepOnTop.subscribe((value) => {
            tauriWindow.appWindow.setAlwaysOnTop(value);
        });

        let autoReloadState: NodeJS.Timeout;
        let autoReloadDevices: NodeJS.Timeout;
        invoke<number>('refresh_rate', {}).then((refresh_rate) => {
            autoReloadState = setInterval(reload, refresh_rate, state);
            autoReloadDevices = setInterval(reload, refresh_rate * 3, devices);
        });
        const optimiticProgressUpdate = setInterval(
            (delta: number) => {
                if ($playing && displayedProgress + delta > $duration) {
                    loading.set(true);
                } else if ($playing) displayedProgress += delta;
            },
            1000,
            990
        );
        return () => {
            [autoReloadState, autoReloadDevices, optimiticProgressUpdate].forEach(clearInterval);
            unsubKeepOnTop();
        };
    });

    $: {
        $trackId;
        const image = get<SpotifyApi.ImageObject[]>(images).at(-1)!;
        fetch(image.url)
            .then((response) => response.blob())
            .then((blob) => {
                if (!blob) return;
                let img = new Image(image.width, image.height);
                img.src = URL.createObjectURL(blob);
                updateStyleSheet(img, $darkMode);
            });
    }
    $: displayedProgress = $progress;
</script>

{#if $alwaysShowArtwork || !(screenActive || $alwaysShowControls)}
    {#if $artworkFillMode !== 'cover'}
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
{#if screenActive || $alwaysShowControls}
    <div id="vignette" transition:fade />
    <main data-tauri-drag-region bind:clientWidth={mainWidth} bind:clientHeight={mainHeight} transition:fade>
        {#if mainHeight > 70}
            <section>
                <SettingsMenu />
                <aside id="close">
                    <Button
                        id="close-button"
                        height="2rem"
                        width="3rem"
                        radius="0"
                        on:click={() => {
                            tauriWindow.WebviewWindow.getByLabel('player')?.close();
                            tauriWindow.WebviewWindow.getByLabel('auth')?.close();
                        }}
                    >
                        <i slot="button-icon" class="material-symbols-outlined"> close </i>
                    </Button>
                </aside>
            </section>
        {/if}
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
                            filled
                            FAB
                            selected={$playing}
                            on:click={toggle(playing)}
                            disabled={$disallows.playPause}
                        >
                            <i slot="button-icon" class="material-symbols-outlined">
                                {#if $loading}
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
            <Controls width={mainWidth} hidePlayPause={mainWidth <= 250} {displayedProgress} />
        </section>
    </main>
{/if}

<style>
    main {
        display: flex;
        height: 100%;
        flex-direction: column;
    }

    :global(:is(button, input, select)) {
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
        background-color: rgb(var(--scheme-color-inverse-primary) / 40%);
        box-shadow: inset 0 0 80px rgb(var(--scheme-color-inverse-primary));
    }

    #close {
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
    }

    #close :global(#close-button:is(:hover, :focus-visible)) {
        --comp-button-color-background: red;
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
</style>
