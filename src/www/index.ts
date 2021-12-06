import type { NowPlayingAPI, SongData } from "../types";

import "./lib/npapi.js";

import { pollPosition, updateNowPlaying } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";

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
		getNowPlaying?: () => SongData
	}
}

window.title = "Sunamu" + (document.documentElement.classList.contains("widget-mode") ? " Widget" : "");

// Expose debug stuff
if(await window.np.isDebugMode())
	window.getNowPlaying = () => songdata;

if(!localStorage.mxmusertoken){
	const token = await window.np.mxmusertoken();
	if(token) localStorage.mxmusertoken = token;
}

updateNowPlaying();
setInterval(pollPosition, 200);
window.np.requestUpdate();

