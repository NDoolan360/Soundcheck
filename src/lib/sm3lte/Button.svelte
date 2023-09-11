<script lang="ts">
	import { fade, type TransitionConfig } from 'svelte/transition';
	import './styles/default-scheme.css';
	import './styles/elevation.css';
	import './styles/shape.css';
	import './styles/state.css';
	import './styles/typography.css';
	import { optional } from '../utils';
	import {
		FABTypeOptions,
		type ButtonColorOptions,
		type FABOption,
		type FABTypeOption,
		type IconTypeOption,
		type TypeOption,
	} from './types';

	export let id: string;
	export let type: TypeOption | FABTypeOption | IconTypeOption = 'filled';
	export let FAB: FABOption = false;
	export let href = optional<string>();
	export let disabled: boolean = false;
	export let selected = optional<boolean>();
	export let hideIcon = optional<boolean>();

	export let slot = optional<string>();

	// Styles
	export let height = optional<string>();
	export let width = optional<string>();
	export let radius = optional<string>();
	export let color: ButtonColorOptions = {};

	// FAB defaults
	const hasFABType = FABTypeOptions.includes(type as FABTypeOption);
	if (
		FAB === true ||
		(FAB === false && hasFABType) ||
		(FAB != false && $$slots.default)
	)
		FAB = 'medium';
	if (FAB && !hasFABType) type = 'primary';
</script>

{#if href}
	<a id="{id}-anchor" aria-labelledby={id} {href}>.</a>
{/if}
<button
	{id}
	style:--sm3-comp-button-size-height={height}
	style:--sm3-comp-button-size-width={width}
	style:--sm3-comp-button-size-radius={radius}
	style:--sm3-comp-button-color-text={color.text}
	style:--sm3-comp-button-color-background={color.background}
	class="button-typography {type} {FAB ? FAB : ''}"
	class:fab={FAB != false}
	class:icon={$$slots['button-icon']}
	class:label={$$slots['default']}
	class:selected={selected === true}
	class:unselected={selected === false}
	aria-hidden={href !== undefined}
	{disabled}
	type="button"
	on:click
	on:click={() => href && document.getElementById(`${id}-anchor`)?.click()}
	{...{ slot }}
	{...$$restProps}
>
	{#if !hideIcon}
		<slot name="button-icon" />
	{/if}
	<slot />
</button>

<style>
	a {
		display: none;
	}

	button :global([slot='button-icon'].material-symbols-outlined) {
		font-size: 24px;
		font-variation-settings: 'FILL' 0;
		transition: 0.4s;
	}

	button.selected :global([slot='button-icon'].material-symbols-outlined) {
		font-variation-settings: 'FILL' 1;
	}

	button.large :global([slot='button-icon'].material-symbols-outlined) {
		font-size: 36px;
	}

	button {
		position: relative;
		display: inline-flex;
		min-width: var(--sm3-comp-button-size-width, var(--_width, 40px));
		min-height: var(--sm3-comp-button-size-height, var(--_height, 40px));
		align-items: center;
		justify-content: center;
		padding: var(--_padding, 0);
		border: var(--_border, none);
		border-radius: var(
			--sm3-comp-button-size-radius,
			var(--_radius, var(--sm3-sys-shape-corner-full-default-size))
		);
		background-color: var(
			--sm3-comp-button-color-background,
			rgb(var(--_background-color))
		);
		box-shadow: 0 0 var(--_elevation, var(--sm3-sys-elevation-level0))
			rgb(var(--sm3-scheme-color-shadow));
		color: var(--sm3-comp-button-color-text, rgb(var(--_text-color)));
		cursor: pointer;
		gap: 8px;
		transition:
			all 0.4s,
			visibility 0;
		vertical-align: text-bottom;
		white-space: nowrap;

		--sm3-comp-progress-color-indicator: currentcolor;
		--sm3-comp-progress-size-width: 24px;
		--sm3-comp-progress-size-thickness: 2.5px;
	}

	button:focus-visible {
		outline-width: 3px;
		transition: outline 0s;
	}

	button::before {
		position: absolute;
		border-radius: inherit;
		background-color: var(
			--sm3-comp-button-color-text,
			rgb(var(--_text-color))
		);
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
		background-color: rgb(var(--sm3-scheme-color-on-surface) / 12%);
		color: rgb(var(--sm3-scheme-color-on-surface) / 38%);
		cursor: auto;

		--_elevation: var(--sm3-sys-elevation-level0);
	}

	.elevated {
		--_text-color: var(--sm3-scheme-color-primary);
		--_background-color: var(--sm3-scheme-color-surface-container-low);
		--_elevation: var(--sm3-sys-elevation-level1);
	}

	.elevated:hover {
		--_elevation: var(--sm3-sys-elevation-level2);
	}

	:is(.filled, .primary) {
		--_text-color: var(--sm3-scheme-color-on-primary);
		--_background-color: var(--sm3-scheme-color-primary);
	}

	:is(.tonal, .secondary) {
		--_text-color: var(--sm3-scheme-color-on-secondary);
		--_background-color: var(--sm3-scheme-color-secondary);
	}

	:is(.filled, .tonal):hover {
		--_elevation: var(--sm3-sys-elevation-level1);
	}

	.outlined {
		--_border: 1px solid rgb(var(--sm3-scheme-color-outline));
		--_text-color: var(--sm3-scheme-color-primary);
		--_background-color: var(--sm3-scheme-color-surface);
	}

	.outlined:disabled {
		--_background-color: transparent;
		--_border: 1px solid rgb(var(--sm3-scheme-color-on-surface) / 12%);
	}

	.outlined:not(.label) {
		--_border: 1px solid rgb(var(--sm3-scheme-color-inverse-surface));
		--_text-color: var(--sm3-scheme-color-on-inverse-surface);
	}

	:is(.standard, .text) {
		--_text-color: var(--sm3-scheme-color-primary);
		--_background-color: transparent;
	}

	:is(.standard, .text):disabled {
		--_background-color: transparent;
	}

	.surface {
		--_text-color: var(--sm3-scheme-color-on-surface);
		--_background-color: var(--sm3-scheme-color-surface);
	}

	.tertiary {
		--_text-color: var(--sm3-scheme-color-on-tertiary);
		--_background-color: var(--sm3-scheme-color-tertiary);
	}

	.label.icon {
		--_padding: 0 24px 0 16px;
	}

	.label:not(.icon) {
		--_padding: 0 24px;
	}

	.text.icon {
		--_padding: 0 24px 0 16px;
	}

	.text:not(.icon) {
		--_padding: 0 12px;
	}

	.fab.label {
		--_padding: 0 16px;
	}

	.icon:not(.label) {
		--_width: 40px;
		--_height: 40px;
	}

	.icon.unselected.filled {
		--_text-color: var(--sm3-scheme-color-primary);
		--_background-color: var(--sm3-scheme-color-surface-container-highest);
	}

	.icon.unselected.tonal {
		--_text-color: var(--sm3-scheme-color-on-surface-variant);
		--_background-color: var(--sm3-scheme-color-surface-container-highest);
	}

	.icon.unselected.outlined {
		--_border: 1px solid rgb(var(--sm3-scheme-color-outline));
		--_text-color: var(--sm3-scheme-color-on-surface-variant);
	}

	.icon.unselected.standard {
		--_text-color: var(--sm3-scheme-color-on-surface-variant);
	}

	.fab.small {
		--_width: 40px;
		--_height: 40px;
		--_radius: var(--sm3-sys-shape-corner-medium-default-size);
	}

	.fab.medium {
		--_width: 56px;
		--_height: 56px;
		--_radius: var(--sm3-sys-shape-corner-large-default-size);
	}

	.fab.medium.label {
		min-width: 80px;
	}

	.fab.large {
		--_width: 96px;
		--_height: 96px;
		--_radius: var(--sm3-sys-shape-corner-extra-large-default-size);
	}
</style>
