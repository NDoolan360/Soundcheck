<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { readable } from "svelte/store";
    import { fly } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let icon = "";
    export let active = readable(false);
    export let disable = readable(false);
    export let fill = readable(false);
    export let buttonClass = "small transparent round square no-margin";
    export let iconClass = "";
</script>

<button
    in:fly
    class={buttonClass}
    on:click={() => dispatch("action")}
    disabled={$disable}
>
    <slot>
        <i class={iconClass} class:fill-icon={$fill}>{icon}</i>
        {#if $active}
            <i class="indicator fill">circle</i>
        {/if}
    </slot>
</button>

<style>
    /* Turn off disables */
    button {
        height: 2rem;
        width: 2rem;
    }
    button:hover::after,
    button:focus::after {
        background-color: var(--active);
    }
    .indicator {
        color: inherit;
        position: absolute;
        scale: 0.2;
        transform: translateY(275%);
    }
</style>
