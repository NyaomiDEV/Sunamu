import lang from "./lang.js";
import { putLyricsInPlace, queryLyrics, updateActiveLyrics } from "./lyrics.js";
import songdata, { fallback } from "./songdata.js";
import { secondsToTime } from "./util.js";
import { updateSeekbar } from "./seekbar.js";
import { getTrackInfo } from "./thirdparty/lastfm.js";
import { show } from "./showhide.js";

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
	document.getElementById("time").textContent = songdata.metadata.length ? secondsToTime(songdata.metadata.length) : "";

	document.getElementById("details").textContent = [
		songdata.appName ? lang.PLAYING_ON_APP.replace("%APP%", songdata.appName) : undefined,
		songdata.lastfm?.userplaycount ? lang.PLAY_COUNT.replace("%COUNT%", songdata.lastfm?.userplaycount) : undefined,
	].filter(Boolean).join(" • ");

	// CONTROLS VISIBILITY
	const playPauseBtn = document.getElementById("playpause");
	const shuffleBtn = document.getElementById("shuffle");
	const repeatBtn = document.getElementById("repeat");

	document.getElementsByClassName("first-row")[0].style.display = songdata.capabilities.canControl ? "" : "none";
	
	playPauseBtn.style.display = songdata.capabilities.canPlayPause ? "" : "none";
	document.getElementById("next").style.display = songdata.capabilities.canGoNext ? "" : "none";
	document.getElementById("previous").style.display = songdata.capabilities.canGoPrevious ? "" : "none";

	shuffleBtn.style.display = songdata.capabilities.canControl ? "" : "none";
	repeatBtn.style.display = songdata.capabilities.canControl ? "" : "none";

	// CONTROLS STATUS
	playPauseBtn.firstChild.setAttribute("href", "assets/images/glyph.svg#" + (songdata.status === "Playing" ? "pause" : "play_arrow"));

	if(songdata.shuffle) shuffleBtn.classList.add("active");
	else shuffleBtn.classList.remove("active");

	switch(songdata.loop){
		default:
			repeatBtn.classList.remove("active");
			repeatBtn.firstChild.setAttribute("href", "assets/images/glyph.svg#repeat");
			break;
		case "Track":
			repeatBtn.classList.add("active");
			repeatBtn.firstChild.setAttribute("href", "assets/images/glyph.svg#repeat_one");
			break;
		case "Playlist":
			repeatBtn.classList.add("active");
			repeatBtn.firstChild.setAttribute("href", "assets/images/glyph.svg#repeat");
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
	document.getElementById("time").textContent = secondsToTime(songdata.elapsed) + " • " + secondsToTime(songdata.metadata.length);
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
		show(true);
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		document.getElementById("lastfm").style.display = "none";
		if (songdata.provider){
			await queryLyrics();
			await getTrackInfo(localStorage.lfmUsername);

			if(songdata.lastfm){
				document.getElementById("lastfm").style.display = "";
				updateNowPlaying(); // again yes
			}
		}
	}

	// This refreshes the lyrics screen
	putLyricsInPlace();
});