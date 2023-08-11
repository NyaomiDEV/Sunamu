import { readFile } from "fs/promises";
import type { Lyrics, Metadata } from "../../types";
import { parseLrc } from "./lrc";
import { basename, dirname, extname, sep } from "path";

export const name = "Local";
export const supportedPlatforms = ["linux"];

export async function query(metadata: Metadata): Promise<Lyrics | undefined> {
	if (metadata.location?.protocol !== "file:") {
		console.error("Could not get lyrics from Local: Location is not local.");
		return undefined;
	}

	try{
		const reply: Lyrics = {
			provider: "Local",
			synchronized: false,
			copyright: undefined,
			lines: []
		};

		const lrcLocation = 
			dirname(decodeURI(metadata.location.pathname)) + sep +
			basename(decodeURI(metadata.location.pathname), extname(decodeURI(metadata.location.pathname))) + ".lrc";

		const lrcFile = await readFile(lrcLocation, "utf-8");

		const parsedLrc = parseLrc(lrcFile).lines;
		if (parsedLrc.length) {
			reply.synchronized = true;
			reply.lines = parsedLrc;
		} else
			reply.lines = lrcFile.split("\n").map(x => ({ text: x }));

		return reply;
	}catch(_e){
		console.error("Could not get lyrics from Local: LRC file is not present nor readable.");
	}

	return undefined;
}
