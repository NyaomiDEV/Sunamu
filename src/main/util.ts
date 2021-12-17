import { resolve } from "path";

export const spotiId = /spotify:track:(.+)/;

export function getAppData() {
	switch (process.platform) {
		case "linux":
			if (process.env.XDG_CONFIG_HOME) return resolve(process.env.XDG_CONFIG_HOME);
			return resolve(process.env.HOME!, ".config");
		case "win32":
			return resolve(process.env.APPDATA!);
		default:
			return "";
	}
}

export function secondsToTime(duration: number) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

