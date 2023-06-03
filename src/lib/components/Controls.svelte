<script lang="ts">
    import IconButton from "$lib/components/IconButton.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import {
        disallows,
        isEpisode,
        like,
        pageWidth,
        playing,
        state,
    } from "$lib/stores";
    import type { ComponentType } from "svelte";
    import { flip } from "svelte/animate";
    import type { Readable } from "svelte/store";
    import { fly } from "svelte/transition";

    $: controls = [
        {
            id: "replay_30",
            component: IconButton,
            hide: !$isEpisode,
            action: () => {},
            props: {
                icon: "replay_30",
                disable: disallows((d) => d?.seeking ?? true),
            },
        },
        {
            id: "prev",
            component: IconButton,
            hide: $isEpisode && $pageWidth <= 190,
            action: () => {},
            props: {
                icon: "skip_previous",
                disable: disallows((d) => d?.skipping_prev ?? true),
            },
        },
        {
            id: "progress",
            component: ProgressBar,
            hide: $pageWidth <= 320,
            action: () => {},
            wrapperClass: "max row",
            props: {
                disable: disallows((d) => d?.seeking ?? true),
            },
        },
        {
            id: "play-pause",
            component: IconButton,
            hide: $pageWidth > 250,
            action: () => {},
            props: {
                icon: $playing ? "pause" : "play_arrow",
                disable: disallows(
                    (d) => (d?.pausing ?? true) || (d?.resuming ?? true)
                ),
            },
        },
        {
            id: "next",
            component: IconButton,
            hide: false,
            action: () => {},
            props: {
                icon: "skip_next",
                disable: disallows((d) => d?.skipping_next ?? true),
            },
        },
        {
            id: "forward_30",
            component: IconButton,
            hide: !$isEpisode,
            action: () => {},
            props: {
                icon: "forward_30",
                disable: disallows((d) => d?.seeking ?? true),
            },
        },
        {
            id: "shuffle",
            component: IconButton,
            hide: $isEpisode || $pageWidth <= 190,
            action: () => {},
            props: {
                icon: "shuffle",
                active: state.derive((state) => state?.shuffle_state ?? false),
                disable: disallows((d) => d?.toggling_shuffle ?? true),
            },
        },
        {
            id: "repeat",
            component: IconButton,
            hide: $isEpisode || $pageWidth <= 250,
            action: () => {},
            props: {
                icon: "repeat",
                active: state.derive(
                    (state) => (state?.repeat_state ?? "off") != "off"
                ),
                disable: disallows(
                    (d) =>
                        (d?.toggling_repeat_context ?? true) ||
                        (d?.toggling_repeat_track ?? true)
                ),
            },
        },
        {
            id: "favourite",
            component: IconButton,
            hide: $isEpisode,
            action: () => {},
            props: {
                icon: "favorite",
                disable: state.derive((state) => state?.item?.id === undefined),
                fill: like.derive((like) => like),
            },
        },
    ] as {
        id: string;
        component: ComponentType;
        hide?: boolean;
        action: () => void;
        wrapperClass?: string;
        props: {
            icon?: string;
            active?: Readable<boolean>;
            disable?: Readable<boolean>;
            fill?: Readable<boolean>;
        };
    }[];
</script>

{#each controls.filter((control) => !control.hide) as control (control.id)}
    <span
        class={control.wrapperClass}
        animate:flip={{ duration: 800 }}
        in:fly={{ y: 15, delay: 400 }}
        out:fly={{ duration: 0 }}
    >
        <svelte:component
            this={control.component}
            on:action={control.action}
            {...control.props}
        />
    </span>
{/each}

<style>
    span:not(.max) {
        width: 2rem;
    }
</style>
