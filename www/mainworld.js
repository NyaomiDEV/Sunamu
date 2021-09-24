/* eslint-disable no-undef */

// STATUS CONTAINER
let songdata = {
	metadata: {
		title: undefined,
		artist: undefined,
		album: undefined,
		artUrl: undefined,
		length: 0
	},
	status: "Stopped",
	elapsed: 0,
	app: undefined,
	appName: undefined
};

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
	if(songdata.status !== "Playing") return;
	songdata.elapsed++;
	document.getElementById("song-time").innerHTML = secondsToTime(songdata.elapsed) + " &middot; " + secondsToTime(songdata.metadata.length);
	const seekbarPercent = songdata.elapsed / songdata.metadata.length * 100;
	document.getElementById("seekbar-now").style.width = `${seekbarPercent}%`;
}

function updateNowPlaying() {
	document.getElementById("playing-img").src = songdata.metadata.artUrl || "assets/images/no_song.png";
	document.getElementById("background-image-div").style.backgroundImage = `url(${songdata.metadata.artUrl || "assets/images/no_song.png"})`;
	document.getElementById("song-title").textContent = songdata.metadata.title || "Not playing";
	document.getElementById("song-artist").textContent = songdata.metadata.artist || "Please play a song";
	document.getElementById("song-album").textContent = songdata.metadata.album || "";
	document.getElementById("app-name").textContent = songdata.appName ? `Playing on ${songdata.appName}` : "No app is opened";
	document.getElementById("playpause-button").textContent = songdata.status === "Playing" ? "pause" : "play_arrow";
}

setInterval(progressInterval, 1000);

// EVENTS
window.np.registerUpdateCallback((update) => {
	songdata = Object.assign({}, update);
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
			letforceMouseHide = true;
			setTimeout(() => forceMouseHide = false, 500);
		}, 2000);
	};
});

// THEME REMEMBERING
if(localStorage.getItem("theme") === "test")
	document.getElementById("playingcss-test").rel = "stylesheet";