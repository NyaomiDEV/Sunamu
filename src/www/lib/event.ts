import { reCenter } from "./lyrics.js";
import { show, hide } from "./showhide.js";

let delayedHideTimeout;

function delayedHide(){
	delayedHideTimeout = setTimeout(hide, 2000);
}

function resettingShow(){
	clearTimeout(delayedHideTimeout);
	show();
}

function showHideListener(){
	document.body.addEventListener("pointerenter", resettingShow);
	document.body.addEventListener("pointerleave", delayedHide);
	delayedHide();
}

function fullscreenListener(){
	// @ts-ignore
	if (document.fullscreenElement || document.webkitFullscreenElement) {
		document.documentElement.classList.add("fullscreen");
		document.getElementById("fullscreen")!.firstElementChild!.setAttribute("href", "assets/images/glyph.svg#close_fullscreen");
		document.body.addEventListener("pointermove", showHideListener_fullscreen);
		document.body.addEventListener("wheel", showHideListener_fullscreen);
		delayedHide();
	} else {
		document.documentElement.classList.remove("fullscreen");
		document.getElementById("fullscreen")!.firstElementChild!.setAttribute("href", "assets/images/glyph.svg#fullscreen");
		document.body.removeEventListener("pointermove", showHideListener_fullscreen);
		document.body.removeEventListener("wheel", showHideListener_fullscreen);
		resettingShow();
	}
}

function showHideListener_fullscreen(){
	resettingShow();
	delayedHide();
}

// ------------------

// ON RESIZE
window.addEventListener("resize", () => {
	reCenter();
});

// ON LOAD
if (!document.documentElement.classList.contains("static")) {
	if (document.readyState === "loading")
		document.addEventListener("load", showHideListener);
	else
		showHideListener();
}

// ON FULLSCREEN CHANGE
if (!document.documentElement.classList.contains("widget-mode")) {
	document.addEventListener("webkitfullscreenchange", fullscreenListener);
	document.addEventListener("fullscreenchange", fullscreenListener);
}

