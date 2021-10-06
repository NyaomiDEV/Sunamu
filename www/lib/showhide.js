import { toggleLyricsView } from "./util.js";
import songdata from "./songdata.js";

let idleMouseTimer;
let isBouncy = false;

export function hide() {
	idleMouseTimer = setTimeout(() => {
		document.body.style.cursor = "none";
		document.getElementsByClassName("window-controls")[0].classList.add("hidden");
		document.getElementsByClassName("playback-controls")[0].classList.add("hidden");
		if (songdata.lyrics?.synchronized) toggleLyricsView(true);
		isBouncy = false;
	}, 2000);
}

export function show(force) {
	clearTimeout(idleMouseTimer);
	hide();

	if (isBouncy) return;

	document.body.style.cursor = "";
	document.getElementsByClassName("window-controls")[0].classList.remove("hidden");
	document.getElementsByClassName("playback-controls")[0].classList.remove("hidden");
	if (force || songdata.lyrics?.synchronized) toggleLyricsView(false);
	isBouncy = true;
}
