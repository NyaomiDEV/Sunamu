import lang from "./lang.js";

/** @type { import("../../src/types").Update & {lyrics: Lyrics} } */
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

/** @type { import("../../src/types").Update & {lyrics: Lyrics} } */
export default Object.assign({}, fallback);