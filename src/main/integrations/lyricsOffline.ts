import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { extname, resolve } from "path";
import { createHash } from "crypto";
import JSON5 from "json5";
import { Lyrics } from "../../types";
import { getAppData, gzipCompress, gzipDecompress } from "../util";

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

export async function convertUncompressed(): Promise<void>{
	const lyrics = await readdir(lyrPath);
	for(const file of lyrics){
		if(extname(file) === ".gz") continue;
		
		const path = resolve(lyrPath, file);
		await writeFile(path + ".gz", await gzipCompress(await readFile(path)));
		await rm(path);
	}
}