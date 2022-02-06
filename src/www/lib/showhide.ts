import { toggleLyricsView } from "./lyrics.js";
import songdata from "./songdata.js";

let idleMouseTimer;
let isBouncy = false;

export function hide() {
	idleMouseTimer = setTimeout(() => {
		if (document.documentElement.classList.contains("static"))
			return;

		document.documentElement.classList.add("idle");

		if (songdata.lyrics?.synchronized) toggleLyricsView(true);
		isBouncy = false;
	}, 2000);
}

export function show(force) {
	clearTimeout(idleMouseTimer);

	if (!document.documentElement.classList.contains("static"))
		hide();
	
	if (isBouncy) return;

	document.documentElement.classList.remove("idle");
	
	if (force || songdata.lyrics?.synchronized) toggleLyricsView(false);
	isBouncy = true;
}
