import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { resolve } from "path";
import { createHash } from "crypto";
import JSON5 from "json5";
import { Lyrics } from "../../types";
import { getAppData } from "../util";

const lyrPath = resolve(getAppData(), "sunamu", "Lyrics Cache");

function md5(data){
	return createHash("md5").update(data).digest("hex");
}

export async function get(id: string): Promise<Lyrics | undefined>{
	const cachePath = resolve(lyrPath, md5(id));
	try {
		return JSON5.parse(await readFile(cachePath, "utf8"));
	}catch (_) {
		return undefined;
	}
}

export async function save(id: string, data: any): Promise<boolean>{
	const cachePath = resolve(lyrPath, md5(id));
	// mkdir
	try {
		mkdir(lyrPath, {recursive:true});
	}catch(_){
		return false;
	}

	// save
	try {
		await writeFile(cachePath, JSON5.stringify(data));
		return true;
	} catch (_) {
		return false;
	}
}

export async function remove(id: string): Promise<boolean>{
	const cachePath = resolve(lyrPath, md5(id));
	// save
	try {
		await rm(cachePath);
		return true;
	} catch (_) {
		return false;
	}
}
