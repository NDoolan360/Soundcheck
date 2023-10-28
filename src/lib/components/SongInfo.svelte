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
        overflow: hidden;
        flex-direction: column;
        justify-content: start;
        pointer-events: none;
    }

    hgroup * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
