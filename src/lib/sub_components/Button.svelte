<script lang="ts">
    import { optional } from '../utils';

    export let id: string;
    export let disabled = optional<boolean>();
    export let filled = optional<boolean>();
    export let selected = optional<boolean>();

    export let slot = optional<string>();

    // Styles
    export let height = optional<string>();
    export let width = optional<string>();
    export let radius = optional<string>();
    export let color = optional<string>();
    export let backgroundColor = optional<string>();
</script>

<button
    {id}
    style:--comp-button-size-height={height}
    style:--comp-button-size-width={width}
    style:--comp-button-shape-radius={radius}
    style:--comp-button-color={color}
    style:--comp-button-background-color={backgroundColor}
    class:filled
    class:icon={$$slots['button-icon']}
    class:selected={selected !== false}
    {disabled}
    type="button"
    on:click
    {...{ slot }}
    {...$$restProps}
>
    <slot name="button-icon" />
    <slot />
</button>

<style>
    button :global([slot='button-icon'].material-symbols-outlined) {
        font-size: 24px;
        font-variation-settings: 'FILL' 1;
        transition: all 0.4s;
    }

    button:not(.selected) :global([slot='button-icon'].material-symbols-outlined) {
        font-variation-settings: 'FILL' 0;
    }

    button {
        position: relative;
        display: inline-flex;
        min-width: var(--comp-button-size-width, var(--_width, 40px));
        min-height: var(--comp-button-size-height, var(--_height, 40px));
        align-items: center;
        justify-content: center;
        padding: var(--_padding, 0 24px);
        border: none;
        border-radius: var(--comp-button-shape-radius, var(--_radius, var(--corner-full)));
        background-color: var(--comp-button-background-color, rgb(var(--_background-color, transparent)));
        box-shadow: 0 0 var(--_elevation, 0) rgb(var(--scheme-color-shadow));
        color: var(--comp-button-color, rgb(var(--_color, white)));
        cursor: pointer;
        font-weight: 700;
        gap: 8px;
        letter-spacing: 0.1px;
        line-height: 20px;
        transition: all 0.4s;
        vertical-align: text-bottom;
        white-space: nowrap;

        --comp-progress-color-indicator: currentcolor;
        --comp-progress-size-width: 24px;
        --comp-progress-size-thickness: 2.5px;
    }

    button::before {
        position: absolute;
        border-radius: inherit;
        background-color: var(--comp-button-color-text, rgb(var(--_color)));
        content: '';
        inset: 0;
        opacity: 0;
    }

    button:hover:not(:disabled)::before {
        opacity: var(--hover-state-layer-opacity);
    }

    button:focus-visible:not(:disabled)::before {
        opacity: var(--focus-state-layer-opacity);
    }

    button:active:not(:disabled)::before {
        opacity: var(--pressed-state-layer-opacity);
    }

    button:disabled {
        background-color: rgb(var(--scheme-color-on-surface) / 12%);
        color: rgb(var(--scheme-color-on-surface) / 38%);
        cursor: auto;

        --_elevation: 0px;
        --_background-color: transparent;
    }

    .filled {
        --_color: var(--scheme-color-on-primary);
        --_background-color: var(--scheme-color-primary);
    }

    .filled:hover {
        --_elevation: 1px;
    }

    .icon {
        --_padding: 0;
    }

    .icon.filled:not(.selected) {
        --_color: var(--scheme-color-primary);
        --_background-color: var(--scheme-color-surface-container-highest);
    }
</style>
