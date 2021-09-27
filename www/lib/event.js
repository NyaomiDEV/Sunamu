// ON LOAD
document.addEventListener("DOMContentLoaded", () => {
	let idleMouseTimer,
		// eslint-disable-next-line no-unused-vars
		forceMouseHide = false;

	document.body.onmousemove = () => {
		document.body.style.cursor = "";
		document.getElementsByClassName("window-controls")[0].classList.remove("hidden");
		document.getElementsByClassName("playback-controls")[0].classList.remove("hidden");
		clearTimeout(idleMouseTimer);

		idleMouseTimer = setTimeout(() => {
			document.body.style.cursor = "none";
			document.getElementsByClassName("window-controls")[0].classList.add("hidden");
			document.getElementsByClassName("playback-controls")[0].classList.add("hidden");
			forceMouseHide = true;
			setTimeout(() => forceMouseHide = false, 500);
		}, 2000);
	};
});

// ON FULLSCREEN CHANGE
document.addEventListener("webkitfullscreenchange", () => {
	if (document.fullscreenElement != null)
		document.getElementsByClassName("fullscreen")[0].textContent = "close_fullscreen";
	else
		document.getElementsByClassName("fullscreen")[0].textContent = "fullscreen";
});