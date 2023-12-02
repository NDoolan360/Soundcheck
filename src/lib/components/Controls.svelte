<script lang="ts">
    import { invoke } from '@tauri-apps/api';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import {
        currentType,
        disallows,
        displayedProgress,
        duration,
        liked,
        loading,
        playing,
        progress,
        repeat,
        shuffle,
    } from '../playback';
    import Button from '../sub_components/Button.svelte';
    import ProgressIndicator from '../sub_components/ProgressIndicator.svelte';
    import { nextRepeat, toggle } from '../utils';
    import ProgressBar from './ProgressBar.svelte';

    export let width: number;
    export let hidePlayPause: boolean;
    onMount(() => {
        const optimiticProgressUpdate = setInterval(
            (delta: number) => {
                if ($playing) displayedProgress.update((v) => v + delta);
            },
            1000,
            990
        );
        return () => clearInterval(optimiticProgressUpdate);
    });

    $: isEpisode = $currentType === 'episode';

    $: controls = {
        'replay-10': isEpisode,
        'skip-previous': (!isEpisode && width > 150) || (isEpisode && width > 300),
        'play-pause': !hidePlayPause,
        progress: hidePlayPause || width > 250,
        'skip-next': !isEpisode || (isEpisode && width > 200),
        'forward-10': isEpisode && width > 150,
        favorite: !isEpisode && width > 200,
        shuffle: !isEpisode && width > 300,
        repeat: !isEpisode && width > 350,
    };
</script>

{#if controls['replay-10']}
    <span in:fade>
        <Button id="replay-10" on:click={() => ($progress = $progress - 10000)} disabled={$disallows.seeking}>
            <i slot="button-icon" class="material-symbols-outlined"> replay_10 </i>
        </Button>
    </span>
{/if}
{#if controls['skip-previous']}
    <span in:fade>
        <Button
            id="skip-previous"
            on:click={() => invoke('previous_track').then(() => ($loading = true))}
            disabled={$disallows.skippingPrev}
        >
            <i slot="button-icon" class="material-symbols-outlined"> skip_previous </i>
        </Button>
    </span>
{/if}
{#if controls['play-pause']}
    <span in:fade>
        <Button id="play-pause" on:click={() => toggle(playing)} disabled={$disallows.playPause}>
            <i slot="button-icon" class="material-symbols-outlined">
                {#if $loading}
                    <ProgressIndicator label="loading-state" circular indeterminate />
                {:else}
                    {$playing ? 'pause' : 'play_arrow'}
                {/if}
            </i>
        </Button>
    </span>
{/if}
{#if controls['progress']}
    <span id="progress" in:fade>
        <ProgressBar
            playing={$playing}
            progress={$displayedProgress}
            duration={$duration}
            on:click={({ detail }) => ($progress = detail)}
            disabled={$disallows.seeking}
        />
    </span>
{/if}
{#if controls['skip-next']}
    <span in:fade>
        <Button
            id="skip-next"
            on:click={() => invoke('next_track').then(() => ($loading = true))}
            disabled={$disallows.skippingNext}
        >
            <i slot="button-icon" class="material-symbols-outlined"> skip_next </i>
        </Button>
    </span>
{/if}
{#if controls['forward-10']}
    <span in:fade>
        <Button id="forward-10" on:click={() => ($progress = $progress + 10000)} disabled={$disallows.seeking}>
            <i slot="button-icon" class="material-symbols-outlined"> forward_10 </i>
        </Button>
    </span>
{/if}
{#if controls['favorite']}
    <span in:fade>
        <Button
            id="favorite"
            filled
            selected={$liked}
            on:click={() => toggle(liked)}
            disabled={$disallows.togglingLike}
        >
            <i slot="button-icon" class="material-symbols-outlined"> favorite </i>
        </Button>
    </span>
{/if}
{#if controls['shuffle']}
    <span in:fade>
        <Button
            id="shuffle"
            filled
            selected={$shuffle}
            on:click={() => toggle(shuffle)}
            disabled={$disallows.togglingShuffle}
        >
            <i slot="button-icon" class="material-symbols-outlined"> shuffle </i>
        </Button>
    </span>
{/if}
{#if controls['repeat']}
    <span in:fade>
        <Button
            id="repeat"
            filled
            selected={$repeat != 'off'}
            on:click={() => nextRepeat(repeat)}
            disabled={$disallows.togglingRepeat}
        >
            <i slot="button-icon" class="material-symbols-outlined">
                {$repeat == 'track' ? 'repeat_one' : 'repeat'}
            </i>
        </Button>
    </span>
{/if}

<style>
    span {
        display: flex;
        max-width: 100%;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.35rem;
        pointer-events: none;
    }

    #progress {
        flex: 1 1;
    }
</style>
