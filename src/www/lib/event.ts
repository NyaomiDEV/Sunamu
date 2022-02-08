import { show, hide } from "./showhide.js";

// ON LOAD
if (!document.documentElement.classList.contains("static")) {
	const events = () => {
		document.body.addEventListener("mouseenter", show);
		document.body.addEventListener("mouseleave", hide);
		hide();
	};

	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", events);
	else
		events();
}

if (!document.documentElement.classList.contains("widget-mode")) {
	// ON FULLSCREEN CHANGE
	const listener = () => {
		// @ts-ignore
		if (document.fullscreenElement || document.webkitFullscreenElement)
			document.getElementById("fullscreen")!.firstElementChild!.setAttribute("href", "assets/images/glyph.svg#close_fullscreen");
		else
			document.getElementById("fullscreen")!.firstElementChild!.setAttribute("href", "assets/images/glyph.svg#fullscreen");
	};
	document.addEventListener("webkitfullscreenchange", listener);
	document.addEventListener("fullscreenchange", listener);
}
