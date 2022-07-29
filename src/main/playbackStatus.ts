import { DeepPartial, Metadata, Position, SongData, SpotifyInfo, Update } from "../types";
import { get } from "./config";
import getPlayer from "./player";
import { getSpotifySongFromId, searchSpotifySong } from "./thirdparty/spotify";
import { getLFMTrackInfo } from "./thirdparty/lastfm";
import { spotiId } from "./util";
import { queryLyrics } from "./integrations/lyrics";
import { debug } from ".";

// eslint-disable-next-line no-unused-vars
const songdataCallbacks: Array<(songdata?: SongData, metadataChanged?: boolean) => Promise<void>> = [];
const lyricsCallbacks: Array<() => Promise<void>> = [];
// eslint-disable-next-line no-unused-vars
const positionCallbacks: Array<(position: Position, reportsPosition: boolean) => Promise<void>> = [];

setInterval(pollPosition, get("positionPollInterval") * 1000);

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
	elapsed: {
		howMuch: 0,
		when: new Date(0)
	},
	reportsPosition: false,
	app: undefined,
	appName: undefined,
	lyrics: { unavailable: true },
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
		songdata.lyrics = update?.metadata.id
			? undefined
			: { unavailable: true };

		songdata.lastfm = undefined;
		songdata.spotify = undefined;

		// broadcast our initial update so people won't think sunamu is laggy asf
		await broadcastSongData(true);
		// this also updates the lyrics to whatever screen is suitable

		// if we do have an update containing an ID in it, then we assume a track is playing
		// and therefore we can get extra information about it
		if (!update?.metadata.id) return;

		// we pre-emptively check our symbol to avoid consuming API calls for nothing
		// because there's already newer stuff than us
		if(currentSymbol !== updateInfoSymbol) return;
	
		// BEGIN OF "HUGE SUSPENSION POINT"
		const extraMetadata: Partial<SongData> = {};
		extraMetadata.spotify = await pollSpotifyDetails(update.metadata);
		extraMetadata.lastfm = await getLFMTrackInfo(update.metadata, get("lfmUsername"));
		extraMetadata.lyrics = await queryLyrics(update.metadata, extraMetadata.spotify?.id);
		// END OF "HUGE SUSPENSION POINT"

		// we now have to check our symbol to avoid updating stuff that is newer than us
		// also, is there a way to de-dupe this?
		if(currentSymbol !== updateInfoSymbol) return;

		// now we assign the extra metadata on songdata
		Object.assign(songdata, extraMetadata);

	}

	// adjust reportsPosition prop from update
	songdata.reportsPosition = songdata.elapsed.howMuch > 0;

	// we broadcast the changed status
	await broadcastSongData(false); // false means metadata didn't change (we already notified that inside the if block)

	// we need to broadcast an update for lyrics (unconditional) too
	if (metadataChanged)
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
	if (!metadata.id) return undefined;

	const spotiMatch = spotiId.exec(metadata.id);

	if (spotiMatch){
		return await getSpotifySongFromId(spotiMatch[0]) || {
			id: spotiMatch[0],
			uri: "spotify:track:" + spotiMatch[0],
			external_urls: { spotify: "https://open.spotify.com/track/" + spotiMatch[0] },
		};
	}

	return await searchSpotifySong() || undefined;
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
export function addPositionCallback(cb: (position: Position, reportsPosition: boolean) => Promise<void>) {
	positionCallbacks.push(cb);
}

// eslint-disable-next-line no-unused-vars
export function deletePositionCallback(cb: (position: Position, reportsPosition: boolean) => Promise<void>) {
	positionCallbacks.splice(positionCallbacks.indexOf(cb), 1);
}

export async function pollPosition() {
	if (songdata.status === "Playing"){
		songdata.elapsed = await (await getPlayer()).GetPosition();
		songdata.reportsPosition = songdata.elapsed.howMuch > 0;
	}

	// calls
	await broadcastPosition();
}
