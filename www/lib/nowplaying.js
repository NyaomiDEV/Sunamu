import lang from "./lang.js";
import config from "./config.js";
import { putLyricsInPlace, queryLyrics, updateActiveLyrics } from "./lyrics.js";
import songdata, { fallback } from "./songdata.js";
import { secondsToTime, spotiId } from "./util.js";
import { updateSeekbar } from "./seekbar.js";
import { getTrackInfo } from "./thirdparty/lastfm.js";
import { show } from "./showhide.js";
import { searchSpotifySong } from "./thirdparty/spotify.js";
import { updateDiscordPresence } from "./thirdparty/discord-rpc.js";

const featRegex = / \[?\{?\(?(?:feat\.?|ft\.?|featuring) .+\)?\]?\]?/i;

export function updateNowPlaying() {
	// WINDOW TITLE
	if (songdata.provider)
		document.title = lang.NOW_PLAYING_TITLE.replace("%TITLE%", songdata.metadata.title).replace("%ARTIST%", songdata.metadata.artist) + " - Sunamu";
	else
		document.title = "Sunamu";

	// COVER ART
	if (songdata.metadata.artUrl)
		document.querySelector(":root").style.setProperty("--cover-art-url", `url("${songdata.metadata.artUrl.split("\"").join("\\\"")}")`);
	else
		document.querySelector(":root").style.removeProperty("--cover-art-url");


	// ARTIST
	formatMetadata(document.getElementById("artist"), featRegex, "featuring", songdata.metadata.artist, lang.PLEASE_PLAY_SONG);

	// TITLE
	formatMetadata(document.getElementById("title"), featRegex, "featuring", songdata.metadata.title, lang.NOT_PLAYING);

	// ALBUM
	formatMetadata(document.getElementById("album"), featRegex, "featuring", songdata.metadata.album, "");

	// TIME
	document.getElementById("time").textContent = songdata.metadata.length ? secondsToTime(songdata.metadata.length) : "";

	// DETAILS
	document.getElementById("details").textContent = [
		songdata.appName ? lang.PLAYING_ON_APP.replace("%APP%", songdata.appName) : undefined,
		songdata.lastfm?.userplaycount ? lang.PLAY_COUNT.replace("%COUNT%", songdata.lastfm?.userplaycount) : undefined,
	].filter(Boolean).join(" • ");

	// CONTROLS VISIBILITY
	const playPauseBtn = document.getElementById("playpause");
	const shuffleBtn = document.getElementById("shuffle");
	const repeatBtn = document.getElementById("repeat");

	document.getElementsByClassName("first-row")[0].style.display = songdata.capabilities.canControl ? "" : "none";

	setDisabledClass(playPauseBtn, songdata.capabilities.canPlayPause);
	setDisabledClass(document.getElementById("next"), songdata.capabilities.canGoNext);
	setDisabledClass(document.getElementById("previous"), songdata.capabilities.canGoPrevious);

	setDisabledClass(shuffleBtn, songdata.capabilities.canControl);
	setDisabledClass(repeatBtn, songdata.capabilities.canControl);

	setDisabledClass(document.getElementById("lastfm"), songdata.lastfm);
	setDisabledClass(document.getElementById("spotify"), songdata.spotiUrl);

	// CONTROLS STATUS
	playPauseBtn.firstChild.setAttribute("href", "assets/images/glyph.svg#" + (songdata.status === "Playing" ? "pause" : "play_arrow"));

	if (songdata.shuffle) shuffleBtn.classList.add("active");
	else shuffleBtn.classList.remove("active");

	switch (songdata.loop) {
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

	// DISCORD PRESENCE
	updateDiscordPresence();
}

export async function pollPosition() {
	if ((songdata.status !== "Playing" && songdata.status !== "Paused") || !songdata.capabilities.canSeek)
		return;

	if (songdata.status === "Playing" && songdata.elapsed < songdata.metadata.length)
		songdata.elapsed = await window.np.getPosition();

	// calls
	updateTime();
	updateSeekbar();
	updateActiveLyrics();
}

function updateTime() {
	document.getElementById("time").textContent = secondsToTime(songdata.elapsed) + " • " + secondsToTime(songdata.metadata.length);
}

function setDisabledClass(elem, condition) {
	if (condition) elem.classList.remove("disabled");
	else elem.classList.add("disabled");
}

function formatMetadata(elem, regex, spanClass, data, fallback){
	let match = regex.exec(data);
	if (match) {
		const span = document.createElement("span");
		span.classList.add(spanClass);
		span.textContent = match[0];
		const [start, end] = data.split(match[0]);
		while(elem.firstChild) elem.removeChild(elem.lastChild);
		elem.appendChild(document.createTextNode(start));
		elem.appendChild(span);
		elem.appendChild(document.createTextNode(end || ""));
	} else
		elem.textContent = data || fallback;
}

async function pollLyrics() {
	if (songdata.provider)
		await queryLyrics();
	// This refreshes the lyrics screen
	putLyricsInPlace();
}

async function pollLastFm() {
	if (songdata.provider) {
		await getTrackInfo(config.lfmUsername);
		updateNowPlaying();
	}
}

async function pollSpotiUrl() {
	if (songdata.provider) {
		let id;

		const spotiMatch = spotiId.exec(songdata.metadata.id);

		if (spotiMatch)
			id = spotiMatch[1];
		else {
			const result = await searchSpotifySong();
			if (result)
				id = result.id;
		}

		if (id) {
			songdata.spotiUrl = "https://open.spotify.com/track/" + id;
			updateNowPlaying();
		}
	}
}

window.np.registerUpdateCallback(async (update) => {
	// PRE CHECK IF SOMETHING HAS CHANGED ACTUALLY
	let metadataChanged = false;

	if (!update) {
		metadataChanged = true;
		Object.assign(songdata, fallback);
	} else {

		if (songdata.metadata.id !== update.metadata.id) {
			for (let key in songdata.metadata) {
				// skip metadata that is not worth checking because the player might report them 'asynchronously'
				if (["artUrl", "length"].includes(key)) continue;

				if (
					(typeof songdata.metadata[key] === "string" && songdata.metadata[key] !== update.metadata[key]) ||
					(Array.isArray(songdata.metadata[key]) && songdata.metadata[key]
						.filter(x => !update.metadata[key].includes(x))
						.concat(update.metadata[key].filter(x => !songdata.metadata[key].includes(x))).length !== 0)
				) {
					metadataChanged = true;
					break;
				}
			}
		}

		Object.assign(songdata, update);
	}

	if (metadataChanged) {
		songdata.lyrics = undefined;
		songdata.lastfm = undefined;
		songdata.spotiUrl = undefined;

		show(true);
		pollLyrics();
		pollLastFm();
		pollSpotiUrl();
	}

	updateNowPlaying();
});