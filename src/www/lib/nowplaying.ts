import lang from "./lang.js";
import { putLyricsInPlace, updateActiveLyrics } from "./lyrics.js";
import songdata from "./songdata.js";
import { secondsToTime, isElectron } from "./util.js";
import { updateSeekbarStatus, updateSeekbarTime } from "./seekbar.js";
import { Position, SongData } from "../../types.js";
import { getAppIcon } from "./appicon.js";
import config from "./config.js";

const documentRoot = document.querySelector(":root") as HTMLElement;

const featRegex = / \[?\{?\(?(?:feat\.?|ft\.?|featuring) .+\)?\]?\]?/i;
let artDataBlobUrl: string | undefined;

let positionUpdateInterval;

export function updateNowPlaying() {
	// CHECK ID
	if(songdata.metadata.id)
		document.documentElement.classList.remove("not-playing");
	else
		document.documentElement.classList.add("not-playing");

	// WINDOW TITLE
	if (!document.documentElement.classList.contains("widget-mode")){
		if (songdata.metadata.id)
			document.title = lang.NOW_PLAYING_TITLE.replace("%TITLE%", songdata.metadata.title || lang.UNKNOWN_TITLE).replace("%ARTIST%", songdata.metadata.artist || lang.UNKNOWN_ARTIST) + " - " + window.title;
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

	// SCROBBLES
	const scrobbles = document.getElementById("scrobbles")!;
	if (songdata.lastfm?.userplaycount) {
		scrobbles.textContent = lang.SCROBBLE_COUNT.replace("%COUNT%", songdata.lastfm?.userplaycount);
		scrobbles.style.display = "";
	} else if (songdata.metadata.count) {
		scrobbles.textContent = lang.SCROBBLE_COUNT.replace("%COUNT%", songdata.metadata.count.toString());
		scrobbles.style.display = "";
	} else {
		scrobbles.textContent = "";
		scrobbles.style.display = "none";
	}

	// PLAYING INDICATOR
	if (songdata.app){
		const appicon = getAppIcon();
		documentRoot.style.setProperty("--app-icon", `url("${appicon.split("\"").join("\\\"")}")`);
	} else
		documentRoot.style.removeProperty("--app-icon");

	document.getElementById("player-playing")!.textContent = songdata.appName ? lang.PLAYING_ON_APP : "";
	document.getElementById("player-name")!.textContent = songdata.appName || "";

	// CONTROLS VISIBILITY
	const playPauseBtn = document.getElementById("playpause")!;
	const shuffleBtn = document.getElementById("shuffle")!;
	const repeatBtn = document.getElementById("repeat")!;

	setDisabledClass(playPauseBtn, songdata.capabilities.canPlayPause);
	setDisabledClass(document.getElementById("next"), songdata.capabilities.canGoNext);
	setDisabledClass(document.getElementById("previous"), songdata.capabilities.canGoPrevious);

	setDisabledClass(shuffleBtn, songdata.capabilities.canControl);
	setDisabledClass(repeatBtn, songdata.capabilities.canControl);

	setDisabledClass(document.getElementById("lastfm"), songdata.lastfm);
	setDisabledClass(document.getElementById("spotify"), songdata.spotify);

	// CONTROLS STATUS
	(playPauseBtn.firstElementChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#" + (songdata.status === "Playing" ? "pause" : "play_arrow"));

	if (songdata.shuffle) shuffleBtn.classList.add("active");
	else shuffleBtn.classList.remove("active");

	switch (songdata.loop) {
		default:
			repeatBtn.classList.remove("active");
			(repeatBtn.firstElementChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat");
			break;
		case "Track":
			repeatBtn.classList.add("active");
			(repeatBtn.firstElementChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat_one");
			break;
		case "Playlist":
			repeatBtn.classList.add("active");
			(repeatBtn.firstElementChild! as HTMLElement).setAttribute("href", "assets/images/glyph.svg#repeat");
			break;
	}

	// SEEKBAR
	updateSeekbarStatus();

	// ALBUM ART
	updateAlbumArt();

	// AND COLORS TOO
	updateColors();
}

async function updateAlbumArt(){
	if (songdata.metadata.artUrl && isElectron())
		documentRoot.style.setProperty("--cover-art-url", `url("${songdata.metadata.artUrl.split("\"").join("\\\"")}")`);
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
				documentRoot.style.setProperty("--cover-art-url", `url("${artDataBlobUrl}")`);
				return;
			}

			(window.URL || window.webkitURL).revokeObjectURL(artDataBlobUrl);
			artDataBlobUrl = undefined;
		}

		const newBlob = new Blob([newArt]);
		artDataBlobUrl = (window.URL || window.webkitURL).createObjectURL(newBlob);
		documentRoot.style.setProperty("--cover-art-url", `url("${artDataBlobUrl}")`);

	} else
		documentRoot.style.removeProperty("--cover-art-url");
}

function updateColors(){
	const palette = songdata.metadata.artData?.palette;
	if(palette){
		document.documentElement.classList.remove("no-palette");
		documentRoot.style.setProperty("--color-vibrant", palette.Vibrant || null);
		documentRoot.style.setProperty("--color-muted", palette.Muted || null);
		documentRoot.style.setProperty("--color-light-vibrant", palette.LightVibrant || null);
		documentRoot.style.setProperty("--color-light-muted", palette.LightMuted || null);
		documentRoot.style.setProperty("--color-dark-vibrant", palette.DarkVibrant || null);
		documentRoot.style.setProperty("--color-dark-muted", palette.DarkMuted || null);
	}else{
		document.documentElement.classList.add("no-palette");
		documentRoot.style.removeProperty("--color-vibrant");
		documentRoot.style.removeProperty("--color-muted");
		documentRoot.style.removeProperty("--color-light-vibrant");
		documentRoot.style.removeProperty("--color-light-muted");
		documentRoot.style.removeProperty("--color-dark-vibrant");
		documentRoot.style.removeProperty("--color-dark-muted");
	}

	(document.getElementById("theme-color")! as HTMLMetaElement).content = window.getComputedStyle(documentRoot).getPropertyValue("--color-bg").trim();
}

function updateTime(elapsed: number) {
	const timeElapsed = document.getElementById("time-elapsed")!;
	const timeTotal = document.getElementById("time-total")!;

	if(songdata.metadata.length)
		timeTotal.textContent = secondsToTime(songdata.metadata.length);
	else
		timeTotal.textContent = "00:00";

	if(elapsed)
		timeElapsed.textContent = secondsToTime(elapsed);
	else
		timeElapsed.textContent = "00:00";
}

function positionUpdate(){
	// we compute the estimated elapsed time
	const elapsed = songdata.status === "Playing"
		? songdata.elapsed.howMuch + Math.max(0, (new Date().getTime() - new Date(songdata.elapsed.when).getTime()) / 1000)
		: songdata.elapsed.howMuch;

	updateTime(elapsed);
	updateSeekbarTime(elapsed);
	updateActiveLyrics(elapsed);
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
	if (metadataChanged)
		putLyricsInPlace();

	updateNowPlaying();

	if(songdata.status === "Playing"){
		if(!positionUpdateInterval)
			positionUpdateInterval = setInterval(positionUpdate, config.positionUpdateInterval * 1000);
	}
	else{
		clearInterval(positionUpdateInterval);
		positionUpdateInterval = undefined;
	}

});

window.np.registerPositionCallback((position: Position, reportsPosition: boolean) => {
	songdata.elapsed = position;
	songdata.reportsPosition = reportsPosition;

	positionUpdate();
});
