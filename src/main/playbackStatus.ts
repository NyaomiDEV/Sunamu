import { DeepPartial, Metadata, SongData, SpotifyInfo, Update } from "../types";
import { get } from "./config";
import getPlayer from "./player";
import { searchSpotifySong } from "./thirdparty/spotify";
import { getLFMTrackInfo } from "./thirdparty/lastfm";
import { spotiId } from "./util";
import { queryLyrics } from "./integrations/lyrics";
import { debug } from ".";

// eslint-disable-next-line no-unused-vars
const songdataCallbacks: Array<(songdata?: SongData, metadataChanged?: boolean) => Promise<void>> = [];
const lyricsCallbacks: Array<() => Promise<void>> = [];
// eslint-disable-next-line no-unused-vars
const positionCallbacks: Array<(position: number) => Promise<void>> = [];

setInterval(pollPosition, 500);

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
	spotify: undefined
};

export const songdata = Object.assign({}, fallback) as SongData;

export async function updateInfo(update?: Update) {
	debug(1, "UpdateInfo called");
	const metadataChanged = updateSongData(update);
	await broadcastSongData(metadataChanged);

	if (metadataChanged) {
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		songdata.spotify = undefined;

		if(songdata.metadata.id){
			songdata.lastfm = await getLFMTrackInfo(songdata.metadata, get("lfmUsername"));
			songdata.spotify = await pollSpotifyDetails(songdata.metadata);
			songdata.lyrics = await queryLyrics(songdata.metadata, songdata.spotify?.id);
			broadcastSongData(false);
			if(songdata.lyrics) broadcastLyrics();
		}

		debug(1, "UpdateInfo", songdata);
	}
}

// ------ SONG DATA
export async function broadcastSongData(metadataChanged: boolean){
	debug(1, "broadcastSongData called with", metadataChanged);
	//debug(songdata);
	for (const cb of songdataCallbacks) await cb(songdata, metadataChanged);
}

// eslint-disable-next-line no-unused-vars
export function addSongDataCallback(cb: (songdata?: SongData, metadataChanged?: boolean) => Promise<void>) {
	songdataCallbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deleteSongDataCallback(cb: (songdata?: SongData, metadataChanged?: boolean) => Promise<void>) {
	songdataCallbacks.splice(songdataCallbacks.indexOf(cb), 1);
}

// ------- LYRICS
export async function broadcastLyrics(){
	for (const cb of lyricsCallbacks) await cb();
}

export function addLyricsUpdateCallback(cb: () => Promise<void>) {
	lyricsCallbacks.push(cb);
}

export function deleteLyricsUpdateCallback(cb: () => Promise<void>) {
	lyricsCallbacks.splice(lyricsCallbacks.indexOf(cb), 1);
}

// ------- POSITION
export async function broadcastPosition() {
	for (const cb of positionCallbacks) await cb(songdata.elapsed);
}

// eslint-disable-next-line no-unused-vars
export function addPositionCallback(cb: (position: number) => Promise<void>) {
	positionCallbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deletePositionCallback(cb: (position: number) => Promise<void>) {
	positionCallbacks.splice(positionCallbacks.indexOf(cb), 1);
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
				!songdata.metadata[key] && update.metadata[key] ||
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

	return metadataChanged;
}

export async function pollPosition() {
	if (songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed = await (await getPlayer()).GetPosition();

	// calls
	await broadcastPosition();
}

async function pollSpotifyDetails(metadata: Metadata): Promise<SpotifyInfo | undefined> {
	if (metadata.id) {
		let id: string | undefined;

		const spotiMatch = spotiId.exec(metadata.id);

		if (spotiMatch)
			id = spotiMatch[1];
		else {
			const result = await searchSpotifySong();
			
			if (result)
				id = result.id;
		}

		if (id) {
			return {
				id,
				uri: "spotify:track:" + id,
				url: "https://open.spotify.com/track/" + id
			};
		}
	}

	return undefined;
}