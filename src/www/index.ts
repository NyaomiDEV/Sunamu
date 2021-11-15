import { pollPosition, updateNowPlaying } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";
import type { NowPlayingAPI, SongData } from "../types";

import "./lib/buttons.js";
import "./lib/event.js";
import "./lib/screen.js";
import "./lib/seekbar.js";

import "./lib/thirdparty/lastfm.js";
import "./lib/thirdparty/spotify.js";

declare global {
	// eslint-disable-next-line no-unused-vars
	interface Window {
		title: string,
		np: NowPlayingAPI;
		widgetMode: boolean;
		debugMode: boolean;
		getNowPlaying?: () => SongData
	}
}

window.title = "Sunamu" + (window.widgetMode ? " Widget" : "");

// Expose debug stuff
if(window.debugMode)
	window.getNowPlaying = () => songdata;

if(!localStorage.mxmusertoken){
	const token = await window.np.mxmusertoken();
	if(token) localStorage.mxmusertoken = token;
}

updateNowPlaying();
setInterval(pollPosition, 200);
window.np.requestUpdate();

