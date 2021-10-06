import { toggleLyricsView } from "./util.js";
import songdata from "./songdata.js";

// ON LOAD
document.addEventListener("DOMContentLoaded", () => {
	let idleMouseTimer;
	let isBouncy = false;

	function hider() {
		idleMouseTimer = setTimeout(() => {
			document.body.style.cursor = "none";
			document.getElementsByClassName("window-controls")[0].classList.add("hidden");
			document.getElementsByClassName("playback-controls")[0].classList.add("hidden");
			if(songdata.lyrics?.synchronized) toggleLyricsView(true);
			isBouncy = false;
		}, 2000);
	}

	document.body.onmousemove = () => {
		clearTimeout(idleMouseTimer);
		hider();

		if(isBouncy) return;

		document.body.style.cursor = "";
		document.getElementsByClassName("window-controls")[0].classList.remove("hidden");
		document.getElementsByClassName("playback-controls")[0].classList.remove("hidden");
		if(songdata.lyrics?.synchronized) toggleLyricsView(false);
		isBouncy = true;
	};

	hider();
});

if (!window.widgetMode) {
	// ON FULLSCREEN CHANGE
	document.addEventListener("webkitfullscreenchange", () => {
		if (document.fullscreenElement != null)
			document.getElementsByClassName("fullscreen")[0].textContent = "close_fullscreen";
		else
			document.getElementsByClassName("fullscreen")[0].textContent = "fullscreen";
	});
}
