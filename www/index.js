import { pollPosition, updateNowPlaying } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";

import "./lib/buttons.js";
import "./lib/event.js";
import "./lib/screen.js";
import "./lib/seekbar.js";

import "./lib/thirdparty/lastfm.js";
import "./lib/thirdparty/spotify.js";

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
