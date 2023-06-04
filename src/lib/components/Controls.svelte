<script lang="ts">
    import { lowerControls } from "$lib/controls";
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
</script>

{#each $lowerControls as control (control.id)}
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
