import { Config } from "../types";
import { evaluate, patch } from "golden-fleece";
import { copyFileSync, mkdirSync, readFileSync, watchFile, writeFileSync } from "fs";
import { resolve } from "path";
import { getAppData } from "./util";

const configPath = resolve(getAppData(), "sunamu", "config.json5");
const defaultConfigPath = resolve(__dirname, "..", "..", "assets", "config.json5");

const defaultConfig: Config = evaluate(readFileSync(defaultConfigPath, "utf8"));
let config: Config = getUserConfig();

const configChangedCallbacks: Array<() => Promise<void>> = [];

if (compareAndUpdate(defaultConfig, config))
	save();

watchFile(configPath, () => {
	config = getUserConfig();

	if (compareAndUpdate(defaultConfig, config))
		save();

	broadcastConfigChanged();
});

function getUserConfig() {
	try {
		return evaluate(readFileSync(configPath, "utf8"));
	} catch (_) {
		save(false, defaultConfig);
		return defaultConfig;
	}
}

function compareAndUpdate(obj1: any, obj2: any): boolean {
	let changed = false;
	for (const key in obj1) {
		if (typeof obj1[key] !== typeof obj2[key] || Array.isArray(obj1[key]) !== Array.isArray(obj2[key])) {
			obj2[key] = obj1[key];
			changed = true;
			continue;
		}

		if (typeof obj1[key] === "object" && !Array.isArray(obj1[key]))
			changed = compareAndUpdate(obj1[key], obj2[key]) || changed;
	}

	return changed;
}

export function save(backup: boolean = true, configToSave = config) {
	mkdirSync(resolve(configPath, ".."), { recursive: true });
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
	writeFileSync(configPath, patch(readFileSync(configPath, "utf8"), configToSave));
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

export async function broadcastConfigChanged() {
	for (const cb of configChangedCallbacks) await cb();
}

// eslint-disable-next-line no-unused-vars
export function addConfigChangedCallback(cb: () => Promise<void>) {
	configChangedCallbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deleteConfigChangedCallback(cb: () => Promise<void>) {
	configChangedCallbacks.splice(configChangedCallbacks.indexOf(cb), 1);
}
