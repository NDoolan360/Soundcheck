<script lang="ts">
    import { window as tauriWindow } from '@tauri-apps/api';
    import Button from '../sub_components/Button.svelte';
</script>

<aside>
    <Button
        id="close-button"
        height="2rem"
        width="3rem"
        radius="0"
        on:click={() => {
            tauriWindow.WebviewWindow.getByLabel('player')?.close();
            tauriWindow.WebviewWindow.getByLabel('auth')?.close();
        }}
    >
        <i slot="button-icon" class="material-symbols-outlined"> close </i>
    </Button>
</aside>

<style>
    aside {
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
    }

    :global(#close-button:is(:hover, :focus-visible)) {
        --comp-button-background-color: red;
    }
</style>
