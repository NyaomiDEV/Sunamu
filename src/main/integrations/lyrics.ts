import { debug } from "../";
import { get as getLyrics, save as saveLyrics } from "./lyricsOffline";

import * as Musixmatch from "../lyricproviders/musixmatch";
import * as NetEase from "../lyricproviders/netease";
import * as Genius from "../lyricproviders/genius";
import * as Metadata from "../lyricproviders/metadata";
import * as Local from "../lyricproviders/local";
import type { Lyrics, Metadata as MetadataType } from "../../types";
import { getAll as getConfig } from "../config";

const providerList: any[] = [
	Musixmatch,
	NetEase,
	Genius,
	Metadata,
	Local
];

for(let i = 0; i < providerList.length; i++){
	if(!providerList[i].supportedPlatforms.includes(process.platform))
		providerList.splice(i, 1);
}

export async function getAllLyrics(metadata: MetadataType): Promise<Lyrics[]> {
	if (!metadata.artist || !metadata.title) // there can't be lyrics without at least those two fields
		return [];

	const configProviders = getConfig().lyricsProviders;
	const providerPromises = Object.keys(configProviders).map(x => configProviders[x] ? providerList.find(y => y.name === x)?.query(metadata) : undefined).filter(Boolean);

	return (await Promise.all(providerPromises)).filter(x => x?.lines.length);
}

export async function saveCustomLyrics(metadata: MetadataType, lyrics: Lyrics){
	const id = computeLyricsID(metadata);
	await saveLyrics(id, lyrics);
	debug("Saved custom lyrics from " + lyrics.provider);
}

export async function queryLyricsAutomatically(metadata: MetadataType): Promise<Lyrics | undefined> {
	let lyrics: Lyrics | undefined;
	const id = computeLyricsID(metadata);

	const cached = await getLyrics(id);

	// This should only be executed inside the electron (main) process
	if (!cached || !cached.lines!.length || !cached?.synchronized) {
		if (!cached) debug(`Cache miss for ${metadata.artist} - ${metadata.title}`);
		else if (!cached?.synchronized) debug(`Cache hit but unsynced lyrics. Trying to fetch synchronized lyrics for ${metadata.artist} - ${metadata.title}`);

		lyrics = (await getAllLyrics(metadata)).find(x => !cached?.synchronized ? x.synchronized : true);

		if (lyrics){
			await saveLyrics(id, lyrics);
			debug("Fetched from " + lyrics.provider);
		}else
			debug("Unable to fetch lyrics");
	}

	if(cached && !lyrics)
		lyrics = cached;

	return lyrics || { unavailable: true };
}

function computeLyricsID(metadata: MetadataType){
	return `${metadata.artist}:${metadata.album}:${metadata.title}`;
}
