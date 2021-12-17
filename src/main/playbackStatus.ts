import { DeepPartial, SongData, Update } from "../types";
import { get } from "./config";
import getPlayer from "./player";
import { searchSpotifySong } from "./thirdparty/spotify";
import { getTrackInfo } from "./thirdparty/lastfm";
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

export async function updateInfo() {
	const update = await (await getPlayer()).getUpdate();
	const metadataChanged = await updateSongData(update);
	await broadcastSongData(metadataChanged);

	if (metadataChanged) {
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		songdata.spotify = undefined;

		await pollLastFm();
		await pollSpotifyDetails();
		await pollLyrics();
	}
}

// ------ SONG DATA
export async function broadcastSongData(metadataChanged: boolean){
	debug(songdata);
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

async function updateSongData(update?: Update|null): Promise<boolean>{
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
	if ((songdata.status !== "Playing" && songdata.status !== "Paused") || !songdata.capabilities.canSeek)
		return;

	if (songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed = await (await getPlayer()).GetPosition();

	// calls
	await broadcastPosition();
}

async function pollLyrics() {
	if (songdata.provider)
		await queryLyrics();
	// This refreshes the lyrics screen
	await broadcastSongData(false);
	await broadcastLyrics();
}

async function pollLastFm() {
	if (songdata.provider) {
		await getTrackInfo(get("lfmUsername"));
		await broadcastSongData(false);
	}
}

async function pollSpotifyDetails() {
	if (songdata.provider) {
		let id: string | undefined;

		const spotiMatch = spotiId.exec(songdata.metadata.id);

		if (spotiMatch)
			id = spotiMatch[1];
		else {
			const result = await searchSpotifySong();
			console.log(result);
			
			if (result)
				id = result.id;
		}

		if (id) {
			songdata.spotify = {
				id,
				uri: "spotify:track:" + id,
				url: "https://open.spotify.com/track/" + id
			};
			await broadcastSongData(false);
		}
	}
}