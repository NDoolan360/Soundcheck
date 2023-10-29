<script lang="ts">
    import { window as tauriWindow } from '@tauri-apps/api';
    import { type, type OsType } from '@tauri-apps/api/os';
    import Button from '../sub_components/Button.svelte';

    const getType = async () => {
        const osType = await type();
        const osMap: Record<OsType, 'mac-os' | 'windows' | 'linux'> = {
            Darwin: 'mac-os',
            Windows_NT: 'windows',
            Linux: 'linux',
        };
        return osMap[osType];
    };
</script>

{#await getType() then type}
    <aside class={type}>
        <Button
            id="close-button"
            on:click={() => {
                tauriWindow.WebviewWindow.getByLabel('player')?.close();
                tauriWindow.WebviewWindow.getByLabel('auth')?.close();
            }}
        >
            <svg
                slot="button-icon"
                width={type === 'windows' ? 14 : type === 'linux' ? 8 : 8}
                height={type === 'windows' ? 14 : type === 'linux' ? 8 : 8}
                viewBox="0 0 10 10"
                stroke="currentColor"
                stroke-width={type === 'mac-os' ? 2.5 : 1}
            >
                <path d="M 1.25,1.25 8.75,8.75" />
                <path d="M 1.25,8.75 8.75,1.25" />
            </svg>
        </Button>
    </aside>
{/await}

<style>
    aside {
        position: fixed;
        top: 0;
        right: 0;
    }

    :global(.windows #close-button) {
        --comp-button-size-height: 2rem;
        --comp-button-size-width: 3rem;
        --comp-button-shape-radius: 0;
        --comp-button-background-color: transparent;
    }

    :global(.windows #close-button:is(:hover, :focus-visible)) {
        --comp-button-background-color: #c42b1c;
    }

    :global(:is(.mac-os, .linux) #close-button) {
        margin: 1.6rem 1.6rem 0 0;
        translate: 50% -50%;
    }

    :global(.mac-os #close-button) {
        box-sizing: border-box;
        padding: 0.2rem;
        border: #c13734 1px solid;

        --comp-button-size-height: 1rem;
        --comp-button-size-width: 1rem;
        --comp-button-shape-radius: 50%;
        --comp-button-color: transparent;
        --comp-button-background-color: #fc5753;
    }

    :global(.mac-os #close-button:is(:hover, :focus-visible)) {
        --comp-button-color: #7e0508;
    }

    :global(.mac-os #close-button:active) {
        --comp-button-color: #7e0508;
        --comp-button-background-color: #c13734;
    }

    :global(.linux #close-button) {
        --comp-button-size-height: 1.5rem;
        --comp-button-size-width: 1.5rem;
        --comp-button-shape-radius: 50%;
    }

    @media (prefers-color-scheme: dark) {
        :global(.linux #close-button) {
            --comp-button-color: #fff;
            --comp-button-background-color: #373737;
        }

        :global(.linux #close-button:is(:hover, :focus-visible)) {
            --comp-button-background-color: #424242;
        }

        :global(.linux #close-button:active) {
            --comp-button-background-color: #565656;
        }
    }

    @media (prefers-color-scheme: light) {
        :global(.linux #close-button) {
            --comp-button-color: #3d3d3d;
            --comp-button-background-color: #dadada;
        }

        :global(.linux #close-button:is(:hover, :focus-visible)) {
            --comp-button-background-color: #d1d1d1;
        }

        :global(.linux #close-button:active) {
            --comp-button-background-color: #bfbfbf;
        }
    }
</style>
