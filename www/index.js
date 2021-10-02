import "./lib/event.js";
import { pollPosition, updateNowPlaying } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";
import "./lib/seekbar.js";
import "./lib/buttons.js";

if (window.widgetMode)
	document.documentElement.classList.add("widget-mode");

updateNowPlaying();
setInterval(pollPosition, 200);

// Expose debug stuff
if(window.debugMode)
	window.getNowPlaying = () => songdata;

if(!localStorage.mxmusertoken){
	const token = await window.np.mxmusertoken();
	if(token) localStorage.mxmusertoken = token;
}

window.np.requestUpdate();