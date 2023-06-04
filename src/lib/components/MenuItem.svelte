<script lang="ts">
    export let icon: string;
    export let text: string;
    export let action: () => void;
    export let color = "fill";
</script>

<button class="small left-align no-margin no-radius {color}" on:click={action}>
    <i class="tiny"> {icon} </i>
    <span class="small-text"> {text} </span>
</button>

<style>
    button {
        max-height: 1.5rem;
        width: 100%;
        padding: 0 0.5rem 0 1rem;
        overflow: hidden;
    }
    span {
        width: 100%;
        white-space: nowrap !important;
        width: calc(100% - 2.5rem);
        overflow-x: hidden;
        text-overflow: ellipsis;
    }
</style>
