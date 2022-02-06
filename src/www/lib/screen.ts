import config from "./config.js";
import { isElectron } from "./util.js";

// Set resolution
const map = {
	qvga: 320,
	vga: 480,
	xga: 720,
	fhd: 1080,
	qhd: 1440,
	"4k": 2160
};

let resolution = Object.keys(map)[0];

// compute smallest
const minLength = Math.min(screen.width, screen.height);

for(const key in map){
	if(minLength >= map[key])
		resolution = key;
}

document.documentElement.classList.add("resolution-" + resolution);

// OBS Studio
if (window.obsstudio)
	document.documentElement.classList.add("obs-studio");

// Electron
if (isElectron())
	document.documentElement.classList.add("electron");

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

	if (typeof scene.showAlbumArt !== "undefined" && !scene.showAlbumArt)
		document.documentElement.classList.add("no-album-art");

	if (typeof scene.showControls !== "undefined" && !scene.showControls)
		document.documentElement.classList.add("no-controls");

	if (typeof scene.showExtraButtons !== "undefined" && !scene.showExtraButtons)
		document.documentElement.classList.add("no-extra-buttons");

	if (typeof scene.showInfo !== "undefined" && !scene.showInfo)
		document.documentElement.classList.add("no-info");

	if (typeof scene.showLyrics !== "undefined" && !scene.showLyrics)
		document.documentElement.classList.add("no-show-lyrics");

	if (typeof scene.showProgress !== "undefined" && !scene.showProgress)
		document.documentElement.classList.add("no-progress");
}

if(sceneName && ["electron", "default"].includes(sceneName)){
	// overwrite with value reported by process arguments
	if (await window.np.isWidgetMode())
		document.documentElement.classList.add("widget-mode");
	else
		document.documentElement.classList.remove("widget-mode");
}