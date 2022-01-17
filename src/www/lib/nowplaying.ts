import lang from "./lang.js";
import { putLyricsInPlace, updateActiveLyrics } from "./lyrics.js";
import songdata from "./songdata.js";
import { secondsToTime, isElectron } from "./util.js";
import { updateSeekbarStatus, updateSeekbarTime } from "./seekbar.js";
import { show } from "./showhide.js";

const featRegex = / \[?\{?\(?(?:feat\.?|ft\.?|featuring) .+\)?\]?\]?/i;
let artDataBlobUrl: string | undefined;

export function updateNowPlaying() {
	// WINDOW TITLE
	if (!document.documentElement.classList.contains("widget-mode")){
		if (songdata.provider)
			document.title = lang.NOW_PLAYING_TITLE.replace("%TITLE%", songdata.metadata.title).replace("%ARTIST%", songdata.metadata.artist) + " - " + window.title;
		else
			document.title = window.title;
	}

	// ARTIST
	formatMetadata(document.getElementById("artist"), featRegex, "featuring", songdata.metadata.artist, lang.PLEASE_PLAY_SONG);

	// TITLE
	formatMetadata(document.getElementById("title"), featRegex, "featuring", songdata.metadata.title, lang.NOT_PLAYING);

	// ALBUM
	formatMetadata(document.getElementById("album"), featRegex, "featuring", songdata.metadata.album, "");

	// DETAILS
	document.getElementById("details")!.textContent = [
		songdata.appName ? lang.PLAYING_ON_APP.replace("%APP%", songdata.appName) : undefined,
		songdata.lastfm?.userplaycount ? lang.PLAY_COUNT.replace("%COUNT%", songdata.lastfm?.userplaycount) : undefined,
	].filter(Boolean).join(" • ");

	// CONTROLS VISIBILITY
	(document.getElementsByClassName("playback-controls")[0] as HTMLElement).style.display = songdata.metadata.id ? "" : "none";

	const playPauseBtn = document.getElementById("playpause")!;
	const shuffleBtn = document.getElementById("shuffle")!;
	const repeatBtn = document.getElementById("repeat")!;

	setDisabledClass(playPauseBtn, songdata.capabilities.canPlayPause);
	setDisabledClass(document.getElementById("next"), songdata.capabilities.canGoNext);
	setDisabledClass(document.getElementById("previous"), songdata.capabilities.canGoPrevious);

	setDisabledClass(shuffleBtn, songdata.capabilities.canControl);
	setDisabledClass(repeatBtn, songdata.capabilities.canControl);

	setDisabledClass(document.getElementById("lastfm"), songdata.lastfm);
	setDisabledClass(document.getElementById("spotify"), songdata.spotify?.url);

	// CONTROLS STATUS
	(playPauseBtn.firstChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#" + (songdata.status === "Playing" ? "pause" : "play_arrow"));

	if (songdata.shuffle) shuffleBtn.classList.add("active");
	else shuffleBtn.classList.remove("active");

	switch (songdata.loop) {
		default:
			repeatBtn.classList.remove("active");
			(repeatBtn.firstChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat");
			break;
		case "Track":
			repeatBtn.classList.add("active");
			(repeatBtn.firstChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat_one");
			break;
		case "Playlist":
			repeatBtn.classList.add("active");
			(repeatBtn.firstChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat");
			break;
	}

	// SEEKBAR
	updateSeekbarStatus();

	// TIME
	updateTime();

	// ALBUM ART
	updateAlbumArt();
}

async function updateAlbumArt(){
	if (songdata.metadata.artUrl && isElectron())
		(document.querySelector(":root") as HTMLElement).style.setProperty("--cover-art-url", `url("${songdata.metadata.artUrl.split("\"").join("\\\"")}")`);
	else if (songdata.metadata.artData?.data) {

		const newArt = new Uint8Array(songdata.metadata.artData?.data);

		if(artDataBlobUrl){
			const oldArt = await fetch(artDataBlobUrl).then(async r => new Uint8Array(await r.arrayBuffer())) as Uint8Array;

			let same = true;
			if(oldArt.byteLength === newArt.byteLength){
				for (let i = 0; i < newArt.byteLength; i++) {
					if(oldArt[i] !== newArt[i]){
						same = false;
						break;
					}
				}
			}else
				same = false;

			if (same){
				(document.querySelector(":root") as HTMLElement).style.setProperty("--cover-art-url", `url("${artDataBlobUrl}")`);
				return;
			}

			(window.URL || window.webkitURL).revokeObjectURL(artDataBlobUrl);
			artDataBlobUrl = undefined;
		}

		const newBlob = new Blob([newArt]);
		artDataBlobUrl = (window.URL || window.webkitURL).createObjectURL(newBlob);
		(document.querySelector(":root") as HTMLElement).style.setProperty("--cover-art-url", `url("${artDataBlobUrl}")`);

	} else
		(document.querySelector(":root") as HTMLElement).style.removeProperty("--cover-art-url");
}

function updateTime() {
	const time = document.getElementById("time")!;
	if(songdata.metadata.length){
		if(typeof songdata.elapsed !== "undefined" && songdata.elapsed > 0.5) // half a second rule to cut off spotify on linux lol
			time.textContent = secondsToTime(songdata.elapsed) + " • " + secondsToTime(songdata.metadata.length);
		else
			time.textContent = secondsToTime(songdata.metadata.length);
	}else
		time.textContent = "";
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

// --- REGISTER CALLBACKS
window.np.registerUpdateCallback((_songdata, metadataChanged) => {
	console.log(_songdata, metadataChanged);
	Object.assign(songdata, _songdata);
	if(!document.documentElement.classList.contains("static") && metadataChanged){
		show(true);
		putLyricsInPlace();
	}

	updateNowPlaying();
});

window.np.registerPositionCallback((position) => {
	songdata.elapsed = position;
	updateTime();
	updateSeekbarTime();
	updateActiveLyrics();
});
