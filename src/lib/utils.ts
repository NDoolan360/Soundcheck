import {
	Car,
	Cast,
	Chrome,
	Gamepad2,
	HelpCircle,
	Monitor,
	MonitorSmartphone,
	RadioReceiver,
	Smartphone,
	Speaker,
	Tablet,
	Tv,
	Unplug,
	Usb,
	Watch,
} from "lucide-svelte";
import type { ComponentType } from "svelte";

// Util for converting raw times to pretty times
export const prettyTime = (rawTime: number) => {
	const date = new Date(rawTime ?? 0);
	return date.getUTCHours() > 0
		? date.toISOString().substring(11, 19)
		: date.toISOString().substring(14, 19);
};

// Util for transitioning repeat state
export const nextRepeat = (state: string) =>
	state === "off" ? "context" : state === "context" ? "track" : "off";

// Get a devices Icon
export const deviceTypeToIcon = (type: string | undefined) =>
	((
		{
			unknown: HelpCircle,
			computer: Monitor,
			tablet: Tablet,
			smartphone: Smartphone,
			speaker: Speaker,
			tv: Tv,
			avr: RadioReceiver,
			stb: RadioReceiver,
			audiodongle: Usb,
			gameconsole: Gamepad2,
			castaudio: Cast,
			castvideo: Cast,
			automobile: Car,
			smartwatch: Watch,
			chromebook: Chrome,
			unknownspotify: HelpCircle,
			carthing: MonitorSmartphone,
			observer: MonitorSmartphone,
			homething: MonitorSmartphone,
			undefined: Unplug,
		} as { [id: string]: ComponentType }
	)[(type ?? "undefined").toLowerCase().replaceAll(/[^a-z]/g, "")]);

export const toCss = (data: IMaterialDynamicColorsThemeColor): string => {
	let style = [];
	for (const value in data) {
		const kebabCase = value
			.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
			.toLowerCase();
		style.push(
			`--${kebabCase}: ${
				data[value as keyof IMaterialDynamicColorsThemeColor]
			};`
		);
	}
	return style.join(" ");
};

export const unfocusActive = (e: MouseEvent) =>
	(e.target as Element).hasAttribute("data-tauri-drag-region") &&
	e.buttons === 1 &&
	(document.activeElement as HTMLElement).blur();
