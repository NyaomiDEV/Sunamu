import { Config } from "../types";
import JSON5 from "json5";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getAppData } from "./util";

const configPath = resolve(getAppData(), "sunamu", "config.json5");
const defaultConfigPath = resolve(__dirname, "..", "..", "assets", "config.json5");

const defaultConfig: Config = JSON5.parse(readFileSync(defaultConfigPath, "utf8"));
const config: Config = getUserConfig();

if (compareAndUpdate(defaultConfig, config))
	save();

function getUserConfig() {
	try {
		return JSON5.parse(readFileSync(configPath, "utf8"));
	} catch (_) {
		mkdirSync(resolve(defaultConfigPath, ".."), {recursive: true});
		copyFileSync(defaultConfigPath, configPath);
		return defaultConfig;
	}
}

function compareAndUpdate(obj1: any, obj2: any): boolean {
	let changed = false;
	for (const key in obj1) {
		if (typeof obj1[key] !== typeof obj2[key] || Array.isArray(obj1[key]) !== Array.isArray(obj2[key])) {
			console.log(obj1[key], obj2[key]);
			obj2[key] = obj1[key];
			changed = true;
			continue;
		}

		if (typeof obj1[key] === "object" && !Array.isArray(obj1[key]))
			changed = compareAndUpdate(obj1[key], obj2[key]) || changed;
	}

	return changed;
}

export function save(backup: boolean = true) {
	if(backup){
		const now = new Date();
		const date = now.getFullYear().toString().padStart(4, "0") +
			now.getMonth().toString().padStart(2, "0") +
			now.getDay().toString().padStart(2, "0") + "-" +
			now.getHours().toString().padStart(2, "0") +
			now.getMinutes().toString().padStart(2, "0") +
			now.getSeconds().toString().padStart(2, "0");
		copyFileSync(configPath, configPath + ".backup-" + date);
	}
	writeFileSync(configPath, JSON5.stringify(config, undefined, 2));
}

export function get(name: string) {
	return config[name] || undefined;
}

export function getAll(): Config {
	return Object.assign({}, config);
}

export function set(name: string, value: any){
	config[name] = value;
	save(false);
}