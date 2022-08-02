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

if (compare(config, defaultConfig, true))
	save();

watchFile(configPath, () => {
	const _config = getUserConfig();

	if (compare(config, _config, false)){
		config = _config;
		broadcastConfigChanged();
	}

});

function getUserConfig() {
	try {
		return evaluate(readFileSync(configPath, "utf8"));
	} catch (_) {
		save(false, defaultConfig);
		return defaultConfig;
	}
}

function compare(a: any, b: any, update: boolean = false): boolean {
	let changed = false;
	for (const key in b) {
		if (typeof b[key] !== typeof a[key] || Array.isArray(b[key]) !== Array.isArray(a[key])) {
			if(update)
				a[key] = b[key];
			changed = true;
			continue;
		}

		if (typeof b[key] === "object" && !Array.isArray(b[key]))
			changed = compare(a[key], b[key], update) || changed;
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
	try{
		writeFileSync(configPath, patch(readFileSync(configPath, "utf8"), configToSave));
	}catch(_){
		writeFileSync(configPath, patch(readFileSync(defaultConfigPath, "utf8"), configToSave));
	}
}

export function consolidateToDefaultConfig(){
	return writeFileSync(configPath, patch(readFileSync(defaultConfigPath, "utf8"), config));
}

export function get<T = any>(name: string): T {
	return config[name];
}

export function getAll(): Config {
	return Object.assign({}, config);
}

export function set<T = any>(name: string, value: T){
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
