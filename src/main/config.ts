import { Config } from "../types";
import JSON5 from "json5";
import { copyFileSync, readFileSync, statSync } from "fs";
import { resolve } from "path";
import { app } from "electron";

const configPath = resolve(app.getPath("appData"), "sunamu", "config.json5");
const defaultConfigPath = resolve(__dirname, "..", "..", "assets", "config.json5");

const config: Config = JSON5.parse(readFileSync(defaultConfigPath, "utf8"));

export function copyDefaultConfig() {
	try {
		statSync(configPath);
	} catch (_) {
		copyFileSync(defaultConfigPath, configPath);
	}
}

export function get(name: string){
	return config[name] || undefined;
}

export function getAll(): Config {
	return Object.assign({}, config);
}