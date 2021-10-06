import { fullscreen, toggleLyricsView } from "./util.js";

function bindWindowControls(){
	document.getElementsByClassName("minimize")[0].onclick = () => window.np.minimize();
	document.getElementsByClassName("close")[0].onclick = () => window.np.close();
	document.getElementsByClassName("fullscreen")[0].onclick = () => fullscreen();
}

function bindPlaybackControls(){
	document.getElementById("shuffle").onclick = () => window.np.shuffle();
	document.getElementById("previous").onclick = () => window.np.previous();
	document.getElementById("playpause").onclick = () => window.np.playpause();
	document.getElementById("next").onclick = () => window.np.next();
	document.getElementById("repeat").onclick = () => window.np.repeat();
	document.getElementById("lyrics-btn").onclick = () => toggleLyricsView();
}

bindWindowControls();
bindPlaybackControls();