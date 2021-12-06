import { resolve } from "path";

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