import { debugMode } from "./appStatus";

export function debug(...args: any) {
	if (debugMode)
		console.log(...args);
}
