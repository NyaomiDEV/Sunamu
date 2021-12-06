import { DeepPartial, SongData, Update } from "../types";
import { get } from "./config";
import getPlayer from "./player";
import { searchSpotifySong } from "./thirdparty/spotify";
import { getTrackInfo } from "./thirdparty/lastfm";
import { spotiId } from "./util";
import { queryLyrics } from "./integrations/lyrics";
//import { debug } from ".";

// eslint-disable-next-line no-unused-vars
const callbacks: Array<(songdata?: SongData, metadataChanged?: boolean) => Promise<void>> = [];
const lcallbacks: Array<() => Promise<void>> = [];

const fallback: DeepPartial<SongData> = {
	provider: undefined,
	metadata: {
		title: undefined,
		artist: undefined,
		artists: undefined,
		albumArtist: undefined,
		albumArtists: undefined,
		album: undefined,
		artUrl: undefined,
		artData: undefined,
		length: undefined,
		id: undefined
	},
	capabilities: {
		canControl: false,
		canPlayPause: false,
		canGoNext: false,
		canGoPrevious: false,
		canSeek: false
	},
	status: "Stopped",
	loop: "None",
	shuffle: false,
	volume: 0,
	elapsed: 0,
	app: undefined,
	appName: undefined,
	lyrics: undefined,
	lastfm: undefined,
	spotiUrl: undefined
};

export const songdata = Object.assign({}, fallback) as SongData;

export async function updateInfo() {
	const update = await (await getPlayer()).getUpdate();
	const metadataChanged = updateSongData(update);
	broadcastSongData(metadataChanged);
}

export async function broadcastSongData(metadataChanged: boolean){
	//debug(songdata);
	for (const cb of callbacks) await cb(songdata, metadataChanged);
}

// eslint-disable-next-line no-unused-vars
export function addUpdateCallback(cb: (songdata?: SongData, metadataChanged?: boolean) => Promise<void>) {
	callbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deleteUpdateCallback(cb: (songdata?: SongData, metadataChanged?: boolean) => Promise<void>) {
	callbacks.splice(callbacks.indexOf(cb), 1);
}

export async function pushLyricsUpdate(){
	for (const cb of lcallbacks) await cb();
}

export function addLyricsUpdateCallback(cb: () => Promise<void>) {
	lcallbacks.push(cb);
}

export function deleteLyricsUpdateCallback(cb: () => Promise<void>) {
	lcallbacks.splice(lcallbacks.indexOf(cb), 1);
}

function updateSongData(update?: Update|null): boolean{
	// PRE CHECK IF SOMETHING HAS CHANGED ACTUALLY
	let metadataChanged = false;

	if (!update) {
		metadataChanged = true;
		Object.assign(songdata, fallback);
	} else {
		for (let key in songdata.metadata) {
			// skip metadata that is not worth checking because the player might report them 'asynchronously'
			if (["artUrl", "artData", "length"].includes(key)) continue;

			if (
				!songdata.metadata[key] ||
				(typeof songdata.metadata[key] === "string" && songdata.metadata[key] !== update.metadata[key]) ||
				(Array.isArray(songdata.metadata[key]) && songdata.metadata[key]
					.filter(x => !update.metadata[key].includes(x))
					.concat(update.metadata[key].filter(x => !songdata.metadata[key].includes(x))).length !== 0)
			) {
				metadataChanged = true;
				break;
			}
		}

		Object.assign(songdata, update);
	}

	if (metadataChanged) {
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		songdata.spotiUrl = undefined;

		pollLyrics();
		pollLastFm();
		pollSpotiUrl();
	}

	return metadataChanged;
}

async function pollLyrics() {
	if (songdata.provider)
		await queryLyrics();
	// This refreshes the lyrics screen
	broadcastSongData(false);
	pushLyricsUpdate();
}

async function pollLastFm() {
	if (songdata.provider) {
		await getTrackInfo(get("lfmUsername"));
		broadcastSongData(false);
	}
}

async function pollSpotiUrl() {
	if (songdata.provider) {
		let id;

		const spotiMatch = spotiId.exec(songdata.metadata.id);

		if (spotiMatch)
			id = spotiMatch[1];
		else {
			const result = await searchSpotifySong();
			if (result)
				id = result.id;
		}

		if (id) {
			songdata.spotiUrl = "https://open.spotify.com/track/" + id;
			broadcastSongData(false);
		}
	}
}