import config from "./config.js";
import { isElectron } from "./util.js";

// OBS Studio
if (window.obsstudio)
	document.documentElement.classList.add("obs-studio");

// Electron
if (isElectron())
	document.documentElement.classList.add("electron");

// @ts-expect-error
if(document.fullscreenEnabled || document.webkitFullscreenEnabled)
	document.documentElement.classList.add("supports-fullscreen");

// Scenes
const sceneName = await window.np.getScene();

if(sceneName && config.scenes[sceneName]){
	const scene = config.scenes[sceneName];

	if(scene.font)
		(document.querySelector(":root") as HTMLElement).style.setProperty("--font-family", scene.font);

	// write widget mode from config if it exists
	if(typeof scene.widgetMode !== "undefined"){
		if (scene.widgetMode) document.documentElement.classList.add("widget-mode");
		else document.documentElement.classList.remove("widget-mode");
	}

	if (scene.nonInteractive) document.documentElement.classList.add("non-interactive");
	if (scene.static) document.documentElement.classList.add("static");
	if (scene.colorblock) document.documentElement.classList.add("colorblock");
	if (scene.defaultColorsAreInverted) document.documentElement.classList.add("inverted-default-colors");

	if (scene.forceIdle) {
		document.documentElement.classList.add("idle");
		document.documentElement.classList.add("force-idle");
	}
	
	if (scene.theme && scene.theme !== "default"){
		const themeLocation = await window.np.getThemeLocationFor(scene.theme);
		if(themeLocation){
			const styleNode = document.createElement("link");
			styleNode.rel = "stylesheet";
			styleNode.href = themeLocation;
			document.head.appendChild(styleNode);
		}
	}

	if (typeof scene.bgAnimation !== "undefined" && !scene.bgAnimation)
		document.documentElement.classList.add("no-bg-animation");

	if (typeof scene.showAlbumArt !== "undefined" && !scene.showAlbumArt)
		document.documentElement.classList.add("no-album-art");

	if (typeof scene.showControls !== "undefined" && !scene.showControls)
		document.documentElement.classList.add("no-controls");

	if (typeof scene.showExtraButtons !== "undefined" && !scene.showExtraButtons)
		document.documentElement.classList.add("no-extra-buttons");

	if (typeof scene.showPlayingIndicator !== "undefined" && !scene.showPlayingIndicator)
		document.documentElement.classList.add("no-playing-indicator");

	if (typeof scene.showLyrics !== "undefined" && !scene.showLyrics){
		document.documentElement.classList.add("no-show-lyrics");
		document.documentElement.classList.add("static"); // force it to be true
	}

	if (typeof scene.showScrobbles !== "undefined" && !scene.showScrobbles)
		document.documentElement.classList.add("no-show-scrobbles");

	if (typeof scene.showProgress !== "undefined" && !scene.showProgress)
		document.documentElement.classList.add("no-progress");

	if (typeof scene.lyricsBlur !== "undefined" && !scene.lyricsBlur)
		document.documentElement.classList.add("no-lyrics-blur");

	if (typeof scene.playerIcon !== "undefined" && !scene.playerIcon)
		document.documentElement.classList.add("no-player-icon");

	if (typeof scene.colors !== "undefined" && !scene.colors)
		document.documentElement.classList.add("no-colors");

	if (typeof scene.clickableLyrics !== "undefined" && !scene.clickableLyrics)
		document.documentElement.classList.add("no-clickable-lyrics");
}

if(sceneName && ["electron", "default"].includes(sceneName)){
	// overwrite with value reported by process arguments
	if (await window.np.isWidgetMode())
		document.documentElement.classList.add("widget-mode");
	else
		document.documentElement.classList.remove("widget-mode");
}