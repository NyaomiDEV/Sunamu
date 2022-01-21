import lang from "./lang.js";
import { putLyricsInPlace, updateActiveLyrics } from "./lyrics.js";
import songdata from "./songdata.js";
import { secondsToTime, isElectron } from "./util.js";
import { updateSeekbarStatus, updateSeekbarTime } from "./seekbar.js";
import { show } from "./showhide.js";
import { SongData } from "../../types.js";

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

	// ARTIST, TITLE, ALBUM
	if(songdata.metadata.id){
		formatMetadata(document.getElementById("artist"), featRegex, "featuring", songdata.metadata.artist, lang.UNKNOWN_ARTIST);
		formatMetadata(document.getElementById("title"), featRegex, "featuring", songdata.metadata.title, lang.UNKNOWN_TITLE);
		formatMetadata(document.getElementById("album"), featRegex, "featuring", songdata.metadata.album, "");
	}else{
		document.getElementById("artist")!.textContent = lang.PLEASE_PLAY_SONG;
		document.getElementById("title")!.textContent = lang.NOT_PLAYING;
		document.getElementById("album")!.textContent = "";
	}

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
	if(!data)
		return elem.textContent = fallback;

	elem.textContent = "";
	const pieces = data.split(regex).filter(Boolean).map(x => ({ text: x, matches: !!x.match(regex) }));
	for(const piece of pieces){
		const span = document.createElement("span");
		if(piece.matches) span.classList.add(spanClass);
		span.textContent = piece.text;
		elem.appendChild(span);
	}
}

// --- REGISTER CALLBACKS
window.np.registerUpdateCallback((_songdata: SongData, metadataChanged: boolean) => {
	console.debug(_songdata, metadataChanged);
	for (const prop of Object.getOwnPropertyNames(songdata)) delete songdata[prop];
	Object.assign(songdata, _songdata);
	if(!document.documentElement.classList.contains("static") && metadataChanged){
		show(true);
		putLyricsInPlace();
	}

	updateNowPlaying();
});

window.np.registerPositionCallback((position: number, reportsPosition: boolean) => {
	songdata.elapsed = position;
	songdata.reportsPosition = reportsPosition;
	updateTime();
	updateSeekbarTime();
	updateActiveLyrics();
});
