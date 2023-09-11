export function optional<T>(): T | undefined {
	return undefined;
}

export const clamp = (min: number, value: number, max: number) =>
	Math.min(Math.max(min, value), max);

const newEventsListener = (
	events: string[],
	listener: (...args: any) => void,
) => {
	events.forEach(event => document.addEventListener(event, listener));
	return {
		destroy() {
			events.forEach(event =>
				document.removeEventListener(event, listener),
			);
		},
	};
};

export const loseFocus = (node: HTMLElement, callback: Function) =>
	newEventsListener(
		['mousedown', 'mouseleave', 'touchstart', 'focusin'],
		({ target }: Event) => {
			if (!node.contains(target as HTMLElement)) callback();
		},
	);

export const gainFocus = (node: HTMLElement, callback: Function) =>
	newEventsListener(
		['mouseover', 'touchstart', 'focusin'],
		({ target }: Event) => {
			if (node.contains(target as HTMLElement)) callback();
		},
	);
