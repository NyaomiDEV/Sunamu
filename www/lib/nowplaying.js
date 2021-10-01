import lang from "./lang.js";
import { putLyricsInPlace, queryLyrics, updateActiveLyrics } from "./lyrics.js";
import songdata, { fallback } from "./songdata.js";
import { secondsToTime } from "./util.js";
import { updateSeekbar } from "./seekbar.js";

export async function updateNowPlaying() {
	// TITLE
	if(songdata.provider)
		document.title = lang.NOW_PLAYING_TITLE.replace("%TITLE%", songdata.metadata.title).replace("%ARTIST%", songdata.metadata.artist) + " - Sunamu";
	else
		document.title = "Sunamu";

	// METADATA
	if (songdata.metadata.artUrl)
		document.querySelector(":root").style.setProperty("--cover-art-url", `url("${songdata.metadata.artUrl.split("\"").join("\\\"")}")`);
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
	document.getElementById("next").style.display = songdata.capabilities.canGoNext ? "" : "none";
	document.getElementById("previous").style.display = songdata.capabilities.canGoPrevious ? "" : "none";

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
	document.getElementsByClassName("seekbar-bg")[0].style.display = songdata.capabilities.canSeek ? "" : "none";
}

export async function pollPosition() {
	if ((songdata.status !== "Playing" && songdata.status !== "Paused") || !songdata.capabilities.canSeek)
		return;

	if (songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed = await window.np.getposition();

	// calls
	updateTime();
	updateSeekbar();
	updateActiveLyrics();
}

function updateTime() {
	document.getElementById("time").innerHTML = secondsToTime(songdata.elapsed) + " &middot; " + secondsToTime(songdata.metadata.length);
}

window.np.registerUpdateCallback(async (update) => {
	// PRE CHECK IF SOMETHING HAS CHANGED ACTUALLY
	let metadataChanged = false;
	if (!update || songdata.metadata.id !== update.metadata.id) metadataChanged = true;
	else {
		for(let key in songdata.metadata){
			// skip metadata that is not worth checking because the player might report them 'asynchronously'
			if(["artUrl", "length"].includes(key)) continue;

			if(songdata.metadata[key] !== update.metadata[key]){
				metadataChanged = true;
				break;
			}
		}
	}

	if(!update) Object.assign(songdata, fallback);
	else Object.assign(songdata, update);

	updateNowPlaying();

	if (metadataChanged){
		songdata.lyrics = undefined;
		if (songdata.provider)
			await queryLyrics();
	}

	// This refreshes the lyrics screen
	putLyricsInPlace();
});