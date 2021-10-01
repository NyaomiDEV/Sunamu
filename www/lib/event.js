// ON LOAD
document.addEventListener("DOMContentLoaded", () => {
	let idleMouseTimer;

	function hider() {
		idleMouseTimer = setTimeout(() => {
			document.body.style.cursor = "none";
			document.getElementsByClassName("window-controls")[0].classList.add("hidden");
			document.getElementsByClassName("playback-controls")[0].classList.add("hidden");
		}, 2000);
	}

	document.body.onmousemove = () => {
		document.body.style.cursor = "";
		document.getElementsByClassName("window-controls")[0].classList.remove("hidden");
		document.getElementsByClassName("playback-controls")[0].classList.remove("hidden");
		clearTimeout(idleMouseTimer);
		hider();
	};

	hider();
});

if (!window.widgetMode) {
	// ON FULLSCREEN CHANGE
	document.addEventListener("webkitfullscreenchange", () => {
		if (document.fullscreenElement != null)
			document.getElementsByClassName("fullscreen")[0].textContent = "close_fullscreen";
		else
			document.getElementsByClassName("fullscreen")[0].textContent = "fullscreen";
	});
}
