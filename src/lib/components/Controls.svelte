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
</script>

{#if $currentType === 'episode'}
    <span in:fade>
        <Button id="replay-10" on:click={() => ($progress = $progress - 10000)} disabled={$disallows.seeking}>
            <i slot="button-icon" class="material-symbols-outlined"> replay_10 </i>
        </Button>
    </span>
{/if}
{#if ($currentType === 'episode' && width > 300) || width > 135}
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
{#if !hidePlayPause}
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
{#if width > 200}
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
{#if ($currentType === 'episode' && width > 250) || width > 100}
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
{#if $currentType === 'track'}
    {#if width > 250}
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
    {#if width > 300}
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
    {#if width > 350}
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
{:else if $currentType === 'episode'}
    <span in:fade>
        <Button id="forward-10" on:click={() => ($progress = $progress + 10000)} disabled={$disallows.seeking}>
            <i slot="button-icon" class="material-symbols-outlined"> forward_10 </i>
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
        min-width: 3.5rem;
        flex: 1 1;
    }
</style>
