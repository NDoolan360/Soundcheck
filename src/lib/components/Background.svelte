<script lang="ts">
    import { fade } from 'svelte/transition';
    import { images } from '../playback';
    import { artworkFillMode } from '../settings';
</script>

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

<style>
    div {
        display: flex;
        flex-direction: column;
        justify-content: start;
    }

    :is(img, #lowres-image) {
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
</style>
