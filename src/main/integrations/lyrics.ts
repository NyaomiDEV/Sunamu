import { debug } from "../";
import { get as getLyrics, save as saveLyrics } from "./lyricsOffline";

import { query as Musixmatch } from "../lyricproviders/musixmatch";
import { query as NetEase } from "../lyricproviders/netease";
import { query as Genius } from "../lyricproviders/genius";
import { Lyrics, Metadata } from "../../types";

export async function queryLyrics(metadata: Metadata, spotifyId?: string): Promise<Lyrics | undefined> {
	if (!metadata.artist || !metadata.title) // there can't be lyrics without at least those two fields
		return;
	
	let lyrics: Lyrics | undefined;
	const id = computeLyricsID(metadata);

	const cached = await getLyrics(id);

	// This should only be executed inside the electron (main/renderer) process
	if (!cached || !cached.lines.length || !cached?.synchronized) {
		if (!cached) debug(`Cache miss for ${metadata.artist} - ${metadata.title}`);
		else if (!cached?.synchronized) debug(`Cache hit but unsynced lyrics. Trying to fetch synchronized lyrics for ${metadata.artist} - ${metadata.title}`);

		const providers = {
			Musixmatch,
			NetEase
		};

		// if cached then we could assume it is unsync and genius can only provide unsync
		// @ts-ignore
		if (!cached) providers.Genius = Genius;

		for (const provider in providers) {
			debug("Fetching from " + provider);
			const _lyrics = await providers[provider](metadata, spotifyId);
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

	return lyrics;
}

function computeLyricsID(metadata: Metadata){
	return `${metadata.artist}:${metadata.album}:${metadata.title}`;
}
