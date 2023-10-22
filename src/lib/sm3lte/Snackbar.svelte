<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { fly } from 'svelte/transition';
    import { optional } from '../utils';
    import Button from './Button.svelte';
    import './styles/default-scheme.css';
    import './styles/elevation.css';
    import './styles/shape.css';
    import './styles/typography.css';
    import type { SnackbarColorOptions } from './types';

    const dispatch = createEventDispatcher();

    let actionsWidth: number;

    // Variables
    export let visible = false;
    export let duration = 3500;
    export let dismissable = false;
    export let hideAction = false;
    export let alignLeft = false;

    // Styles
    export let height = optional<string>();
    export let width = optional<string>();
    export let color: SnackbarColorOptions = {};

    export let progress = tweened(0, { duration });

    export const open = () => {
        dispatch('open');
        visible = true;
        progress.set(0, { duration: 0 });
        progress.set(100, { duration }).then(close);
    };
    export const close = () => {
        visible = false;
        progress.set(0, { duration: 0 });
        dispatch('close');
    };

    $: hasActions = $$slots['snackbar-action-label'] || dismissable;
</script>

{#if visible}
    <aside
        style:flex-wrap={actionsWidth > 120 ? 'wrap' : 'nowrap'}
        style:margin={alignLeft ? '8px' : '8px auto'}
        style:--sm3-comp-snackbar-size-height={height}
        style:--sm3-comp-snackbar-size-width={width}
        style:--sm3-comp-snackbar-color-text={color.text}
        style:--sm3-comp-snackbar-color-actions={color.text}
        style:--sm3-comp-snackbar-color-background={color.background}
        class="elevation-3 shape-extra-small"
        class:has-actions={hasActions}
        aria-relevant="additions"
        role="status"
        transition:fly={{ y: 20 }}
    >
        <span class="text body-medium" aria-atomic="false">
            <slot />
        </span>
        {#if hasActions}
            <div class="actions" aria-atomic="true" bind:clientWidth={actionsWidth}>
                {#if !hideAction}
                    <slot name="snackbar-action-label" />
                {/if}
                {#if dismissable}
                    <Button
                        id="dismiss-snackbar"
                        color={{
                            text: `var(--sm3-comp-snackbar-color-text,
										rgb(var(--sm3-scheme-color-inverse-on-surface)))`,
                        }}
                        type="standard"
                        on:click={close}
                    >
                        <i slot="button-icon" class="material-symbols-outlined">close</i>
                    </Button>
                {/if}
            </div>
        {/if}
    </aside>
{/if}

<style>
    aside {
        position: fixed;
        z-index: 999;
        display: flex;
        width: 100%;
        width: var(--sm3-comp-snackbar-size-width, 100%);
        min-height: var(--sm3-comp-snackbar-size-height, 48px);
        flex-direction: row;
        align-items: center;
        justify-content: center;
        justify-content: start;
        background-color: var(--sm3-comp-snackbar-color-background, rgb(var(--sm3-scheme-color-inverse-surface)));
        gap: 0;
        inset: auto 0 0;
        pointer-events: none;
    }

    @media (width >= 800px) {
        aside {
            max-width: var(--sm3-comp-snackbar-size-width, 450px);
        }
    }

    .text::before {
        display: var(--sm3-comp-snackbar-val-pretext, none);
        width: 100%;
        content: var(--sm3-comp-snackbar-val-pretext);
    }

    .text {
        flex-shrink: 1;
        padding: 16px;
        color: var(--sm3-comp-snackbar-color-text, rgb(var(--sm3-scheme-color-inverse-on-surface)));
        gap: 0;
    }

    .has-actions .surface .text {
        padding-right: 8px;
    }

    .actions {
        display: flex;
        min-height: 48px;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: right;
        padding: 4px;
        margin: auto 0 auto auto;
        gap: 4px;
        pointer-events: auto;
    }

    .actions :global([slot='snackbar-action-label']) {
        color: var(--sm3-comp-snackbar-color-actions, rgb(var(--sm3-scheme-color-inverse-primary)));

        --sm3-comp-button-color-text: var(
            --sm3-comp-snackbar-color-actions,
            rgb(var(--sm3-scheme-color-inverse-primary))
        );
    }
</style>
