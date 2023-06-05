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

// throttles calls to func
// https://stackoverflow.com/questions/27078285/simple-throttle-in-javascript#27078401
export function throttle(func: () => void, delay: number) {
	let lastTime = 0;
	return function () {
		const now = Date.now();
		if (lastTime + delay <= now) {
			func();
			lastTime = now;
		}
	};
}

// Get a devices Icon
export const typeToIcon = (type: string) =>
	((
		{
			unknown: "device_unknown",
			computer: "computer",
			tablet: "tablet",
			smartphone: "smartphone",
			speaker: "speaker",
			tv: "tv",
			avr: "dvr",
			stb: "router",
			audiodongle: "settings_remote",
			gameconsole: "sports_esports",
			castaudio: "cast",
			castvideo: "cast",
			automobile: "directions_car",
			smartwatch: "watch",
			chromebook: "laptop_chromebook",
			unknownspotify: "device_unknown",
			carthing: "devices_other",
			observer: "devices_other",
			homething: "devices_other",
			undefined: "portable_wifi_off",
		} as { [id: string]: string }
	)[type.toLowerCase().replaceAll(/[^a-z]/g, "")]);

import { get, type Readable, type Unsubscriber } from "svelte/store";

export function callFunctionWhen(
	condition: Readable<boolean>,
	callback: () => void,
	interval: number = 5000
): Unsubscriber {
	let intervalId: number | null = null;

	const unsubscribe = condition.subscribe((value: boolean) => {
		if (value) {
			if (!intervalId) {
				intervalId = setInterval(() => {
					if (get(condition)) callback();
				}, interval);
			}
		} else stopInterval();
	});

	function stopInterval() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	};

	return () => {
		stopInterval();
		unsubscribe();
	};
}
