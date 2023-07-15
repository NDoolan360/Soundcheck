import { getContext, setContext } from 'svelte';

export type ButtonContextOptions = {
	size?: string;
	color?: string;
	background?: string;
};

export const setButtonOptions = (
	size: string | undefined = undefined,
	color: string | undefined = undefined,
	background: string | undefined = undefined,
) => setContext<ButtonContextOptions>('buttonCtx', { size, color, background });

export const getButtonOptions = () =>
	getContext<ButtonContextOptions>('buttonCtx');
