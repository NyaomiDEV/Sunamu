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
const positionCallbacks: Array<(position: number, reportsPosition: boolean) => Promise<void>> = [];

const positionPollInterval = 0.5;
setInterval(pollPosition, positionPollInterval * 1000);

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
	reportsPosition: false,
	app: undefined,
	appName: undefined,
	lyrics: undefined,
	lastfm: undefined,
	spotify: undefined
};

export const songdata = Object.assign({}, fallback) as SongData;

let updateInfoSymbol: Symbol;

export async function updateInfo(update?: Update) {
	// create our unique symbol
	const currentSymbol = Symbol();

	// did the metadata change?
	const metadataChanged = hasMetadataChanged(songdata.metadata, update?.metadata);

	// incrementally update the current status
	Object.assign(songdata, update || fallback);

	if (metadataChanged) {
		// we set our symbol as the global one since we're tasked with extra stuff
		updateInfoSymbol = currentSymbol;

		// we need to reset our extra songdata stuff
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		songdata.spotify = undefined;

		// broadcast our initial update so people won't think sunamu is laggy asf
		await broadcastSongData(true);
		// this also updates the lyrics to "no lyrics to show" screen

		// we pre-emptively check our symbol to avoid consuming API calls for nothing
		// because there's already newer stuff than us
		if(currentSymbol !== updateInfoSymbol) return;

		// if we do have an update containing an ID in it, then we assume a track is playing
		// and therefore we can get extra information about it
		if (!update?.metadata.id) return;
	
		// BEGIN OF "HUGE SUSPENSION POINT"
		const extraMetadata: Partial<SongData> = {};
		extraMetadata.lastfm = await getLFMTrackInfo(update.metadata, get("lfmUsername"));
		extraMetadata.spotify = await pollSpotifyDetails(update.metadata);
		extraMetadata.lyrics = await queryLyrics(update.metadata, extraMetadata.spotify?.id);
		// END OF "HUGE SUSPENSION POINT"

		// we now have to check our symbol to avoid updating stuff that is newer than us
		// also, is there a way to de-dupe this?
		if(currentSymbol !== updateInfoSymbol) return;

		// now we assign the extra metadata on songdata
		Object.assign(songdata, extraMetadata);

	}

	// we broadcast the changed status
	await broadcastSongData(false); // false means metadata didn't change (we already notified that inside the if block)

	// if lyrics are there, we need to broadcast an update for them too
	if (songdata.lyrics)
		await broadcastLyrics();
}

function hasMetadataChanged(oldMetadata: Metadata, newMetadata?: Metadata): boolean {
	if (!newMetadata)
		return true;

	let metadataChanged = false;

	for (let key in oldMetadata) {
		// skip metadata that is not worth checking because the player might report them 'asynchronously'
		if (["artUrl", "artData", "length"].includes(key)) continue;

		if (
			!oldMetadata[key] && newMetadata[key] ||
			(typeof oldMetadata[key] === "string" && oldMetadata[key] !== newMetadata[key]) ||
			(Array.isArray(oldMetadata[key]) && oldMetadata[key]
				.filter(x => !newMetadata[key].includes(x))
				.concat(newMetadata[key].filter(x => !oldMetadata[key].includes(x))).length !== 0)
		) {
			metadataChanged = true;
			break;
		}
	}

	return metadataChanged;
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
	for (const cb of positionCallbacks) await cb(songdata.elapsed, songdata.reportsPosition);
}

// eslint-disable-next-line no-unused-vars
export function addPositionCallback(cb: (position: number, reportsPosition: boolean) => Promise<void>) {
	positionCallbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deletePositionCallback(cb: (position: number, reportsPosition: boolean) => Promise<void>) {
	positionCallbacks.splice(positionCallbacks.indexOf(cb), 1);
}

export async function pollPosition() {
	if (songdata.status === "Playing"){
		const lastPosition = songdata.elapsed;
		songdata.elapsed = await (await getPlayer()).GetPosition();
		if(songdata.elapsed - lastPosition !== 0)
			songdata.reportsPosition = true;
	}

	// calls
	await broadcastPosition();
}
