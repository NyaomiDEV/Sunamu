import { resolve } from "path/posix";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { get as getConfig } from "./config";

export const argv = yargs(hideBin(process.argv)).argv;

export const widgetMode = checkFunctionality(getConfig("widgetMode"), "widget");
export const widgetModeWeb = checkFunctionality(getConfig("widgetModeWeb"), "widget-web");
export const debugMode = checkFunctionality(getConfig("debugMode"), "debug");
export const waylandOzone = checkFunctionality(getConfig("waylandOzone"), "wayland-ozone");

export const useElectron = checkFunctionality(getConfig("useElectron"), "electron");
export const useWebserver = checkFunctionality(getConfig("useWebserver"), "webserver");

export function checkFunctionality(configBoolean: boolean, name: string): boolean {
	return argv[name.toLowerCase()] ?? checkSwitch(process.env[name.replace(/-/g, "_").toUpperCase()]) ?? configBoolean;
}

export function checkSwitch(str?: string): boolean | undefined {
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

export function getAppData(){
	switch(process.platform){
		case "linux":
			if(process.env.XDG_CONFIG_HOME) return resolve(process.env.XDG_CONFIG_HOME);
			return resolve(process.env.HOME!, ".config");
		case "win32":
			return resolve(process.env.APPDATA!);
		default:
			return "";
	}
}
