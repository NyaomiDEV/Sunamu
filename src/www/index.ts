import type { NowPlayingAPI, SongData } from "../types";

import "./lib/npapi.js";
import "./lib/screen.js";

import { pollPosition } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";

import "./lib/buttons.js";
import "./lib/event.js";
import "./lib/seekbar.js";

declare global {
	// eslint-disable-next-line no-unused-vars
	interface Window {
		title: string,
		np: NowPlayingAPI;
		getNowPlaying?: () => SongData
	}
}

window.title = "Sunamu" + (document.documentElement.classList.contains("widget-mode") ? " Widget" : "");

// Expose debug stuff
if(await window.np.isDebugMode())
	window.getNowPlaying = () => songdata;

setInterval(pollPosition, 200);

window.np.requestUpdate();
