<script lang="ts">
    import { fade } from 'svelte/transition';
    import { optional } from '../utils';
    import './styles/default-scheme.css';
    import './styles/shape.css';
    import './styles/state.css';
    import type { SwitchColorOptions } from './types';

    export let label: string;
    export let checked: boolean = false;
    export let disabled: boolean = false;

    // Styles
    export let color: SwitchColorOptions = {};
    export let width = optional<string>();
    export let height = optional<string>();
    export let radius = optional<string>();
</script>

<button
    style:--sm3-comp-switch-color-foreground-on={color.foreground?.checked}
    style:--sm3-comp-switch-color-background-on={color.background?.checked}
    style:--sm3-comp-switch-color-foreground-off={color.foreground?.unchecked}
    style:--sm3-comp-switch-color-background-off={color.background?.unchecked}
    style:--sm3-comp-switch-size-width={width}
    style:--sm3-comp-switch-size-height={height}
    style:--sm3-comp-switch-size-radius={radius}
    class:checked
    aria-checked={checked}
    aria-label={label}
    {disabled}
    role="checkbox"
    on:click={() => (checked = !checked)}
    on:keydown={(e) => {
        if (e.code == 'ArrowLeft') checked = false;
        if (e.code == 'ArrowRight') checked = true;
    }}
>
    <span class:icon={checked ? $$slots['switch-checked-icon'] : $$slots['switch-unchecked-icon']}>
        {#if checked && $$slots['switch-checked-icon']}
            <div transition:fade>
                <slot name="switch-checked-icon" />
            </div>
        {:else if $$slots['switch-unchecked-icon']}
            <div transition:fade>
                <slot name="switch-unchecked-icon" />
            </div>
        {/if}
    </span>
</button>

<style>
    button {
        position: relative;
        min-width: var(--_width);
        height: var(--_height);
        padding: 0;
        border: 2px solid var(--sm3-comp-switch-color-foreground-off, rgb(var(--sm3-scheme-color-outline)));
        border-radius: var(--sm3-comp-switch-size-radius, var(--sm3-sys-shape-corner-full-default-size));
        background-color: var(
            --sm3-comp-switch-color-background-off,
            rgb(var(--sm3-scheme-color-surface-container-highest))
        );
        cursor: pointer;
        transition:
            outline-width 0s,
            background-color 0.4s,
            color 0.4s,
            border-color 0.4s;

        --_width: var(--sm3-comp-switch-size-width, 52px);
        --_height: var(--sm3-comp-switch-size-height, 32px);
    }

    button::before {
        position: absolute;
        border-radius: inherit;
        background-color: var(--sm3-comp-switch-color-background-on, rgb(var(--sm3-scheme-color-primary)));
        content: '';
        inset: 0;
        opacity: 0;
    }

    button:hover:not(:disabled)::before {
        opacity: var(--sm3-sys-state-hover-state-layer-opacity);
    }

    button:focus-visible:not(:disabled)::before {
        opacity: var(--sm3-sys-state-focus-state-layer-opacity);
    }

    button:active:not(:disabled)::before {
        opacity: var(--sm3-sys-state-pressed-state-layer-opacity);
    }

    button:disabled {
        border-color: rgb(var(--sm3-scheme-color-on-surface) / 12%);
        background-color: rgb(var(--sm3-scheme-color-surface-container-highest) / 12%);
    }

    button.checked {
        border-color: transparent;
        background-color: var(--sm3-comp-switch-color-background-on, rgb(var(--sm3-scheme-color-primary)));
    }

    button.checked::before {
        background-color: var(--sm3-comp-switch-color-background-on, rgb(var(--sm3-scheme-color-primary)));
    }

    button.checked:disabled {
        background-color: rgb(var(--sm3-scheme-color-on-surface) / 12%);
    }

    span {
        position: absolute;
        display: grid;
        height: 87.5%;
        border-radius: inherit;
        margin: 0 3.125%;
        aspect-ratio: 1;
        pointer-events: none;
        transform: translateY(-50%);
        transition:
            all 0.4s,
            visibility 0s;
    }

    button span {
        left: 0;
        background-color: var(--sm3-comp-switch-color-foreground-off, rgb(var(--sm3-scheme-color-outline)));
        color: var(--sm3-comp-switch-color-background-off, rgb(var(--sm3-scheme-color-surface-container-highest)));
    }

    button.checked span {
        left: calc(var(--_width) - var(--_height));
        background-color: var(--sm3-comp-switch-color-foreground-on, rgb(var(--sm3-scheme-color-on-primary)));
        color: var(--sm3-comp-switch-color-background-on, rgb(var(--sm3-scheme-color-primary)));
    }

    button span:not(.icon) {
        height: 50%;
        margin: 0 12.5%;
    }

    button:disabled span {
        background-color: rgb(var(--sm3-scheme-color-on-surface) / 38%);
        color: rgb(var(--sm3-scheme-color-surface));
    }

    button.checked span:not(.icon) {
        height: 75%;
        margin: 0 6.75%;
    }

    button.checked:disabled span {
        background-color: rgb(var(--sm3-scheme-color-surface));
        color: rgb(var(--sm3-scheme-color-on-surface) / 38%);
    }

    div {
        height: 100%;
        aspect-ratio: 1;
        grid-column: 1;
        grid-row: 1;
    }

    div :global(*) {
        position: absolute;
        height: calc(var(--_height) / 2);
        margin: auto 0;
        inset: 0;
    }

    div :global([slot='switch-checked-icon'].material-symbols-outlined),
    div :global([slot='switch-unchecked-icon'].material-symbols-outlined) {
        font-size: 100%;
        font-variation-settings: 'FILL' 0;
    }
</style>
