import lang from "./lang.js";
import songdata from "./songdata.js";
import owoify from "./owoify.js";

const container = document.getElementById("lyrics")!;
const copyright = document.getElementById("lyrics-copyright")!;
const glasscordUser = await window.np.shouldBullyGlasscordUser();

export function putLyricsInPlace() {
	// remove all children of container
	container.classList.remove("synchronized");
	// @ts-ignore
	while (container.firstChild) container.removeChild(container.lastChild);

	// remove text from footer
	copyright.textContent = "";

	// start checking for no lyrics
	if (!songdata.lyrics) {
		// we exploit the synchronized flex to center the no lyrics line
		container.classList.add("synchronized");

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

	// we are good with lyrics so we push them all
	for (const line of songdata.lyrics.lines) {
		const elem = document.createElement("span");
		elem.classList.add("line");
		elem.textContent = glasscordUser ? owoify(line.text) : line.text; // y'all deserve it
		container.appendChild(elem);
	}

	// we put the copyright where it is supposed to be
	copyright.textContent = `Provided by ${songdata.lyrics.provider}`;
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
		line.classList?.remove(
			"inactive-1",
			"inactive-2",
			"inactive-3",
			"inactive-4"
		);
		if (i === lineIndex)
			line.classList?.add("active");
		else{
			line.classList?.remove("active");
			const distance = Math.min(Math.abs(i - lineIndex), 4);
			line.classList?.add("inactive-" + distance);
		}
	}

	// now we bring the active into view
	if (!wasActiveBefore) {
		container.children[lineIndex]?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}
}

export function toggleLyricsView(show?: boolean) {
	if (document.documentElement.classList.contains("no-show-lyrics"))
		return;

	if (typeof show === "undefined")
		show = container.classList.contains("hidden");

	if (show) {
		document.getElementById("metadata")!.classList.add("hidden");
		container.classList.remove("hidden");
		copyright.classList.remove("hidden");

		reCenter();
		window.onresize = () => reCenter();
	} else {
		document.getElementById("metadata")!.classList.remove("hidden");
		container.classList.add("hidden");
		copyright.classList.add("hidden");

		window.onresize = null;
	}
}

function reCenter() {
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

window.np.registerLyricsCallback!(() => {
	putLyricsInPlace();
	if (document.documentElement.classList.contains("idle") && songdata.lyrics?.synchronized)
		toggleLyricsView(true);
});