<script lang="ts">
    import { authenticated } from "$lib/stores";
    import { invoke } from "@tauri-apps/api";
    import { appWindow } from "@tauri-apps/api/window";

    let loading: boolean = false;
    const authenticate = () => {
        loading = true;
        invoke("authenticate", { window: appWindow })
            .then(() => {
                $authenticated = true;
            })
            .catch(console.error)
            .finally(() => (loading = false));
    };
</script>

<button on:click={authenticate}>
    {#if loading}
        <span class="loader small black" />
        <span>Loading...</span>
    {:else}
        <i>login</i>
        <span>Log in</span>
    {/if}
</button>
