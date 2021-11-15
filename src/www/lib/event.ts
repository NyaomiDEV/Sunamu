import { show, hide } from "./showhide.js";

// ON LOAD
document.addEventListener("DOMContentLoaded", () => {
	document.body.onmousemove = show;
	hide();
});

if (!document.documentElement.classList.contains("widget-mode")) {
	// ON FULLSCREEN CHANGE
	document.addEventListener("webkitfullscreenchange", () => {
		if (document.fullscreenElement != null)
			document.getElementsByClassName("fullscreen")[0].firstElementChild!.setAttribute("href", "assets/images/glyph.svg#close_fullscreen");
		else
			document.getElementsByClassName("fullscreen")[0].firstElementChild!.setAttribute("href", "assets/images/glyph.svg#fullscreen");
	});
}
