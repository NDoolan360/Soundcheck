<script lang="ts">
    import { readable, type Readable } from "svelte/store";
    import IconButton from "./IconButton.svelte";

    export let align: string;
    export let icon: Readable<string> = readable("");
</script>

<IconButton {icon} class="mini circle">
    <slot name="icon" slot="icon">
        <i class="tiny">{$icon}</i>
    </slot>
    <menu class={align}>
        <slot />
    </menu>
</IconButton>

<style>
    menu {
        width: min-content;
        overflow-y: overlay !important;
        max-width: calc(100vw - 1rem) !important;
        max-height: calc(100vh - 3rem) !important;
    }
    /* Scrollbar */
    menu::-webkit-scrollbar {
        width: 0.5rem;
    }
    menu::-webkit-scrollbar-thumb {
        background: var(--active);
        border-radius: 0.25rem;
    }
</style>
