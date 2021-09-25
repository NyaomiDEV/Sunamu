/* eslint-disable no-undef */
import "./lib/event.js";
import { updateNowPlaying, updateSeekbar } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";
import { theme, themeToggle, fullscreen } from "./lib/util.js";

theme();
updateNowPlaying();
setInterval(updateSeekbar, 1000);

window.themeToggle = themeToggle;
window.fullscreen = fullscreen;

window.getNowPlaying = () => songdata;

if(window.transparentBackground)
	document.getElementById("background-image-div").style.display = "none";
