import { songdata } from "../playbackStatus";
import { debug } from "../";
import { get as getLyrics, save as saveLyrics } from "./lyricsOffline";

import { query as Musixmatch } from "../lyricproviders/musixmatch";
import { query as NetEase } from "../lyricproviders/netease";
import { query as Genius } from "../lyricproviders/genius";
import { Lyrics } from "../../types";

let currentlyFetchingSongID: string | undefined;

export async function queryLyrics() {
	// copy the songdata variable since we run async and might have race conditions between us and the user
	const _songdata = Object.assign({}, songdata);

	let lyrics: Lyrics | undefined;
	const id = computeLyricsID(_songdata);

	if(id === currentlyFetchingSongID) return; // this is a bouncy call

	// set current id to mitigate bouncy calls
	currentlyFetchingSongID = id;

	const cached = await getLyrics(currentlyFetchingSongID);

	// This should only be executed inside the electron (main/renderer) process
	if (!cached || !cached.lines.length || !cached?.synchronized) {
		if (!cached) debug(`Cache miss for ${_songdata.metadata.artist} - ${_songdata.metadata.title}`);
		else if (!cached?.synchronized) debug(`Cache hit but unsynced lyrics. Trying to fetch synchronized lyrics for ${_songdata.metadata.artist} - ${_songdata.metadata.title}`);

		const providers = {
			Musixmatch,
			NetEase
		};

		// if cached then we could assume it is unsync and genius can only provide unsync
		// @ts-ignore
		if (!cached) providers.Genius = Genius;

		for (const provider in providers) {
			debug("Fetching from " + provider);
			const _lyrics = await providers[provider]();
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

	// update the lyrics if and only if the current playing song's ID matches
	if (lyrics && lyrics.lines.length && id === computeLyricsID(songdata))
		songdata.lyrics = lyrics;

	// unset current id
	currentlyFetchingSongID = undefined;
}

function computeLyricsID(__songdata){
	return `${__songdata.metadata.artist}:${__songdata.metadata.album}:${__songdata.metadata.title}`;
}
