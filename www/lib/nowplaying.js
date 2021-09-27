import lang from "./lang.js";
import songdata, { fallback } from "./songdata.js";
import { secondsToTime } from "./util.js";

export function updateNowPlaying() {
	// METADATA
	if (songdata.metadata.artUrl)
		document.querySelector(":root").style.setProperty("--cover-art-url", `url(${songdata.metadata.artUrl})`);
	else
		document.querySelector(":root").style.removeProperty("--cover-art-url");

	document.getElementById("title").textContent = songdata.metadata.title || lang.NOT_PLAYING;
	document.getElementById("artist").textContent = songdata.metadata.artist || lang.PLEASE_PLAY_SONG;
	document.getElementById("album").textContent = songdata.metadata.album || "";
	document.getElementById("app-name").textContent = songdata.appName ? lang.PLAYING_ON_APP.replace("%APP%", songdata.appName) : "";
	document.getElementById("time").textContent = songdata.metadata.length ? secondsToTime(songdata.metadata.length) : "";

	// CONTROLS VISIBILITY
	document.getElementsByClassName("playback-controls")[0].style.display = songdata.capabilities.canControl ? "" : "none";
	document.getElementById("playpause").style.display = songdata.capabilities.canPlayPause ? "" : "none";
	document.getElementById("next").style.display = songdata.capabilities.canChangeTrack ? "" : "none";
	document.getElementById("previous").style.display = songdata.capabilities.canChangeTrack ? "" : "none";

	// CONTROLS STATUS
	document.getElementById("playpause").textContent = songdata.status === "Playing" ? "pause" : "play_arrow";

	const shuffleBtn = document.getElementById("shuffle");
	if(songdata.shuffle) shuffleBtn.classList.add("active");
	else shuffleBtn.classList.remove("active");

	const repeatBtn = document.getElementById("repeat");
	switch(songdata.loop){
		default:
			repeatBtn.classList.remove("active");
			repeatBtn.textContent = "repeat";
			break;
		case "Track":
			repeatBtn.classList.add("active");
			repeatBtn.textContent = "repeat_one";
			break;
		case "Playlist":
			repeatBtn.classList.add("active");
			repeatBtn.textContent = "repeat";
			break;
	}

	// SEEKBAR
	document.getElementsByClassName("seekbar-bg")[0].style.display = songdata.capabilities.hasSeekbar ? "" : "none";
}

export function updateSeekbar() {
	if((songdata.status !== "Playing" && songdata.status !== "Paused") || !songdata.capabilities.hasSeekbar)
		return;

	if(songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed++;

	document.getElementById("time").innerHTML = secondsToTime(songdata.elapsed) + " &middot; " + secondsToTime(songdata.metadata.length);

	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	document.getElementById("seekbar").style.width = `${seekbarPercent}%`;
}

window.np.registerUpdateCallback((update) => {
	Object.assign(songdata, fallback, update);
	songdata.elapsed = Math.floor(songdata.elapsed);
	songdata.metadata.length = Math.floor(songdata.metadata.length);
	updateNowPlaying();
});