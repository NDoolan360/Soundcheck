import {
	hexFromArgb,
	themeFromImage,
	type Scheme,
} from "@material/material-color-utilities";
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

const schemeToCss = (scheme: Scheme): string => {
	const json = JSON.parse(JSON.stringify(scheme));
	let style = [];
	for (const value in json) {
		const kebabCase = value
			.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
			.toLowerCase();
		style.push(`--${kebabCase}: ${hexFromArgb(json[value])};`);
	}
	return style.join(" ");
};

export const setThemeFromImage = async (images: SpotifyApi.ImageObject[]) => {
	const blob = await fetch(images.at(-1)!.url).then((response) =>
		response.blob()
	);
	let img = new Image(images.at(-1)!.width, images.at(-1)!.height);
	img.src = URL.createObjectURL(blob);
	const theme = await themeFromImage(img);
	URL.revokeObjectURL(img.src);

	const css = schemeToCss(theme.schemes.dark);
	document.body.setAttribute(
		"style",
		`--background-image: url(${images[0].url});` + css
	);
	console.log("set theme");
};

export const unfocusActive = (e: MouseEvent) =>
	(e.target as Element).hasAttribute("data-tauri-drag-region") &&
	e.buttons === 1 &&
	(document.activeElement as HTMLElement).blur();
