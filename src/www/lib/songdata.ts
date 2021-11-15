import type { DeepPartial, SongData } from "../../types";

import lang from "./lang.js";

export const fallback: DeepPartial<SongData> = {
	provider: undefined,
	metadata: {
		title: lang.NOT_PLAYING,
		artist: lang.PLEASE_PLAY_SONG,
		artists: undefined,
		albumArtist: undefined,
		albumArtists: undefined,
		album: undefined,
		artUrl: undefined,
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

export default Object.assign({}, fallback) as SongData;