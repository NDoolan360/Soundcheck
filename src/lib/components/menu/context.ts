import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

export type MenuContextOptions = {
	open?: Writable<boolean>;
	size?: string;
};

export const setMenuOptions = (
	open: Writable<boolean> | undefined,
	size: string | undefined,
) => setContext<MenuContextOptions>('menuCtx', { open, size });

export const getMenuOptions = () => getContext<MenuContextOptions>('menuCtx');
