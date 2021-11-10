import { resolve } from "path";
import JSON5 from "json5";
import { copyFile, readFile } from "fs/promises";
import { app } from "electron";

export function debug(...args: any) {
	if (process.env.DEBUG)
		console.log(...args);
}

export async function getConfig() {
	const configPath = resolve(app.getPath("appData"), "sunamu", "config.json5");
	const defaultConfigPath = resolve(__dirname, "..", "assets", "config.json5");
	try {
		return JSON5.parse(await readFile(configPath, "utf8"));
	} catch (_) {
		await copyFile(defaultConfigPath, configPath);
		JSON5.parse(await readFile(configPath, "utf8"));
	}
}