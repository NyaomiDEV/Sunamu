import songdata, { fallback } from "./songdata.js";
import { updateNowPlaying } from "./nowplaying.js";

window.np.registerUpdateCallback((update) => {
	Object.assign(songdata, fallback, update);
	updateNowPlaying();
});

document.addEventListener("DOMContentLoaded", () => {
	let idleMouseTimer,
		// eslint-disable-next-line no-unused-vars
		forceMouseHide = false;

	//document.body.style.cursor = "none";

	document.body.onmousemove = () => {
		document.body.style.cursor = "inherit";
		document.getElementsByClassName("settings-div")[0].classList.remove("hidden");
		document.getElementById("playpause-button").classList.remove("hidden");
		document.getElementById("previous-button").classList.remove("hidden");
		document.getElementById("next-button").classList.remove("hidden");
		clearTimeout(idleMouseTimer);

		idleMouseTimer = setTimeout(() => {
			document.body.style.cursor = "none";
			document.getElementsByClassName("settings-div")[0].classList.add("hidden");
			document.getElementById("playpause-button").classList.add("hidden");
			document.getElementById("previous-button").classList.add("hidden");
			document.getElementById("next-button").classList.add("hidden");
			forceMouseHide = true;
			setTimeout(() => forceMouseHide = false, 500);
		}, 2000);
	};
});