import { fullscreen, isElectron } from "./util.js";
import { toggleLyricsView } from "./lyrics.js";
import songdata from "./songdata.js";

function bindWindowControls(){
	if(isElectron()){
		(document.getElementsByClassName("minimize")[0] as HTMLElement).onclick = () => window.np.minimize!();
		(document.getElementsByClassName("close")[0] as HTMLElement).onclick = () => window.np.close!();
	}
	(document.getElementsByClassName("fullscreen")[0] as HTMLElement).onclick = () => fullscreen();
}

function bindPlaybackControls(){
	document.getElementById("shuffle")!.onclick = () => window.np.shuffle();
	document.getElementById("previous")!.onclick = () => window.np.previous();
	document.getElementById("playpause")!.onclick = () => window.np.playPause();
	document.getElementById("next")!.onclick = () => window.np.next();
	document.getElementById("repeat")!.onclick = () => window.np.repeat();
	document.getElementById("lyrics-btn")!.onclick = () => toggleLyricsView();

	const lastfm = document.getElementById("lastfm")!;
	lastfm.oncontextmenu = (e) => {
		e.preventDefault();
		navigator.clipboard.writeText(songdata.lastfm?.url || "");
	};
	lastfm.onclick = () => window.np.openExternal!(songdata.lastfm?.url || "");

	const spotify = document.getElementById("spotify")!;
	spotify.oncontextmenu = (e) => {
		e.preventDefault();
		navigator.clipboard.writeText(songdata.spotify?.url || "");
	};
	spotify.onclick = () => window.np.openExternal!(songdata.spotify?.url || "");
}

bindWindowControls();
bindPlaybackControls();