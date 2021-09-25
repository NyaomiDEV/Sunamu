export function secondsToTime(duration) {
	duration = Math.floor(duration);
	let seconds = duration % 60,
		minutes = Math.floor(duration / 60) % 60;

	return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

export function fullscreen() {
	if (document.fullscreenElement != null)
		document.webkitExitFullscreen();
	else
		document.documentElement.webkitRequestFullscreen();
}

export function themeToggle() {
	if (localStorage.getItem("theme") === null || localStorage.getItem("theme") === "original") {
		localStorage.setItem("theme", "test");
		document.getElementById("playingcss-test").rel = "stylesheet";
	} else {
		localStorage.setItem("theme", "original");
		document.getElementById("playingcss-test").rel = "stylesheet alternate";
	}
}

export function theme(){
	if (localStorage.getItem("theme") === "test")
		document.getElementById("playingcss-test").rel = "stylesheet";
}