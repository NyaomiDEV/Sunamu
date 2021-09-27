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

export function clickEvent(e) {
	const rect = document.getElementsByClassName("seekbar-bg")[0].getBoundingClientRect();
	const x = e.clientX - rect.left;
	const percentage = x / rect.width;
	console.log(percentage);
	window.np.seek(percentage);
}

document.getElementsByClassName("seekbar-bg")[0].onclick = clickEvent;