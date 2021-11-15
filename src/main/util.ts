import { resolve } from "path";
import JSON5 from "json5";
import { copyFile, readFile } from "fs/promises";
import { app } from "electron";
import { Config } from "../types";

export function debug(...args: any) {
	if (process.env.DEBUG)
		console.log(...args);
}

export async function getConfig(): Promise<Config> {
	const configPath = resolve(app.getPath("appData"), "sunamu", "config.json5");
	const defaultConfigPath = resolve(__dirname, "..", "assets", "config.json5");
	try {
		return JSON5.parse(await readFile(configPath, "utf8"));
	} catch (_) {
		await copyFile(defaultConfigPath, configPath);
		return JSON5.parse(await readFile(configPath, "utf8"));
	}
}

export function checkSwitch(str?: string): boolean{
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

export function checkFunctionality(configBoolean: boolean, envString?: string | undefined): boolean{
	const envOverride = (!!envString);
	const envValue = checkSwitch(envString);

	if (
		!(
			(envOverride && envValue) ||
			(!envOverride && configBoolean)
		)
	) return false;

	return true;
}