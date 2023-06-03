<script lang="ts">
    import Controls from "$lib/components/Controls.svelte";
    import IconButton from "$lib/components/IconButton.svelte";
    import {
        authenticated,
        device,
        disallows,
        pageWidth,
        playing,
        state,
    } from "$lib/stores";
    import { deviceToIcon } from "$lib/utils";
    import { invoke } from "@tauri-apps/api";
    import { appWindow } from "@tauri-apps/api/window";

    let title = state.derive((state) => state?.item?.name ?? "");
    let subheading = state.derive((state) => {
        switch (state?.currently_playing_type) {
            case "track":
                return (state?.item as SpotifyApi.TrackObjectFull).artists
                    .map((a) => a.name)
                    .join(", ");
            case "episode":
                return (
                    (state?.item as SpotifyApi.EpisodeObject).show.name ?? ""
                );
        }
        return "";
    });

    let loading: boolean = false;
    const authenticate = () => {
        loading = true;
        invoke("authenticate", { window: appWindow })
            .then(() => {
                $authenticated = true;
            })
            .catch(console.error)
            .finally(() => (loading = false));
    };
</script>

<div class="drag-box" data-tauri-drag-region />
<nav
    class="top self-center transparent no-padding small-margin"
    data-tauri-drag-region
>
    <IconButton icon="menu" buttonClass="mini circle" iconClass="tiny" />
    <IconButton buttonClass="mini circle">
        <i class="tiny">{deviceToIcon($device)}</i>
    </IconButton>
</nav>

<main
    class="fixed middle self-center row no-padding center-align"
    data-tauri-drag-region
>
    {#if $authenticated}
        <hgroup class="medium-line">
            <h1 class="large-text">{$title}</h1>
            <p class="medium-text">{$subheading}</p>
        </hgroup>
        {#if $pageWidth > 250}
            <IconButton
                buttonClass="extra {$playing ? 'round square' : 'circle'}"
                disable={disallows(
                    (d) => (d?.pausing ?? true) || (d?.resuming ?? true)
                )}
                on:action={() => {
                    if ($state) $state.is_playing = !$playing;
                }}
            >
                <svg viewBox="0 0 24 24" class="tiny">
                    <path
                        d={$playing
                            ? "M6 19 10 19 10 5 6 5ZM14 19 18 19 18 5 14 5Z"
                            : "M8 19 12 16.5 12 7.5 8 5ZM12 16.5 19 12 19 12 12 7.5Z"}
                        style:transition="d var(--speed3)"
                    />
                </svg>
            </IconButton>
        {/if}
    {:else}
        <button on:click={authenticate}>
            {#if loading}
                <span class="loader small black" />
            {:else}
                <i>login</i>
            {/if}
            <span>Log in</span>
        </button>
    {/if}
</main>

<nav
    class="bottom self-center align-center transparent no-padding small-margin"
    data-tauri-drag-region
>
    <Controls />
</nav>

<style>
    .drag-box {
        position: fixed;
        top: 0.3rem;
        bottom: 0.3rem;
        left: 0.3rem;
        right: 0.3rem;
    }
    .self-center {
        width: calc(100% - 1rem);
        left: 50%;
        translate: calc(-50% - 0.5rem);
        max-width: 600px;
    }
    :global(.mini) {
        min-height: 1.5rem;
        max-height: 1.5rem;
        min-width: 1.5rem;
        max-width: 1.5rem;
    }
    nav {
        height: fit-content;
        gap: clamp(0px, calc(11.5vw - 18.4px), 1rem);
        justify-content: space-between;
    }
    main {
        margin: 0 0.5rem !important;
    }
    hgroup {
        pointer-events: none;
        flex: 1 1 auto;
        width: fit-content;
        overflow: hidden;
        mask-image: linear-gradient(90deg, #000 80%, transparent);
        -webkit-mask-image: linear-gradient(90deg, #000 80%, transparent);
    }
    hgroup > * {
        transform: scale(1.15) translateX(7.5%);
        white-space: nowrap;
    }
    hgroup > p {
        color: var(--outline);
    }
</style>
