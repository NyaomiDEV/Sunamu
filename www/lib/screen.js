const map = {
	vga: 480,
	xga: 720,
	fhd: 1080,
	qhd: 1440,
	"4k": 2160
};

let resolution = "vga";
for(const key in map){
	if(screen.height >= map[key])
		resolution = key;
}

document.documentElement.classList.add("resolution-" + resolution);