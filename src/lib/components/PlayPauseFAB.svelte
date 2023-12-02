<script lang="ts">
    import { fade } from 'svelte/transition';
    import Button from '../sub_components/Button.svelte';
    import ProgressIndicator from '../sub_components/ProgressIndicator.svelte';
    import { disallows, loading, playing } from '../playback';
    import { toggle } from '../utils';
</script>

<span in:fade>
    <Button
        id="play-pause-fab"
        width="56px"
        height="56px"
        filled
        radius={$playing ? 'var(--corner-large)' : '50%'}
        on:click={() => toggle(playing)}
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

<style>
    span {
        display: flex;
        max-width: 100%;
        flex-flow: row wrap;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.35rem;
        pointer-events: none;
    }

    i {
        font-variation-settings: 'FILL' 1 !important;
    }
</style>
