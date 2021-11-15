import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { get as getConfig } from "./config";

export const argv = yargs(hideBin(process.argv)).argv;

export const widgetMode = checkFunctionality(getConfig("widgetMode"), "widget");
export const debugMode = checkFunctionality(getConfig("debugMode"), "debug");
export const waylandOzone = checkFunctionality(getConfig("waylandOzone"), "wayland-ozone");

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