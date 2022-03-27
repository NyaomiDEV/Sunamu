import { fullscreen, isElectron } from "./util.js";
import songdata from "./songdata.js";
import config from "./config.js";

function bindWindowControls(){
	if(isElectron()){
		document.getElementById("minimize")!.onclick = () => window.np.minimize!();
		document.getElementById("close")!.onclick = () => window.np.close!();
	}
	document.getElementById("fullscreen")!.onclick = () => fullscreen();
}

function bindPlaybackControls(){
	document.getElementById("shuffle")!.onclick = () => window.np.shuffle();
	document.getElementById("previous")!.onclick = () => window.np.previous();
	document.getElementById("playpause")!.onclick = () => window.np.playPause();
	document.getElementById("next")!.onclick = () => window.np.next();
	document.getElementById("repeat")!.onclick = () => window.np.repeat();

	const lastfm = document.getElementById("lastfm")!;
	lastfm.oncontextmenu = (e) => {
		e.preventDefault();
		navigator.clipboard.writeText(songdata.lastfm?.url || "");
	};
	lastfm.onclick = () => window.np.openExternal!(songdata.lastfm?.url || "");

	const spotify = document.getElementById("spotify")!;
	spotify.oncontextmenu = (e) => {
		e.preventDefault();
		navigator.clipboard.writeText(songdata.spotify?.external_urls.spotify || "");
	};
	spotify.onclick = () => window.np.openExternal!(songdata.spotify?.external_urls.spotify || "");
}

function hideButtons(){
	if(!config.spotify.clientSecret)
		document.getElementById("spotify")!.style.display = "none";
}

hideButtons();
bindWindowControls();
bindPlaybackControls();