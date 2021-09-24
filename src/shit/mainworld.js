/* eslint-disable no-undef */

let elapsed = 0;
let length = 0;

// UTILS OMG
function secondsToTime(duration) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

// eslint-disable-next-line no-unused-vars
function fullscreen() {
	if (document.fullscreenElement != null){
		document.webkitExitFullscreen();
		document.getElementById("fullscreen-icon").textContent = "fullscreen";
	}else{
		document.documentElement.webkitRequestFullscreen();
		document.getElementById("fullscreen-icon").textContent = "close_fullscreen";
	}
}

// eslint-disable-next-line no-unused-vars
function theme() {
	if (localStorage.getItem("theme") === null || localStorage.getItem("theme") === "original") {
		localStorage.setItem("theme", "test");
		document.getElementById("playingcss-test").rel = "stylesheet";
	} else {
		localStorage.setItem("theme", "original");
		document.getElementById("playingcss-test").rel = "stylesheet alternate";
	}
}

function progressInterval() {
	elapsed++;
	document.getElementById("song-time").innerHTML = secondsToTime(elapsed) + " &middot; " + secondsToTime(length);
	const seekbarPercent = elapsed / length * 100;
	document.getElementById("seekbar-now").style.width = `${seekbarPercent}%`;
}

setInterval(progressInterval, 1000);

// EVENTS
window.np.on("update", (update) => {
	document.getElementById("playing-img").src = update.metadata.artUrl;
	document.getElementById("background-image-div").style.backgroundImage = `url(${update.metadata.artUrl})`;
	document.getElementById("song-title").textContent = update.metadata.title;
	document.getElementById("song-artist").textContent = update.metadata.artist;
	document.getElementById("song-album").textContent = update.metadata.album;
	document.getElementById("app-name").textContent = `Playing on ${update.appName}`;
	document.getElementById("playpause-button").textContent = update.status === "Playing" ? "pause" : "play_arrow";
	elapsed = update.elapsed;
	length = update.metadata.length;
});

document.addEventListener("DOMContentLoaded", () => {
	let idleMouseTimer,
		// eslint-disable-next-line no-unused-vars
		forceMouseHide = false;
	
	//document.body.style.cursor = "none";

	document.body.onmousemove = () => {
		document.body.style.cursor = "inherit";
		//document.getElementsByClassName("settings-div")[0].classList.remove("hidden");
		document.getElementById("playpause-button").classList.remove("hidden");
		document.getElementById("previous-button").classList.remove("hidden");
		document.getElementById("next-button").classList.remove("hidden");
		clearTimeout(idleMouseTimer);

		idleMouseTimer = setTimeout(() => {
			//document.body.style.cursor = "none";
			//document.getElementsByClassName("settings-div")[0].classList.add("hidden");
			document.getElementById("playpause-button").classList.add("hidden");
			document.getElementById("previous-button").classList.add("hidden");
			document.getElementById("next-button").classList.add("hidden");
			letforceMouseHide = true;
			setTimeout(() => forceMouseHide = false, 500);
		}, 2000);
	};
});

if(localStorage.getItem("theme") === "test")
	document.getElementById("playingcss-test").rel = "stylesheet";