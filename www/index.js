/* eslint-disable no-undef */
import "./lib/event.js";
import { pollPosition, updateNowPlaying } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";
import "./lib/seekbar.js";
import "./lib/buttons.js";

if (window.transparentBackground)
	document.getElementsByClassName("background")[0].style.display = "none";

updateNowPlaying();
setInterval(pollPosition, 200);

// Expose debug stuff
if(window.debugMode)
	window.getNowPlaying = () => songdata;
