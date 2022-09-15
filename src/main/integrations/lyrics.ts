import { debug } from "../";
import { get as getLyrics, save as saveLyrics } from "./lyricsOffline";

import { query as Musixmatch } from "../lyricproviders/musixmatch";
import { query as NetEase } from "../lyricproviders/netease";
import { query as Genius } from "../lyricproviders/genius";
import { query as Metadata } from "../lyricproviders/metadata";
import type { Lyrics, Metadata as MetadataType } from "../../types";
import { getAll as getConfig } from "../config";

const providerList = {
	Musixmatch,
	NetEase,
	Genius,
	Metadata
};

export async function queryLyrics(metadata: MetadataType, spotifyId?: string): Promise<Lyrics | undefined> {
	if (!metadata.artist || !metadata.title) // there can't be lyrics without at least those two fields
		return { unavailable: true };
	
	let lyrics: Lyrics | undefined;
	const id = computeLyricsID(metadata);

	const cached = await getLyrics(id);

	// This should only be executed inside the electron (main) process
	if (!cached || !cached.lines!.length || !cached?.synchronized) {
		if (!cached) debug(`Cache miss for ${metadata.artist} - ${metadata.title}`);
		else if (!cached?.synchronized) debug(`Cache hit but unsynced lyrics. Trying to fetch synchronized lyrics for ${metadata.artist} - ${metadata.title}`);

		const configProviders = getConfig().lyricsProviders;

		for (const provider in configProviders) {
			// if it's disabled just skip it
			if(!configProviders[provider])
				continue;

			// if cached then we could assume it is unsync
			if(!cached && ["Genius", "Metadata"].includes(provider))
				continue;

			debug("Fetching from " + provider);
			const _lyrics = await providerList[provider](metadata, spotifyId);
			if (_lyrics?.lines.length){
				lyrics = _lyrics;
				break;
			}
		}

		if (lyrics){
			saveLyrics(id, lyrics);
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
