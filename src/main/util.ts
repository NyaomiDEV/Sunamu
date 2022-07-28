import { resolve } from "path";
import { gzip, gunzip } from "zlib";

export const spotiId = /spotify:track:(.+)/;

export function getAppData() {
	switch (process.platform) {
		case "linux":
			if (process.env.XDG_CONFIG_HOME) return resolve(process.env.XDG_CONFIG_HOME);
			return resolve(process.env.HOME!, ".config");
		case "win32":
			return resolve(process.env.APPDATA!);
		default:
			return "";
	}
}

export function secondsToTime(duration: number) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export function gzipCompress(buffer: Buffer | string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		gzip(buffer, (error, result) => {
			if (error) reject(error);
			else resolve(result);
		});
	});
}

export function gzipDecompress(buffer: Buffer | string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		gunzip(buffer, (error, result) => {
			if (error) reject(error);
			else resolve(result);
		});
	});
}

export function humanDimensionToBytes(dimension: string): number {
	const sizes = ["B", "K", "M", "G", "T", "P", "E", "Z", "Y"];

	const match = dimension.toUpperCase().match(/(\d+[,.]?\d*)([BKMGTPEZY]?)/);

	if(!match || !match[1]) return NaN;
	
	let [ , number, weight ] = match;
	if(!weight) weight = "B";

	return Number(number) * Math.pow(1000, sizes.indexOf(weight)); // IEC standard
}
