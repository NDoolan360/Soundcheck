<script lang="ts">
    import { window as tauriWindow } from '@tauri-apps/api';
    import { type, type OsType } from '@tauri-apps/api/os';
    import Button from '../sub_components/Button.svelte';
    import { onMount } from 'svelte';
    import { inBrowser } from '../utils';

    type Os = 'mac-os' | 'windows' | 'linux';

    const osMap: Record<OsType, Os> = {
        Darwin: 'mac-os',
        Windows_NT: 'windows',
        Linux: 'linux',
    };

    let os: Os;

    onMount(async () => {
        const osType = !inBrowser ? await type() : 'Windows_NT';
        os = osMap[osType];
    });
</script>

<aside class={os}>
    <Button
        id="close-button"
        on:click={() => {
            tauriWindow.WebviewWindow.getByLabel('player')?.close();
            tauriWindow.WebviewWindow.getByLabel('auth')?.close();
        }}
    >
        <svg
            slot="button-icon"
            width={os === 'windows' ? 14 : os === 'linux' ? 8 : 8}
            height={os === 'windows' ? 14 : os === 'linux' ? 8 : 8}
            viewBox="0 0 10 10"
            stroke="currentColor"
            stroke-width={os === 'mac-os' ? 2.5 : 1}
        >
            <path d="M 1.25,1.25 8.75,8.75" />
            <path d="M 1.25,8.75 8.75,1.25" />
        </svg>
    </Button>
</aside>

<style>
    aside {
        position: fixed;
        top: 0;
        right: 0;
    }

    :global(#close-button::before) {
        opacity: 0 !important;
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
