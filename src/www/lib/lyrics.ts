import lang from "./lang.js";
import songdata from "./songdata.js";
import owoify from "./owoify.js";

const container = document.getElementById("lyrics")!;
const copyright = document.getElementById("lyrics-copyright")!;
const glasscordUser = await window.np.shouldBullyGlasscordUser();

let isContainerHovered;

export function putLyricsInPlace() {
	// remove all children of container
	container.classList.remove("synchronized");
	// @ts-ignore
	while (container.firstChild) container.removeChild(container.lastChild);

	// remove text from footer
	copyright.textContent = "";

	// start checking for no lyrics
	if (!songdata.lyrics) {
		document.documentElement.classList.add("no-lyrics");

		const noLyrics = document.createElement("span");
		noLyrics.classList.add("line");
		noLyrics.textContent = lang.NO_LYRICS;
		container.appendChild(noLyrics);
		noLyrics.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
		return;
	}

	document.documentElement.classList.remove("no-lyrics");

	// we are good with lyrics so we push them all
	for (const line of songdata.lyrics.lines) {
		const elem = document.createElement("span");
		elem.classList.add("line");
		elem.textContent = glasscordUser ? owoify(line.text) : line.text; // y'all deserve it
		container.appendChild(elem);
	}

	// we put the synchronized flag
	if(songdata.lyrics.synchronized && songdata.reportsPosition)
		container.classList.add("synchronized");

	// we put the copyright where it is supposed to be
	copyright.textContent = lang.LYRICS_COPYRIGHT.replace("%PROVIDER%", songdata.lyrics.provider);
	if (songdata.lyrics.copyright)
		copyright.textContent += ` • ${songdata.lyrics.copyright}`;
}

export function updateActiveLyrics() {
	if (!songdata.lyrics?.synchronized)
		return;

	if (!songdata.reportsPosition){
		container.classList.remove("synchronized");
		return;
	}
	
	container.classList.add("synchronized");

	// we get the active one
	let lineIndex = songdata.lyrics.lines.length - 1;
	for (let i = -1; i < songdata.lyrics.lines.length; i++) {
		// @ts-ignore
		if (songdata.elapsed < songdata.lyrics.lines[i + 1]?.time) {
			lineIndex = i;
			break;
		}
	}

	// now we iterate through the container to unset previous active stuff
	const wasActiveBefore = container.children[lineIndex]?.classList?.contains("active");

	for (let i = 0; i < container.children.length; i++) {
		const line = container.children[i] as HTMLElement;
		if (i === lineIndex){
			line.classList?.add("active");
			line.removeAttribute("distance");
		}else{
			line.classList?.remove("active");
			const distance = Math.min(Math.abs(i - lineIndex), 6);
			line.setAttribute("distance", `${distance}`);
		}
	}

	// now we bring the active into view
	if (!wasActiveBefore && !isContainerHovered) {
		container.children[lineIndex]?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}
}

export function reCenter() {
	if(isContainerHovered) return;

	if (container.children.length === 1) {
		// assuming we only have one child so it is the no lyrics child
		document.getElementById("metadata")!.children[0].scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	} else {
		// we do have lyrics so we scroll to the active one
		container.getElementsByClassName("line active")[0]?.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "auto"
		});
	}
}

container.addEventListener("mouseenter", () => isContainerHovered = true);
container.addEventListener("mouseleave", () => {
	isContainerHovered = false;
	reCenter();
});

window.np.registerLyricsCallback!(() => {
	putLyricsInPlace();
});