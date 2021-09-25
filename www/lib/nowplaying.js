import lang from "./lang.js";
import songdata from "./songdata.js";
import { secondsToTime } from "./util.js";

export function updateNowPlaying() {
	// METADATA
	document.getElementById("playing-img").src = songdata.metadata.artUrl || "assets/images/no_song.png";
	document.getElementById("background-image-div").style.backgroundImage = `url(${songdata.metadata.artUrl || "assets/images/no_song.png"})`;
	document.getElementById("song-title").textContent = songdata.metadata.title || lang.en.NOT_PLAYING;
	document.getElementById("song-artist").textContent = songdata.metadata.artist || lang.en.PLEASE_PLAY_SONG;
	document.getElementById("song-album").textContent = songdata.metadata.album || "";
	document.getElementById("app-name").textContent = songdata.appName ? `Playing on ${songdata.appName}` : "";
	document.getElementById("playpause-button").textContent = songdata.status === "Playing" ? "pause" : "play_arrow";
	document.getElementById("song-time").textContent = songdata.metadata.length ? secondsToTime(songdata.metadata.length) : "";

	// CONTROLS
	document.getElementById("playback-container").style.display = songdata.capabilities.canControl ? "" : "none";
	document.getElementById("playpause-button").style.display = songdata.capabilities.canPlayPause ? "" : "none";
	document.getElementById("next-button").style.display = songdata.capabilities.canChangeTrack ? "" : "none";
	document.getElementById("previous-button").style.display = songdata.capabilities.canChangeTrack ? "" : "none";

	// SEEKBAR
	document.getElementById("seekbar-bg").style.display = songdata.capabilities.hasSeekbar ? "" : "none";
}

export function updateSeekbar() {
	if((songdata.status !== "Playing" && songdata.status !== "Paused") || !songdata.capabilities.hasSeekbar)
		return;

	if(songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed++;

	document.getElementById("song-time").innerHTML = secondsToTime(songdata.elapsed) + " &middot; " + secondsToTime(songdata.metadata.length);

	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	document.getElementById("seekbar-now").style.width = `${seekbarPercent}%`;
}