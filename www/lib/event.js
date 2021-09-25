// ON LOAD
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

// ON FULLSCREEN CHANGE
document.addEventListener("webkitfullscreenchange", () => {
	if (document.fullscreenElement != null)
		document.getElementById("fullscreen-icon").textContent = "close_fullscreen";
	else
		document.getElementById("fullscreen-icon").textContent = "fullscreen";
});