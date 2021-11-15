import config from "./config.js";

// Set resolution
const map = {
	vga: 480,
	xga: 720,
	fhd: 1080,
	qhd: 1440,
	"4k": 2160
};

let resolution = "vga";

// compute smallest
const minLength = Math.min(screen.width, screen.height);

for(const key in map){
	if(minLength >= map[key])
		resolution = key;
}

document.documentElement.classList.add("resolution-" + resolution);

// Widget mode
if (await window.np.isWidgetMode())
	document.documentElement.classList.add("widget-mode");

// Font
if (config.font)
	(document.querySelector(":root") as HTMLElement).style.setProperty("--font-family", config.font);