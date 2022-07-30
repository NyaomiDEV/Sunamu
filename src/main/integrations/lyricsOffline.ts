import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import { extname, resolve } from "path";
import { createHash } from "crypto";
import JSON5 from "json5";
import { Lyrics } from "../../types";
import { getAppData, gzipCompress, gzipDecompress, humanDimensionToBytes } from "../util";
import { get as getConfig } from "../config";
import { debug } from "..";

import type { Stats } from "fs";

const lyrPath = resolve(getAppData(), "sunamu", "Lyrics Cache");

function md5(data){
	return createHash("md5").update(data).digest("hex");
}

export async function get(id: string): Promise<Lyrics | undefined>{
	const cachePath = resolve(lyrPath, md5(id) + ".gz");
	try {
		return JSON5.parse((await gzipDecompress(await readFile(cachePath))).toString());
	}catch (_) {
		return undefined;
	}
}

export async function save(id: string, data: any): Promise<boolean>{
	const cachePath = resolve(lyrPath, md5(id) + ".gz");
	// mkdir
	try {
		mkdir(lyrPath, {recursive:true});
	}catch(_){
		return false;
	}

	// save
	try {
		await writeFile(cachePath, await gzipCompress(JSON5.stringify(data)));
		return true;
	} catch (_) {
		return false;
	}
}

export async function remove(id: string): Promise<boolean>{
	const cachePath = resolve(lyrPath, md5(id) + ".gz");
	// save
	try {
		await rm(cachePath);
		return true;
	} catch (_) {
		return false;
	}
}

async function convertUncompressed(): Promise<void>{
	try{
		const lyrics = await readdir(lyrPath);
		for (const file of lyrics) {
			if (extname(file) === ".gz") continue;

			const path = resolve(lyrPath, file);
			await writeFile(path + ".gz", await gzipCompress(await readFile(path)));
			await rm(path);
		}
	} catch(_){
		debug("Cannot convert uncompressed lyrics; probably the cache path does not exist.");
	}
}

async function statCachePath(): Promise<Map<string, Stats> | undefined>{
	try{
		const lyrics = await readdir(lyrPath);
		const stats = new Map<string, Stats>();

		stats[Symbol.iterator] = function* statsIterator() {
			yield* [...this.entries()].sort((a, b) => a[1].atimeMs - b[1].atimeMs);
		};

		for (const file of lyrics) {
			const path = resolve(lyrPath, file);
			stats.set(file, await stat(path));
		}

		return stats;
	}catch(_){
		debug("Cannot stat lyrics cache path; probably it does not exist.");
		return undefined;
	}
}

async function trimPathTo(targetSize: number): Promise<any> {
	debug("Target lyrics cache size in bytes:", targetSize);

	const currentStats = [...await statCachePath() || []];
	const cacheSize = currentStats.map(x => x[1].size).reduce((_prev, _cur) => _prev + _cur, 0);

	let filesRemoved = 0;
	let bytesFreed = 0;

	while(cacheSize - bytesFreed > targetSize){
		const pair = currentStats.shift();
		if(!pair)
			break;

		await rm(resolve(lyrPath, pair[0]));
		bytesFreed += pair[1].size;
		filesRemoved++;
	}

	debug("Deleted", filesRemoved, "old lyrics for a total of", bytesFreed, "bytes");
	debug("New lyrics cache size in bytes:", cacheSize - bytesFreed);

	return [filesRemoved, bytesFreed, cacheSize - bytesFreed];
}

export async function manageLyricsCache(){
	await convertUncompressed(); // just to be sure

	const cacheStats = await statCachePath();

	if(!cacheStats)
		return;

	debug("Total cached lyrics:", cacheStats.size);

	const cacheSize = [...cacheStats].map(x => x[1].size).reduce((_prev, _cur) => _prev + _cur, 0);
	debug("Current lyrics cache size in bytes:", cacheSize);

	const targetSize = humanDimensionToBytes(getConfig("targetLyricsCacheSize"));

	if(targetSize && Number(targetSize) > 0) 
		await trimPathTo(targetSize);
}