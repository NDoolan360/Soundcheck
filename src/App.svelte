<script lang="ts">
    import { invoke } from '@tauri-apps/api';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import Background from './lib/components/Background.svelte';
    import CloseButton from './lib/components/CloseButton.svelte';
    import Controls from './lib/components/Controls.svelte';
    import PlayPauseFab from './lib/components/PlayPauseFAB.svelte';
    import SettingsMenu from './lib/components/SettingsMenu.svelte';
    import SongInfo from './lib/components/SongInfo.svelte';
    import { images, state, trackId } from './lib/playback';
    import { alwaysShowArtwork, alwaysShowControls, darkMode } from './lib/settings';
    import { updateStyleSheet } from './lib/theme';
    import { gainFocus, loseFocus, reload } from './lib/utils';

    export let screenActive = false;

    let screenWidth: number;
    let screenHeight: number;

    gainFocus(document.body, () => (screenActive = true));
    loseFocus(document.body, () => (screenActive = false));

    onMount(() => {
        let autoReloadState: NodeJS.Timeout;
        invoke<number>('refresh_rate', {}).then((refresh_rate) => {
            autoReloadState = setInterval(reload, refresh_rate, state);
        });
        return () => clearInterval(autoReloadState);
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

    $: playPauseAsFAB = screenWidth > 200 && screenHeight > 165;
</script>

<svelte:window bind:innerWidth={screenWidth} bind:innerHeight={screenHeight} />

{#if $alwaysShowArtwork || !(screenActive || $alwaysShowControls)}
    <Background />
{/if}
{#if screenActive || $alwaysShowControls}
    <div id="vignette" transition:fade />
    <main data-tauri-drag-region transition:fade>
        {#if screenHeight > 85}
            <section>
                <SettingsMenu />
                <CloseButton />
            </section>
        {/if}
        {#if screenHeight > 125}
            <section>
                <SongInfo />
                {#if playPauseAsFAB}
                    <PlayPauseFab />
                {/if}
            </section>
        {/if}
        <section>
            <Controls width={screenWidth} hidePlayPause={playPauseAsFAB} />
        </section>
    </main>
{/if}

<style>
    main {
        display: flex;
        height: 100%;
        flex-direction: column;
    }

    section {
        display: flex;
        max-width: 100%;
        flex-flow: row wrap;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.35rem;
        pointer-events: none;
    }

    main section:first-of-type {
        margin-bottom: auto;
    }

    main section:last-of-type {
        margin-top: auto;
    }

    #vignette {
        position: absolute;
        z-index: -10;
        width: 100%;
        height: 100%;
        background-color: rgb(var(--scheme-color-inverse-primary) / 40%);
        box-shadow: inset 0 0 80px rgb(var(--scheme-color-inverse-primary));
        inset: 0;
    }
</style>
