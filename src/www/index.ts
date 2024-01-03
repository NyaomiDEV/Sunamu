/* eslint-disable no-unused-vars */
import type { Lyrics, NowPlayingAPI, SongData } from "../types";

import "./lib/npapi/browser-npapi.js";
import "./lib/screen.js";

import { updateNowPlaying } from "./lib/nowplaying.js";
import { putLyricsInPlace } from "./lib/lyrics.js";
import songdata from "./lib/songdata.js";

import "./lib/buttons.js";
import "./lib/event.js";
import "./lib/seekbar.js";

declare global {
	interface Window {
		title: string
		np: NowPlayingAPI
		getNowPlaying?: () => SongData
		detectedLanguage?: string
		copyLyrics?: () => (string | undefined)
		copyLyricsTranslated?: () => (string | undefined)
		searchForCustomLyrics: (artist: string, title: string, album: string) => Promise<void>
		chooseLyrics: (input: number) => void
	}
}

window.title = "Sunamu" + (document.documentElement.classList.contains("widget-mode") ? " Widget" : "");

// Expose debug stuff
if(await window.np.isDebugMode()){
	window.getNowPlaying = () => songdata;
	window.detectedLanguage = navigator.language.split("-")[0];
	window.copyLyrics = () => songdata.lyrics?.lines?.map(x => x.text).join("\n") + `\n\n("${songdata.metadata.title}" - ${songdata.metadata.artist})`;
	window.copyLyricsTranslated = () => songdata.lyrics?.lines?.map(x => x.translation || x.text).join("\n") + `\n\n("${songdata.metadata.title}" - ${songdata.metadata.artist})`;
}

updateNowPlaying();
putLyricsInPlace();

const lrcStorage = {
	id: undefined as string|undefined,
	lyrics: [] as Lyrics[]
};

async function searchForCustomLyrics(title?: string, artist?: string, album?: string) {
	const metadata = Object.assign({}, songdata.metadata);
	if(title) metadata.title = title;
	if(artist) metadata.artist = artist;
	if(album) metadata.album = album;
	lrcStorage.id = metadata.id;
	(await window.np.searchAllLyrics(metadata)).forEach(x => lrcStorage.lyrics.push(x));
	if (!lrcStorage.lyrics.length) return console.error("No lyrics found");
	console.log(`Searching lyrics for (input) "${metadata.title}" by ${metadata.artist} in album "${metadata.album}"`);
	console.log(`Whatever you choose will replace lyrics for (actual metadata we got) "${songdata.metadata.title}" by ${songdata.metadata.artist} in album "${songdata.metadata.album}"`);
	console.log("Select your lyrics from here");
	lrcStorage.lyrics.forEach((x, k) => console.log(`From ${x.provider} - ${x.synchronized ? "Synchronized" : "Unsynchronized"} - Choice #${k+1}\nPreview:\n${x.lines?.slice(0, 10).map(x => x.text).join("\n")}`));
	console.log("So, what's your favourite? Type `chooseLyrics(N)` where N is your choice.");
	console.log("You have to be quick! You can only choose lyrics as the song is playing!");
}

function chooseLyrics(input: number){
	if(songdata.metadata.id !== lrcStorage.id){
		lrcStorage.id = undefined;
		lrcStorage.lyrics = [];
		return console.error("You took your time heh? The song is not playing anymore!");
	}
	if(!lrcStorage.lyrics[input - 1]) return console.error("Invalid choice!");
	window.np.chooseLyrics(lrcStorage.lyrics[input - 1]);
	console.log("Correctly modified!");
}

window.searchForCustomLyrics = searchForCustomLyrics;
window.chooseLyrics = chooseLyrics;