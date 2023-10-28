<script lang="ts">
    import { subheading, title } from '../playback';
</script>

<hgroup>
    <h3>{$title}</h3>
    <p>{$subheading}</p>
</hgroup>

<style>
    hgroup {
        display: flex;
        flex-direction: column;
        justify-content: start;
        pointer-events: none;
        overflow: hidden;
    }

    hgroup * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
