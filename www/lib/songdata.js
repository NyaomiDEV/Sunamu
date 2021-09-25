import lang from "./lang.js";

export const fallback = {
	metadata: {
		title: lang.en.NOT_PLAYING,
		artist: lang.en.PLEASE_PLAY_SONG,
		album: undefined,
		artUrl: undefined,
		length: undefined
	},
	capabilities: {
		canControl: false,
		canPlayPause: false,
		canChangeTrack: false,
		hasSeekbar: false
	},
	status: "Stopped",
	elapsed: 0,
	app: undefined,
	appName: undefined
};

export default Object.assign({}, fallback);