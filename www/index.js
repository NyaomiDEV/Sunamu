/* eslint-disable no-undef */
import "./lib/event.js";
import { updateNowPlaying, updateSeekbar } from "./lib/nowplaying.js";
import songdata from "./lib/songdata.js";
import { fullscreen, clickEvent } from "./lib/util.js";

updateNowPlaying();
setInterval(updateSeekbar, 1000);

window.fullscreen = fullscreen;

window.getNowPlaying = () => songdata;

document.getElementsByClassName("seekbar-bg")[0].onclick = clickEvent;

if(window.transparentBackground)
	document.getElementsByClassName("background")[0].style.display = "none";
