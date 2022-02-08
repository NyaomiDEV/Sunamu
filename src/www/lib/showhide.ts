import { toggleLyricsView } from "./lyrics.js";
import songdata from "./songdata.js";

let idleTimeout;

export function hide() {
	idleTimeout = setTimeout(() => {
		if (document.documentElement.classList.contains("static"))
			return;

		document.documentElement.classList.add("idle");
		if (songdata.lyrics?.synchronized) toggleLyricsView(true);
	}, 2000);
}

export function show(force) {
	clearTimeout(idleTimeout);
	document.documentElement.classList.remove("idle");
	if (force || songdata.lyrics?.synchronized) toggleLyricsView(false);
}
