import { show, hide } from "./showhide.js";

// ON LOAD
if(!document.documentElement.classList.contains("static")){
	if (document.readyState !== "loading") {
		document.body.onmousemove = show;
		document.body.ontouchmove = show;
		hide();
	} else {
		document.addEventListener("DOMContentLoaded", () => {
			document.body.onmousemove = show;
			document.body.ontouchmove = show;
			hide();
		});
	}
}

if (!document.documentElement.classList.contains("widget-mode")) {
	// ON FULLSCREEN CHANGE
	const listener = () => {
		// @ts-ignore
		if (document.fullscreenElement || document.webkitFullscreenElement)
			document.getElementsByClassName("fullscreen")[0].firstElementChild!.setAttribute("href", "assets/images/glyph.svg#close_fullscreen");
		else
			document.getElementsByClassName("fullscreen")[0].firstElementChild!.setAttribute("href", "assets/images/glyph.svg#fullscreen");
	};
	document.addEventListener("webkitfullscreenchange", listener);
	document.addEventListener("fullscreenchange", listener);
}
