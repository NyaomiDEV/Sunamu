import lang from "./lang.js";

/** @type {SongData} */
export const fallback = {
	provider: undefined,
	metadata: {
		title: lang.NOT_PLAYING,
		artist: lang.PLEASE_PLAY_SONG,
		album: undefined,
		artUrl: undefined,
		length: undefined
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
	lyrics: undefined
};

/** @type {SongData} */
export default Object.assign({}, fallback);