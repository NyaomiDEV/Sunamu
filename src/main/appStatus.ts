import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { get as getConfig } from "./config";

export const argv = yargs(hideBin(process.argv)).argv;

export const widgetModeElectron = checkFunctionality(getConfig("scenes").electron.widgetMode, "widget-electron");
export const widgetMode = checkFunctionality(getConfig("scenes").default.widgetMode, "widget");
export const debugMode = checkFunctionality(getConfig("debugMode"), "sunamu-debug");
export const devTools = checkFunctionality(getConfig("devToolsAtStartup"), "sunamu-devtools");
export const consolidateConfig = checkFunctionality(false, "consolidate-config");
export const lyricsActive = checkFunctionality(getConfig("lyricsActive"), "lyrics");

export const useElectron = checkFunctionality(getConfig("useElectron"), "electron");
export const useWebserver = checkFunctionality(getConfig("useWebserver"), "webserver");

export function checkFunctionality(configBoolean: boolean, name: string): boolean {
	return checkSwitch(argv[name.toLowerCase()]) ?? checkSwitch(process.env[name.replace(/-/g, "_").toUpperCase()]) ?? configBoolean;
}

export function checkSwitch(str?: string | boolean): boolean | undefined {
	if(typeof str === "boolean") return str;

	if (!str)
		return undefined;

	switch (str?.toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;
		case "false":
		case "no":
		case "0":
		case null:
		case undefined:
			return false;
	}

	return Boolean(str);
}
